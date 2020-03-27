import { exec } from "child_process";
import examples from "@open-rpc/examples";

import * as http from "http";

const data = JSON.stringify({
  id: 1,
  jsonrpc: "2.0",
  method: "addition",
  params: [2, 2],
});

const options = {
  hostname: "0.0.0.0",
  port: 3333,
  path: "/",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

describe("cli", () => {
  it("can be run with an example", async (done) => {
    const childProc = exec(`node ./build/cli.js -d '${JSON.stringify(examples.simpleMath)}'`);

    setTimeout(() => {
      const req = http.request(options, (res: any) => {
        expect(res.statusCode).toBe(200);

        res.on("data", (d: any) => {
          expect(JSON.parse(d).result).toBe(4);
          childProc.kill("SIGHUP");
          done();
        });
      });

      req.on("error", (error: any) => { throw error; });
      req.write(data);
      req.end();
    }, 1000);
  });
});
