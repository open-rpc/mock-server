#!/usr/bin/env node

import program = require("commander");
import server, { serviceMode } from "./";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import { OpenrpcDocument as OpenRPC } from "@open-rpc/meta-schema";

const version = require("../package.json").version; // tslint:disable-line

program
  .version(version, "-v, --version")
  .option(
    "-d, --document <OpenRPC>",
    "JSON string or a Path/Url pointing to an open rpc schema",
    "./openrpc.json",
  )
  .option(
    "-p, --port <number>",
    "port to start from",
    parseInt,
  )
  .option(
    "-m, --mode <string>",
    "use this option to run mock-server as a service.",
    "local",
  )
  .action(async () => {
    if (program.mode === "service") {
      const serviceModeDoc = await parseOpenRPCDocument(`${__dirname}/service-mode-openrpc.json`);
      return serviceMode(program.port || 3333, serviceModeDoc).start();
    }

    let openrpcDocument: OpenRPC;
    try {
      openrpcDocument = await parseOpenRPCDocument(program.document);
    } catch (e) {
      console.error(e.message); // tslint:disable-line
      console.error("Please revise the validation errors above and try again."); // tslint:disable-line
      return;
    }

    try {
      server(program.port || 3333, openrpcDocument).start();
    } catch (e) {
      console.error(e);// tslint:disable-line
      process.exit(1);
    }
  })
  .parse(process.argv);
