import { OpenRPC } from "@open-rpc/meta-schema";
import { Server } from "@open-rpc/server-js";
import { THTTPServerTransportOptions } from "@open-rpc/server-js/build/src/transports/http";
import { TTransportNames } from "@open-rpc/server-js/build/src/transports";
import { IMockModeSettings } from "@open-rpc/server-js/build/src/router";

const server = (port: number, openrpcDocument: OpenRPC) => {

  const options = {
    methodMapping: { mockMode: true } as IMockModeSettings,
    openrpcDocument,
    transportConfigs: [
      {
        options: {
          middleware: [],
          port,
        } as THTTPServerTransportOptions,
        type: "HTTPTransport" as TTransportNames,
      },
    ],
  };

  return new Server(options);
};

export default server;
