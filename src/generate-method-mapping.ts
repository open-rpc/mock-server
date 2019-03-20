import { types } from "@open-rpc/meta-schema";
import { MethodHandlerType } from "jayson/promise";
import { MethodCallValidator } from "@open-rpc/schema-utils-js";
import { generateMethodHandler } from "./generate-method-handler";

export interface IMemo { [k: string]: MethodHandlerType; }

export const generateMethodMapping = (openrpcSchema: types.OpenRPC) => {
  const validator = new MethodCallValidator(openrpcSchema);

  return openrpcSchema.methods.reduce((memo, method: types.MethodObject) => {
    memo[method.name] = generateMethodHandler(method, validator);
    return memo;
  }, {} as IMemo);
};
