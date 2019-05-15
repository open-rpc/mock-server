#!/usr/bin/env node

import program = require("commander");
import server from "./";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import { OpenRPC } from "@open-rpc/meta-schema";

const version = require("../package.json").version; // tslint:disable-line

program
  .version(version, "-v, --version")
  .option(
    "-d, --document [openrpcDocument]",
    "JSON string or a Path/Url pointing to an open rpc schema",
    "./openrpc.json",
  )
  .option(
    "-p, --port [port]",
    "port to start from",
    3333,
  )
  .action(async () => {
    let openrpcDocument: OpenRPC;
    try {
      openrpcDocument = await parseOpenRPCDocument(program.document);
    } catch (e) {
      console.error(e.message); // tslint:disable-line
      console.error("Please revise the validation errors above and try again."); // tslint:disable-line
      return;
    }

    try {
      server(3333, openrpcDocument).start();
    } catch (e) {
      console.error(e);// tslint:disable-line
      process.exit(1);
    }
  })
  .parse(process.argv);
