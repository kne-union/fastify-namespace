import fp from 'fastify-plugin';
import autoload from '@fastify/autoload';
import fs from 'node:fs';

const namespace = fp(
  async (fastify, options) => {
    const { name: baseName, global, modules, options: otherOptions } = Object.assign({}, { modules: [] }, options);
    const proxy = { options: otherOptions };
    for (let [name, module] of modules) {
      const stat = typeof module === 'string' && (await fs.promises.stat(module).catch(() => {}));
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
    fastify.decorate('namespace', Object.assign({}, fastify['namespace'], global));
  },
  {
    name: 'fastify-namespace'
  }
);

export default namespace;
