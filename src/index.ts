import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import { OpenRPC } from "@open-rpc/meta-schema";
import { Server } from "@open-rpc/server-js";
import { THTTPServerTransportOptions } from "@open-rpc/server-js/build/transports/http";
import { TTransportNames } from "@open-rpc/server-js/build/transports";
import { IMockModeSettings } from "@open-rpc/server-js/build/router";

const server = async (protocol: string, port: number | string, schemaLocation: any) => {
  const openrpcDocument = await parseOpenRPCDocument(schemaLocation) as OpenRPC;

  const options = {
    methodMapping: { mockMode: true } as IMockModeSettings,
    openrpcDocument,
    transportConfigs: [
      {
        options: { port: 8002 } as THTTPServerTransportOptions,
        type: "HTTPTransport" as TTransportNames,
      },
    ],
  };

  return new Server(options);
};

module.exports = server;
