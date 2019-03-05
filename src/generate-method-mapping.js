const jsf = require('json-schema-faker');
const Ajv = require('ajv');
const _ = require('lodash');

const generateResponse = async (method, args) => {
  if (method === undefined) { return 'method not found: ' + method.name; }

  const schemaForResponse = method.result.schema;

  if (method.examples) {
    const argList = method.paramStructure === 'by-name' ? Object.values(args) : args;
    const foundExample = method.examples.find((example) => {
      return JSON.stringify(example.params.map((p) => p.value)) === JSON.stringify(argList);
    });
    if (foundExample) {
      return foundExample.result.value;
    }
  }

  const generatedValue = await jsf.generate(schemaForResponse);
  return generatedValue;
};

const makeHandler = (method, validator) => {
  return async function(args, cb)  {
    const validationErrors = _.chain(method.params)
      .map((param, index) => {
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

const buildMethodHandlerMapping = (openrpcSchema) => {
  return openrpcSchema.methods.reduce((memo, method) => {
    const  {name, paramStructure, params, result} = method;
    const paramsValidator = new Ajv();
    if (params) {
      params.forEach((param, i) => {
        if (!param.schema && !param.name) {
          console.log(params, result);
        }
        paramsValidator.addSchema(param.schema, `${name}/${paramStructure === 'by-name' ? param.name : i}`)
      });
    }
    memo[name] = makeHandler(method, paramsValidator);
    return memo;
  }, {});
};

module.exports = buildMethodHandlerMapping;
