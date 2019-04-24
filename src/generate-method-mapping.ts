import { MethodHandlerType } from "jayson/promise";
import { MethodCallValidator } from "@open-rpc/schema-utils-js";
import { generateMethodHandler } from "./generate-method-handler";
import { OpenRPC, MethodObject } from "@open-rpc/meta-schema";

export interface IMemo { [k: string]: MethodHandlerType; }

export const generateMethodMapping = (openrpcSchema: OpenRPC) => {
  const validator = new MethodCallValidator(openrpcSchema);

  return openrpcSchema.methods.reduce((memo, method: MethodObject) => {
    memo[method.name] = generateMethodHandler(method, validator);
    return memo;
  }, {} as IMemo);
};
