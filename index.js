const fp = require('fastify-plugin');
const { merge, isPlainObject } = require('lodash');
const autoload = require('@fastify/autoload');
const fs = require('node:fs');

/**
 * 获取模块文件状态
 * @param {string} modulePath - 模块路径
 * @returns {Promise<fs.Stats|null>} 文件状态或null
 */
async function getModuleStat(modulePath) {
  if (typeof modulePath !== 'string') {
    return null;
  }
  return fs.promises.stat(modulePath).catch(() => null);
}

/**
 * 批量获取模块状态
 * @param {Array<[string, any]>} modules - 模块数组
 * @returns {Promise<Array<{name: string, module: any, stat: fs.Stats|null}>>}
 */
async function getModulesStats(modules) {
  return Promise.all(
    modules.map(async ([name, module]) => {
      const stat = await getModuleStat(module);
      return { name, module, stat };
    })
  );
}

/**
 * 注册单个模块到 Fastify
 * @param {Object} fastify - Fastify 实例
 * @param {Object} proxy - 代理对象
 * @param {string} name - 模块名称
 * @param {any} module - 模块值
 * @param {fs.Stats|null} stat - 文件状态
 * @param {Object} pluginOptions - 插件选项
 */
function registerModule(fastify, proxy, name, module, stat, pluginOptions) {
  if (!stat) {
    proxy[name] = module;
    return;
  }

  proxy[name] = {};
  
  if (stat.isDirectory()) {
    fastify.register(autoload, { dir: module, options: pluginOptions });
  } else if (stat.isFile()) {
    fastify.register(require(module), pluginOptions);
  }
}

/**
 * 处理数组类型的模块
 * @param {Object} fastify - Fastify 实例
 * @param {Array<[string, any]>} modules - 模块数组
 * @param {string} namespaceName - 命名空间名称
 * @param {Object} pluginOptions - 插件选项
 * @returns {Promise<Object>} 目标模块对象
 */
async function processArrayModules(fastify, modules, namespaceName, pluginOptions) {
  const proxy = { options: pluginOptions };
  const stats = await getModulesStats(modules);
  
  for (let { name, module, stat } of stats) {
    registerModule(fastify, proxy, name, module, stat, pluginOptions);
  }
  
  fastify.decorate(namespaceName, proxy);
  return proxy;
}

/**
 * 获取目标模块
 * @param {any} modules - 模块配置
 * @returns {any} 目标模块
 */
function getTargetModule(modules) {
  if (isPlainObject(modules) || typeof modules === 'function') {
    return modules;
  }
  throw new Error('modules必须是数组或对象或方法');
}

/**
 * 初始化命名空间装饰器
 * @param {Object} fastify - Fastify 实例
 */
function initNamespaceDecorator(fastify) {
  if (!fastify.hasDecorator('namespace')) {
    fastify.decorate('namespace', {
      mountEvents: [],
      modules: {},
      global: {}
    });
  }
}

/**
 * 更新命名空间
 * @param {Object} fastify - Fastify 实例
 * @param {string} namespaceName - 命名空间名称
 * @param {any} global - 全局配置
 * @param {any} targetModule - 目标模块
 * @param {Function|null} onMount - 挂载回调
 */
function updateNamespace(fastify, namespaceName, global, targetModule, onMount) {
  const currentGlobal = merge({}, fastify.namespace.global, global);
  fastify.namespace = {
    ...currentGlobal,
    mountEvents: typeof onMount === 'function' ? [...fastify.namespace.mountEvents, onMount] : fastify.namespace.mountEvents,
    modules: Object.assign({}, fastify.namespace.modules, {
      [namespaceName]: targetModule
    }),
    global: currentGlobal
  };
}

/**
 * 触发挂载事件
 * @param {Object} fastify - Fastify 实例
 * @param {string} namespaceName - 命名空间名称
 */
function triggerMountEvents(fastify, namespaceName) {
  for (let mountEvent of fastify.namespace.mountEvents) {
    mountEvent(namespaceName);
  }
}

module.exports = fp(
  async (fastify, options) => {
    const { name: namespaceName, global, modules, options: pluginOptions, onMount } = Object.assign({}, { modules: [] }, options);
    
    let targetModule;
    if (Array.isArray(modules)) {
      targetModule = await processArrayModules(fastify, modules, namespaceName, pluginOptions);
    } else {
      targetModule = getTargetModule(modules);
    }

    initNamespaceDecorator(fastify);
    updateNamespace(fastify, namespaceName, global, targetModule, onMount);
    triggerMountEvents(fastify, namespaceName);
  },
  {
    name: 'fastify-namespace'
  }
);
