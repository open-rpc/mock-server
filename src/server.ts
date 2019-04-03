import { parse } from "@open-rpc/schema-utils-js";
import { generateMethodMapping } from "./generate-method-mapping";
import cors from "cors";
import { json as jsonParser } from "body-parser";
import connect, { HandleFunction } from "connect";
import { RequestHandler } from "express-serve-static-core";
import { types } from "@open-rpc/meta-schema";

const server = async (protocol: string, port: number | string, schemaLocation: any) => {
  const app = connect();
  const schema = await parse(schemaLocation) as types.OpenRPC;
  const methods = {
    ...generateMethodMapping(schema),
    "rpc.discover": (args: any, cb: any) => {
      cb(null, schema);
    },
  } as any;
  const corsMiddleware = cors({ origin: "*" }) as RequestHandler;

  app.use(cors({ origin: "*" }) as HandleFunction);
  app.use(jsonParser());
  app.use((req: any, res: any) => {
    const jsonrpcRequest = req.body;
    methods[jsonrpcRequest.method](req.params, (err: any, result: any) => {
      res.end({
        id: req.body.id,
        jsonrpc: "2.0",
        result,
      });
    });
  });
  app.listen(port);
};

module.exports = server;
