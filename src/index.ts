import * as jayson from "jayson";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import { generateMethodMapping } from "./generate-method-mapping";
import cors from "cors";
import { json as jsonParser } from "body-parser";
import connect, { HandleFunction } from "connect";
import { RequestHandler } from "express-serve-static-core";
import { OpenRPC } from "@open-rpc/meta-schema";

const server = async (protocol: string, port: number | string, schemaLocation: any) => {
  const app = connect();
  const schema = await parseOpenRPCDocument(schemaLocation) as OpenRPC;
  const methods = {
    ...generateMethodMapping(schema),
    "rpc.discover": (args: any, cb: any) => {
      cb(null, schema);
    },
  };
  const jsonRpcServer = new jayson.Server(methods);
  const corsMiddleware = cors({ origin: "*" }) as RequestHandler;

  app.use(cors({ origin: "*" }) as HandleFunction);
  app.use(jsonParser());
  app.use(jsonRpcServer.middleware() as unknown as HandleFunction);
  app.listen(port);
};

module.exports = server;
