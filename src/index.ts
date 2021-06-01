import { OpenrpcDocument as OpenRPC, MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { Server, ServerOptions } from "@open-rpc/server-js";
import _ from "lodash";
import { MethodMapping } from "@open-rpc/server-js/build/router";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import examples from "@open-rpc/examples";

const makePrefix = (sluggedDocumentTitle: string, version: string) => {
  return `${_.camelCase(sluggedDocumentTitle)}-${version}-`;
};

const exNames = Object.values(examples).map((doc: OpenrpcDocument) => makePrefix(doc.info.title, doc.info.version));

const prefixToDocumentMap: { [k: string]: OpenrpcDocument } = {};

const createServiceMethodMapping = (s: Server, document: OpenRPC): MethodMapping => {
  return {
    mock: async (openrpcDocument: OpenRPC) => {
      const prefix = makePrefix(openrpcDocument.info.title, openrpcDocument.info.version);
      const prefixedOpenRPCDocument = {
        ...openrpcDocument,
        methods: _.map(
          (openrpcDocument.methods as MethodObject[]),
          (method: MethodObject): MethodObject => ({ ...method, name: `${prefix}${method.name}` })),
      } as OpenRPC;

      prefixedOpenRPCDocument.methods.push();

      const parsedDoc = await parseOpenRPCDocument(prefixedOpenRPCDocument);
      prefixToDocumentMap[prefix] = openrpcDocument;
      const router = s.addRouter(parsedDoc, { mockMode: true });

      if (exNames.indexOf(makePrefix(openrpcDocument.info.title, openrpcDocument.info.version)) === -1) {
        setTimeout(() => s.removeRouter(router), 15 * 60 * 1000);
      }

      console.log("New service added: ", prefix); // eslint-disable-line

      return prefix.slice(0, -1);
    },
  };
};

export const serviceMode = (port: number, openrpcDocument: OpenRPC) => {
  const options = {
    openrpcDocument,
    transportConfigs: [
      {
        options: {
          middleware: [
            (req: any, res: any, next: () => void) => {
              if (req.url === "/") { return next(); }

              const url: string = req.url.replace("/", "");
              const [title, version] = url.split("-");
              const prefix = makePrefix(title, version);

              if (req.body.method === "rpc.discover") {
                res.setHeader("Content-Type", "application/json");
                const response = {
                  id: req.body.id,
                  jsonrpc: "2.0",
                  result: prefixToDocumentMap[prefix],
                };
                res.end(JSON.stringify(response));
                return;
              }
              req.body.method = `${prefix}${req.body.method}`;
              return next();
            },
          ],
          port,
        },
        type: "HTTPTransport",
      },
    ],
  } as ServerOptions;

  const serviceServer = new Server(options);

  const methodMapping = createServiceMethodMapping(serviceServer, openrpcDocument);
  serviceServer.addRouter(openrpcDocument, methodMapping);
  console.log(`Created Server with options: port - ${port}`); // eslint-disable-line
  return serviceServer;
};

const server = (port: number, openrpcDocument: OpenRPC) => {

  const options = {
    methodMapping: { mockMode: true },
    openrpcDocument,
    transportConfigs: [
      {
        options: {
          middleware: [],
          port,
        },
        type: "HTTPTransport",
      },
    ],
  } as ServerOptions;

  return new Server(options);
};

export default server;
