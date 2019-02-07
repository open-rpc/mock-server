const jayson = require('jayson');
const parseSchema = require('@open-rpc/schema-utils-js');
const buildMethodHandlerMapping = require('./generate-method-mapping');

const server = async (protocol, port, schemaLocation) => {
  const schema = await parseSchema(schemaLocation);
  const server = jayson.server(buildMethodHandlerMapping(schema));
  server[protocol]().listen(port);
  console.log(`service is listening on port ${port} via the ${protocol} protocol`);
};

module.exports = server;
