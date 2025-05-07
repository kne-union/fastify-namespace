const Fastify = require('fastify');
const { test } = require('node:test');
const namespace = require('./index');

test('Test namespace', async t => {
  const fastify = Fastify();
  fastify.register(namespace, {
    name: 'testModule',
    modules: [['utils', '123456']]
  });
  await fastify.ready();
  t.assert.strictEqual(fastify.testModule.utils, '123456');
});
