const jsf = require('json-schema-faker');

const generateResponse = async (schema, methodName) => {
  const method = schema.methods[methodName];

  if (method === undefined) { return 'method not found: ' + methodName; }

  const schemaForResponse = method.results.schema;

  const generatedValue = jsf.generate(schemaForResponse);

  return generatedValue;
};

const buildMethodHandlerMapping = (schema) => {
  return schema.methods.reduce((result, methodObject) => {
    result[methodObject.name] = (args, cb) => {
      return cb(null, generateResponse(schema, methodObject.name));
    };
    return result;
  }, {});
};

module.exports = buildMethodHandlerMapping;
