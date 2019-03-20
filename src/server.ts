import * as jayson from "jayson";
import { parse } from "@open-rpc/schema-utils-js";
import { generateMethodMapping } from "./generate-method-mapping";
import cors from "cors";
import { json as jsonParser } from "body-parser";
import connect, { HandleFunction } from "connect";
import { RequestHandler } from "express-serve-static-core";

const server = async (protocol: string, port: number | string, schemaLocation: any) => {
  const app = connect();
  const schema = await parse(schemaLocation);
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
  app.use(jsonRpcServer.middleware() as HandleFunction);
  app.listen(port);
  console.log(`service is listening on port ${port} via the ${protocol} protocol`);
};

module.exports = server;
