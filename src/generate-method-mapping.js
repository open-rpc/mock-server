const jsf = require('json-schema-faker');
const Ajv = require('ajv');
const _ = require('lodash');

const generateResponse = async (method) => {
  if (method === undefined) { return 'method not found: ' + method.name; }

  const schemaForResponse = method.result.schema;

  const generatedValue = await jsf.generate(schemaForResponse);
  return generatedValue;
};

const makeHandler = (method, validator) => {
  return async function(args, cb)  {
    let validationErrors;
    if (method.paramStructure === 'by-name') {
    } else {
      validationErrors = _.chain(method.params)
        .map((param, index) => {
          const methodParamName = `${method.name}/${index}`;
          var isValid = validator.validate(methodParamName, args[index]);

          if (!isValid) {
            return { param: method.paramStructure === 'by-name' ? param.name : index, errors: validator.errors };
          }
        })
        .compact()
        .value();
    }

    let response;
    if (validationErrors.length > 0) {
      const err = this.error(-32602);
      err.data = validationErrors;
      cb(err, null);
      return;
    }

    cb(null, await  generateResponse(method));
  };
};

const buildMethodHandlerMapping = (openrpcSchema) => {
  return openrpcSchema.methods.reduce((memo, method) => {
    const  {name, paramStructure, params, result} = method;

    const paramsValidator = new Ajv();
    if (params) {
      params.forEach((param, i) => paramsValidator.addSchema(param.schema, `${name}/${paramStructure === 'by-name' ? param.name : i}`));
    }
    memo[name] = makeHandler(method, paramsValidator);
    return memo;
  }, {});
};

module.exports = buildMethodHandlerMapping;
