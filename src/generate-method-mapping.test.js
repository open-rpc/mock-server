const openRpcExamples = require('@open-rpc/examples');
const parseSchema = require('@open-rpc/schema-utils-js');
const buildMethodHandlerMapping = require('./generate-method-mapping');
const refParser = require('json-schema-ref-parser');

describe('buildMethodHandlerMapping doesnt error on any examples', () => {
  const exampleNames = Object.keys(openRpcExamples);
  exampleNames.forEach((exampleName) => {
    it(exampleName, async () => {
      const example = openRpcExamples[exampleName];
      const derefExample = await refParser.dereference(example);
      const mapping = buildMethodHandlerMapping(derefExample);
      expect(typeof mapping).toBe('object');
      expect(Object.keys(mapping).length).toBe(derefExample.methods.length);
    });
  });
});
