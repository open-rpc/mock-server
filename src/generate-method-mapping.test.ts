import { forEach } from "lodash";
import { parseOpenRPCDocument } from "@open-rpc/schema-utils-js";
import examples from "@open-rpc/examples";
import { generateMethodMapping } from "./generate-method-mapping";
import { OpenRPC } from "@open-rpc/meta-schema";

describe("buildMethodHandlerMapping doesnt error on any examples", () => {
  forEach(examples, (example: OpenRPC, exampleName: string) => {
    it(exampleName, async () => {
      const parsedExample = await parseOpenRPCDocument(JSON.stringify(example)) as OpenRPC;
      const mapping = generateMethodMapping(parsedExample);
      expect(typeof mapping).toBe("object");
      expect(Object.keys(mapping).length).toBe(parsedExample.methods.length);
    });
  });
});
