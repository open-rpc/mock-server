import { forEach } from "lodash";
import { parse } from "@open-rpc/schema-utils-js";
import examples from "@open-rpc/examples";
import { types } from "@open-rpc/meta-schema";
import { generateMethodMapping } from "./generate-method-mapping";

describe("buildMethodHandlerMapping doesnt error on any examples", () => {
  forEach(examples, (example: types.OpenRPC, exampleName: string) => {
    it(exampleName, async () => {
      const parsedExample = await parse(JSON.stringify(example));
      const mapping = generateMethodMapping(parsedExample);
      expect(typeof mapping).toBe("object");
      expect(Object.keys(mapping).length).toBe(parsedExample.methods.length);
    });
  });
});
