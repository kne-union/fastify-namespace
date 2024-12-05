import Fastify from 'fastify';
import { test } from 'node:test';
import namespace from './index.js';

test('Test namespace', async t => {
  const fastify = Fastify();
  fastify.register(namespace, {
    name: 'testModule', modules: [['utils', '123456']]
  });
  await fastify.ready();
  t.assert.strictEqual(fastify.testModule.utils, '123456');
});
