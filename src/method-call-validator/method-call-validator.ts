import Ajv, { ErrorObject } from "ajv";
import * as _ from "lodash";
import { makeIdForMethodContentDescriptors } from "@open-rpc/schema-utils-js";
import { types } from "@open-rpc/meta-schema";
import { ParameterValidationError } from "./parameter-validation-error";

export class MethodCallValidator {
  private ajvValidator: Ajv.Ajv;

  constructor(private schema: types.OpenRPC) {
    this.ajvValidator = new Ajv();

    schema.methods.forEach((method: types.MethodObject) => {
      const params = method.params as types.ContentDescriptorObject[];
      if (method.params === undefined) { return; }

      params.forEach((param: types.ContentDescriptorObject, i: number) => {
        if (param.schema === undefined) { return; }

        this.ajvValidator.addSchema(param.schema, makeIdForMethodContentDescriptors(method, param));
      });
    });
  }

  public validate(methodName: string, params: any[]) {
    const method = _.find(this.schema.methods, { name: methodName }) as types.MethodObject;

    if (method.params === undefined) {
      return [];
    }

    return _.chain(method.params)
      .map((param: types.ContentDescriptorObject, index: number) => {
        if (param.schema === undefined) { return; }

        const idForMethod = makeIdForMethodContentDescriptors(method, param);
        const isValid = this.ajvValidator.validate(idForMethod, params[index]);
        const errors = this.ajvValidator.errors as ErrorObject[];

        if (!isValid) {
          return new ParameterValidationError(index, param.schema, params[index], errors);
        }
      })
      .compact()
      .value();
  }
};
