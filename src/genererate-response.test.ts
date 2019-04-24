import { generateResponse } from "./genererate-response";
import { MethodObject } from "@open-rpc/meta-schema";

describe("generateResponse", () => {
  describe("default case - no examples", () => {
    it("returns a generated value based on the method and args", async () => {
      const exampleMethod = {
        name: "foo",
        params: [],
        result: { name: "bar", schema: { type: "string" } },
      };
      const result = await generateResponse(exampleMethod, []);
      expect(typeof result).toBe("string");
    });

  });

  describe("with examples", () => {
    it("returns value if params matches an example", async () => {
      const exampleMethod = {
        examples: [
          {
            name: "testy",
            params: [{ name: "tats", value: 123 }],
            result: { name: "yum", value: 321 },
          },
        ],
        name: "foo",
        params: [],
        result: { name: "bar", schema: { type: "number" } },
      };
      const result = await generateResponse(exampleMethod, [123]);
      expect(result).toBe(321);
    });
    it("works when params are by name", async () => {
      const exampleMethod = {
        examples: [
          {
            name: "testy",
            params: [{ name: "tats", value: 123 }],
            result: { name: "bar", value: 321 },
          },
        ],
        name: "foo",
        paramStructure: "by-name",
        params: [{ name: "tats", schema: { type: "number" } }],
        result: { name: "bar", schema: { type: "number" } },
      } as MethodObject;

      const result = await generateResponse(exampleMethod, { tats: 123 });
      expect(result).toBe(321);
    });
  });
});
