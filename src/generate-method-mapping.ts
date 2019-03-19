const jsf = require("json-schema-faker");
import { mock } from "mock-json-schema";
import Ajv from "ajv";
import * as _ from "lodash";
import { types } from "@open-rpc/meta-schema";
import { MethodHandlerType, JSONRPCCallbackType } from "jayson/promise";

const generateResponse = async (method: types.MethodObject, args: any): Promise<any> => {
  const result = method.result as types.ContentDescriptorObject;
  const schemaForResponse = result.schema;

  if (method.examples) {
    const argList = method.paramStructure === 'by-name' ? Object.values(args) : args;

    const examples = method.examples as types.ExamplePairingObject[];

    const foundExample = _.find(
      examples,
      ({ params }) => _.isMatchWith(params, argList, (exV, argV) => _.map(exV, 'value') === argV)
    );
    if (foundExample) {
      const foundExampleResult = foundExample.result as types.ExampleObject;
      return foundExampleResult.value;
    }
  }
  const generatedValue = await jsf.generate(schemaForResponse);
  return generatedValue;
};

const makeHandler = (method: types.MethodObject, validator: Ajv.Ajv): MethodHandlerType => {
  return async function(args: any, callback: JSONRPCCallbackType) {
    const validationErrors = _.chain(method.params)
      .map((param: types.ContentDescriptorObject, index) => {
        const paramId = method.paramStructure === 'by-name' ? param.name : index;
        const methodParamName = `${method.name}/${paramId}`;
        var isValid = validator.validate(methodParamName, args[paramId]);

        if (!isValid) { return { param: paramId, errors: validator.errors }; }
      })
      .compact()
      .value();

    if (validationErrors.length > 0) {
      const err = this.error(-32602);

      err.data = validationErrors;
      cb(err, null);
      return;
    }

    cb(null, await generateResponse(method, args));
  };
};

interface memo { [k: string]: MethodHandlerType };

export const buildMethodHandlerMapping = (openrpcSchema: types.OpenRPC) => {
  return openrpcSchema.methods.reduce((memo, method: types.MethodObject) => {
    const { name, paramStructure, params, result } = method;

    if (params) {
      params.forEach((param: types.ContentDescriptorObject, i) => {
        if (!param.schema && !param.name) {
          console.log(params, result);
        }

        if (param.schema !== undefined) {
          paramsValidator.addSchema(param.schema, `${name}/${paramStructure === 'by-name' ? param.name : i}`)
        }
      });
    }

    memo[name] = makeHandler(method, paramsValidator);
    return memo;
  }, {} as memo);
};
