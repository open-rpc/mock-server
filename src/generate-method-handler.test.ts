import { generateMethodHandler } from "./generate-method-handler";
import { types } from "@open-rpc/meta-schema";
import { MethodCallValidator } from "./method-call-validator";

describe("generateMethodHandler", () => {
  const exampleSchema = {
    info: {
      title: "123",
      version: "1",
    },
    methods: [
      {
        name: "foo",
        params: [{ name: "foofoo", schema: { type: "string" } }],
        result: { name: "foobar", schema: { type: "integer" } },
      },
    ],
    openrpc: "1.0.0-rc1",
  } as types.OpenRPC;

  it("returns a function given a method and a validator", () => {
    const exampleValidator = new MethodCallValidator(exampleSchema);
    expect(typeof generateMethodHandler(exampleSchema.methods[0], exampleValidator)).toBe("function");
  });

  it("the method handler validates args and returns invalid params error", (cb) => {
    const exampleValidator = new MethodCallValidator(exampleSchema);
    const methodHandler = generateMethodHandler(exampleSchema.methods[0], exampleValidator);
    methodHandler([123], (err: any, result: any) => {
      expect(err).toBeDefined();
      expect(err).toBeTruthy();
      expect(err.code).toBe(-32602);
      cb();
    });
  });

  it("the method handler returns a correct value if param is valid", (cb) => {
    const exampleValidator = new MethodCallValidator(exampleSchema);
    const methodHandler = generateMethodHandler(exampleSchema.methods[0], exampleValidator);
    methodHandler(["abc"], (err: any, result: any) => {
      expect(err).toBeUndefined();
      expect(typeof result).toBe("number");
      expect(result - Math.abs(result) < 0.0001).toBe(true);
      cb();
    });
  });
});
