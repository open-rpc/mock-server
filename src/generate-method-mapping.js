const jsf = require('json-schema-faker');
const Ajv = require('ajv');

const generateResponse = async (method) => {
  if (method === undefined) { return 'method not found: ' + method.name; }

  const schemaForResponse = method.result.schema;

  const generatedValue = await jsf.generate(schemaForResponse);
  return generatedValue;
};

const makeHandler = (method, validator) => {
  return async (args, cb) => {
    if (method.paramStructure === 'by-name') {
    } else {
      console.log(args);
    }
    validator.validate(args);

    const exampleValue = await generateResponse(method);
    cb(null, exampleValue);
  };
};

const buildMethodHandlerMapping = (openrpcSchema) => {
  return openrpcSchema.methods.reduce((memo, method) => {
    const  {name, paramStructure, params, result} = method;
    const paramsValidator = new Ajv();
    if (params) {
      params.forEach((param) => paramsValidator.addSchema(param.name, param.schema));
    }
    memo[name] = makeHandler(method, paramsValidator);
    return memo;
  }, {});
};

module.exports = buildMethodHandlerMapping;
