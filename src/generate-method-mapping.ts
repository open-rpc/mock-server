import Ajv from "ajv";
import * as _ from "lodash";
import { types } from "@open-rpc/meta-schema";
import { MethodHandlerType, JSONRPCCallbackType } from "jayson/promise";
import { generateResponse } from "./genererate-response";
import { makeIdForMethodContentDescriptors } from "@open-rpc/schema-utils-js";

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
          paramsValidator.addSchema(param.schema, makeIdForMethodContentDescriptors(method, param));
        }
      });
    }

    memo[name] = makeHandler(method, paramsValidator);
    return memo;
  }, {} as memo);
};
