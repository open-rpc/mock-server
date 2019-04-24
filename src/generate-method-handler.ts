import { Ajv } from "ajv";
import { JSONRPCCallbackTypePlain, JSONRPCError } from "jayson/promise";
import * as _ from "lodash";
import { generateResponse } from "./genererate-response";
import { MethodCallValidator } from "@open-rpc/schema-utils-js";
import { MethodObject } from "@open-rpc/meta-schema";

export const generateMethodHandler = (
  method: MethodObject,
  validator: MethodCallValidator,
) => {
  return async (args: any, cb: any) => {
    const validationErrors = validator.validate(method.name, args);

    if (validationErrors.length > 0) {
      const error = { code: -32602, data: validationErrors, message: "Invalid parameters" } as JSONRPCError;
      cb(error);
      return;
    }

    cb(undefined, await generateResponse(method, args));
  };
};
