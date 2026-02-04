const fp = require('fastify-plugin');
const { merge, isPlainObject } = require('lodash');
const autoload = require('@fastify/autoload');
const fs = require('node:fs');

module.exports = fp(
  async (fastify, options) => {
    const { name: baseName, global, modules, options: otherOptions, onMount } = Object.assign({}, { modules: [] }, options);
    let targetModule;
    if (Array.isArray(modules)) {
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
      targetModule = proxy;
    } else if (isPlainObject(modules) || typeof modules === 'function') {
      targetModule = modules;
    } else {
      throw new Error('modules必须是数组或对象或方法');
    }

    if (!fastify.hasDecorator('namespace')) {
      fastify.decorate('namespace', {
        mountEvents: [],
        modules: {},
        global: {}
      });
    }

    const currentGlobal = merge({}, fastify['namespace'].global, global);
    fastify['namespace'] = {
      ...currentGlobal,
      mountEvents: typeof onMount === 'function' ? [...fastify['namespace'].mountEvents, onMount] : fastify['namespace'].mountEvents,
      modules: Object.assign({}, fastify['namespace'].modules, {
        [baseName]: targetModule
      }),
      global: currentGlobal
    };
    for (let mountEvent of fastify['namespace'].mountEvents) {
      mountEvent(baseName);
    }
  },
  {
    name: 'fastify-namespace'
  }
);
