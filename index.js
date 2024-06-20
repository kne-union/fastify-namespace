const fp = require('fastify-plugin');
const autoload = require('@fastify/autoload');
const fs = require('fs');
module.exports = fp(
  async (fastify, options) => {
    const { name: baseName, modules, options: otherOptions } = options;
    const proxy = { options: otherOptions };
    for (let [name, module] of modules) {
      const stat = typeof module === 'string' && (await fs.promises.stat(module));
      (() => {
        if (stat && stat.isDirectory()) {
          proxy[name] = {};
          fastify.register(autoload, {
            dir: module,
            options: otherOptions
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
  },
  {
    name: 'fastify-namespace'
  }
);
