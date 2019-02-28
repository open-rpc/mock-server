const openRpcExamples = require('@open-rpc/examples');
const buildMethodHandlerMapping = require('./generate-method-mapping');

describe('buildMethodHandlerMapping doesnt error on any examples', () => {
  const exampleNames = Object.keys(openRpcExamples);
  exampleNames.forEach((exampleName) => {
    it(exampleName, () => {
      const example = openRpcExamples[exampleName];
      const mapping = buildMethodHandlerMapping(example);
      expect(typeof mapping).toBe('object');
      expect(Object.keys(mapping).length).toBe(example.methods.length);
    });
  });
});
