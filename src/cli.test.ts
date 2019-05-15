import { exec } from "child_process";
import examples from "@open-rpc/examples";

describe("cli", () => {
  it("can be run with an example", (done) => {
    exec(`node ./build/cli.js -d '${JSON.stringify(examples.simpleMath)}'`, (error, stdout, stderr) => {
      console.log(error, stdout, stderr); // tslint:disable-line
      expect(error).toBe(null);
      done();
    });
  });
});
