const jsf = require('json-schema-faker');
const Djv = require('djv');

const generateResponse = async (schema, methodName) => {
  const method = schema.methods[methodName];

  if (method === undefined) { return 'method not found: ' + methodName; }

  const schemaForResponse = method.result.schema;

  const generatedValue = jsf.generate(schemaForResponse);

  return generatedValue;
};

const makeHandler = (paramStructure, openrpcSchema, name, validator) => {
  return (args, cb) => {
    if (paramStructure === 'by-name') {
    } else {
      console.log(args);
    }
    validator.validate(args);
    return cb(null, generateResponse(openrpcSchema, name));
  };
};

const buildMethodHandlerMapping = (openrpcSchema) => {
  return openrpcSchema.methods.reduce((memo, {name, paramStructure, params, result}) => {
    const paramsValidator = new Djv();
    if (params) {
      params.forEach((param) => paramsValidator.addSchema(param.name, param.schema));
    }
    memo[name] = makeHandler(paramStructure, openrpcSchema, name, paramsValidator);
    return memo;
  }, {});
};

module.exports = buildMethodHandlerMapping;
