import { OpenRPC } from "@open-rpc/meta-schema";
import { Server, IServerOptions } from "@open-rpc/server-js";

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
