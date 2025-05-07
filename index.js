const fp = require('fastify-plugin');
const { merge } = require('lodash');
const autoload = require('@fastify/autoload');
const fs = require('node:fs');

module.exports = fp(async (fastify, options) => {
  const { name: baseName, global, modules, options: otherOptions } = Object.assign({}, { modules: [] }, options);
  const proxy = { options: otherOptions };
  for (let [name, module] of modules) {
    const stat = typeof module === 'string' && (await fs.promises.stat(module).catch(() => {
    }));
    (() => {
      if (stat && stat.isDirectory()) {
        proxy[name] = {};
        fastify.register(autoload, {
          dir: module, options: otherOptions
        });
        return;
      }
      if (stat && stat.isFile()) {
        proxy[name] = {};
        fastify.register(require(module), otherOptions);
        return;
      }
      proxy[name] = module;
    })();
  }
  fastify.decorate(baseName, proxy);
  if (!fastify.hasDecorator('namespace')) {
    fastify.decorate('namespace', merge({}, fastify['namespace'], global));
  } else {
    fastify['namespace'] = merge({}, fastify['namespace'], global);
  }
}, {
  name: 'fastify-namespace'
});
