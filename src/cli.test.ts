import { exec } from "child_process";
import examples from "@open-rpc/examples";

import http from "http";

describe("cli", () => {
  it("can be run with an example", (done) => {
    const data = JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "addition",
      params: [2, 2],
    });

    const options = {
      hostname: "localhost",
      port: 3333,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };
    const childProc = exec(`node ./build/cli.js -d '${JSON.stringify(examples.simpleMath)}'`);

    setTimeout(() => {
      const req = http.request(options, (res: any) => {
        expect(res.statusCode).toBe(200);

        res.on("data", (d: any) => {
          expect(JSON.parse(d.toString()).result).toBe(4);
          childProc.kill("SIGHUP");
          setTimeout(done, 2000);
        });
      });

      req.on("error", (error: any) => { throw error; });
      req.write(data);
      req.end();
    }, 1000);
  }, 10000);

  it("can run in service mode", (done) => {
    const childProc = exec(`node ./build/cli.js -m service`);

    const requestBody = JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "mock",
      params: [examples.simpleMath],
    });

    const reqObj = {
      hostname: "0.0.0.0",
      port: 3333,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": requestBody.length,
      },
    };

    setTimeout(() => {
      const req = http.request(reqObj, (res: any) => {
        expect(res.statusCode).toBe(200);

        res.on("data", (d: any) => {
          expect(JSON.parse(d.toString()).result).toBe("simpleMath-1.0.0");
          req.removeAllListeners();

          const simpleMathReqBody = JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "addition",
            params: [2, 2],
          });

          const simpleMathReqObj = {
            hostname: "localhost",
            port: 3333,
            path: "/simpleMath-1.0.0",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": simpleMathReqBody.length,
            },
          };
          const insideReq = http.request(simpleMathReqObj, (insideRes: any) => {
            expect(insideRes.statusCode).toBe(200);

            insideRes.on("data", (insideD: any) => {
              expect(JSON.parse(insideD.toString()).result).toBe(4);
              childProc.kill("SIGHUP");
              insideReq.removeAllListeners();
              setTimeout(done, 2000);
            });
          });

          insideReq.on("error", (error: any) => { throw error; });
          insideReq.write(simpleMathReqBody);
          insideReq.end();
        });
      });

      req.on("error", (error: any) => { throw error; });
      req.write(requestBody);
      req.end();
    }, 5000);
  }, 15000);
});
