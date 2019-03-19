const jsf = require("json-schema-faker"); // tslint:disable-line

import { types } from "@open-rpc/meta-schema";
import { find, isMatch, map } from "lodash";

export const generateResponse = async (method: types.MethodObject, args: any): Promise<any> => {
  const result = method.result as types.ContentDescriptorObject;
  const schemaForResponse = result.schema;

  if (method.examples) {
    const argList = method.paramStructure === "by-name" ? Object.values(args) : args;

    const examples = method.examples as types.ExamplePairingObject[];

    const foundExample = find(
      examples,
      ({ params }) => isMatch(map(params, "value"), argList),
    );
    if (foundExample) {
      const foundExampleResult = foundExample.result as types.ExampleObject;
      return foundExampleResult.value;
    }
  }
  const generatedValue = await jsf.generate(schemaForResponse);
  return generatedValue;
};
