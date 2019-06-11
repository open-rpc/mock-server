import { OpenRPC, MethodObject } from "@open-rpc/meta-schema";
import { Server, IServerOptions, Router } from "@open-rpc/server-js";
import _ from "lodash";
import { IMethodMapping } from "@open-rpc/server-js/build/router";

const makePrefix = (sluggedDocumentTitle: string, version: string) => {
  return `${_.camelCase(sluggedDocumentTitle)}-${version}-`;
}

const serviceMode = (port: number, openrpcDocument: OpenRPC) => {
  const options = {
    openrpcDocument,
    transportConfigs: [
      {
        options: {
          middleware: [
            (req: any, res: any, next: () => void) => {
              if (url === "/") { return next(); }

              const url: string = req.url;
              const [title, version] = url.split("/");
              const prefix = makePrefix(title, version);

              const body: any = req.body; // should apply json-rpc types to this
              body.method = `${prefix}${body.method}`;
              return next();
            }
          ],
          port,
        },
        type: "HTTPTransport",
      },
    ],
  } as IServerOptions;

  const serviceServer = new Server(options);

  const methodMapping = {
    mock: (openrpcDocument: OpenRPC) => {
      // 1 - change method names to have prefix
      const prefix = makePrefix(openrpcDocument.info.title, openrpcDocument.info.version);
      const prefixedOpenRPCDocument = {
        ...openrpcDocument,
        methods: _.map(openrpcDocument.methods, (method: MethodObject): MethodObject => ({ ...method, name: `${prefix}${method.name}` })),
      } as OpenRPC;

      // 2 - create a router with the prefixed document using mockMode
      // 3 - add the router to the current server
      const router = serviceServer.addRouter(prefixedOpenRPCDocument, { mockMode: true });

      // 4 - setTimeout 15m and remove the router
      setTimeout(() => serviceServer.removeRouter(router), 15 * 60 * 1000);
    }
  } as IMethodMapping;

  serviceServer.addRouter(openrpcDocument, methodMapping);

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
  } as IServerOptions;

  return new Server(options);
};

export default server;
