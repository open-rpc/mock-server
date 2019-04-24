const jsf = require("json-schema-faker"); // tslint:disable-line

import { find, isMatch, map } from "lodash";
import { ExampleObject, ExamplePairingObject, ContentDescriptorObject, MethodObject } from "@open-rpc/meta-schema";

export const generateResponse = async (method: MethodObject, args: any): Promise<any> => {
  const result = method.result as ContentDescriptorObject;
  const schemaForResponse = result.schema;

  if (method.examples) {
    const argList = method.paramStructure === "by-name" ? Object.values(args) : args;

    const examples = method.examples as ExamplePairingObject[];

    const foundExample = find(
      examples,
      ({ params }) => isMatch(map(params, "value"), argList),
    );
    if (foundExample) {
      const foundExampleResult = foundExample.result as ExampleObject;
      return foundExampleResult.value;
    }
  }
  const generatedValue = await jsf.generate(schemaForResponse);
  return generatedValue;
};
