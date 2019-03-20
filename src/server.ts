const jayson = require('jayson');
const { parse } = require('@open-rpc/schema-utils-js');
const generateMethodMapping = require('./generate-method-mapping');
const cors = require('cors');
const jsonParser = require('body-parser').json;
const connect = require('connect');

const server = async (protocol, port, schemaLocation) => {
  const app = connect();
  const schema = await parse(schemaLocation);
  const methods = {
    ...generateMethodMapping(schema),
    'rpc.discover': (args, cb) => {
      cb(null, schema);
    }
  };
  const server = jayson.server(methods);
  app.use(cors({ origin: '*' }));
  app.use(jsonParser());
  app.use(server.middleware());
  app.listen(port);
  console.log(`service is listening on port ${port} via the ${protocol} protocol`);
};

module.exports = server;
