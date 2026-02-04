const Fastify = require('fastify');
const { expect } = require('chai');
const namespace = require('../index');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

describe('@kne/fastify-namespace', function() {
  describe('插件注册测试', () => {
    it('should add decorator with default options', async () => {
      const fastify = Fastify();
      await fastify.register(namespace);
      await fastify.ready();
      expect(fastify.namespace).to.exist;
      await fastify.close();
    });

    it('should add namespace decorator to fastify instance when given valid name', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'testModule',
        modules: []
      });
      await fastify.ready();
      expect(fastify.namespace).to.exist;
      expect(fastify.testModule).to.exist;
      await fastify.close();
    });

    it('should use custom options when given options', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'testModule',
        modules: [['utils', 'value1']],
        global: { key: 'globalValue' }
      });
      await fastify.ready();
      expect(fastify.testModule).to.exist;
      expect(fastify.testModule.utils).to.equal('value1');
      await fastify.close();
    });
  });

  describe('核心功能测试', () => {
    it('should register simple value modules when given array modules', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'testModule',
        modules: [['utils', '123456'], ['config', { key: 'value' }]]
      });
      await fastify.ready();
      expect(fastify.testModule.utils).to.equal('123456');
      expect(fastify.testModule.config).to.deep.equal({ key: 'value' });
      await fastify.close();
    });

    it('should store plugin options in namespace when given options', async () => {
      const fastify = Fastify();
      const pluginOptions = { option1: 'value1' };
      await fastify.register(namespace, {
        name: 'testModule',
        modules: [['utils', 'value']],
        options: pluginOptions
      });
      await fastify.ready();
      expect(fastify.testModule.options).to.deep.equal(pluginOptions);
      await fastify.close();
    });

    it('should register plain object module when given object modules', async () => {
      const fastify = Fastify();
      const objectModule = {
        utils: 'value1',
        config: { key: 'value2' }
      };
      await fastify.register(namespace, {
        name: 'testModule',
        modules: objectModule
      });
      await fastify.ready();
      expect(fastify.namespace.modules.testModule).to.deep.equal(objectModule);
      await fastify.close();
    });

    it('should register function module when given function modules', async () => {
      const fastify = Fastify();
      const functionModule = () => ({ data: 'test' });
      await fastify.register(namespace, {
        name: 'testModule',
        modules: functionModule
      });
      await fastify.ready();
      expect(fastify.namespace.modules.testModule).to.equal(functionModule);
      await fastify.close();
    });

    it('should merge global configurations when registering multiple modules', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'module1',
        modules: [],
        global: { common: 'value1', module1: 'specific1' }
      });
      await fastify.register(namespace, {
        name: 'module2',
        modules: [],
        global: { common: 'value2', module2: 'specific2' }
      });
      await fastify.ready();
      expect(fastify.namespace.global).to.deep.equal({
        common: 'value2',
        module1: 'specific1',
        module2: 'specific2'
      });
      await fastify.close();
    });

    it('should store multiple namespace modules when registering with different names', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'module1',
        modules: [['utils', 'value1']]
      });
      await fastify.register(namespace, {
        name: 'module2',
        modules: [['config', 'value2']]
      });
      await fastify.ready();
      expect(fastify.namespace.modules.module1).to.exist;
      expect(fastify.namespace.modules.module2).to.exist;
      await fastify.close();
    });

    it('should initialize namespace decorator when first registration', async () => {
      const fastify = Fastify();
      expect(fastify.hasDecorator('namespace')).to.be.false;
      await fastify.register(namespace, {
        name: 'module1',
        modules: []
      });
      await fastify.ready();
      expect(fastify.hasDecorator('namespace')).to.be.true;
      await fastify.close();
    });

    it('should call onMount callback after registration when given onMount function', async () => {
      const fastify = Fastify();
      const mountEvents = [];
      
      await fastify.register(namespace, {
        name: 'module1',
        modules: [],
        onMount: (name) => mountEvents.push(name)
      });
      
      await fastify.register(namespace, {
        name: 'module2',
        modules: [],
        onMount: (name) => mountEvents.push(name)
      });
      
      await fastify.ready();
      expect(mountEvents).to.include('module1');
      expect(mountEvents).to.include('module2');
      await fastify.close();
    });

    it('should trigger all mount events when new module is registered', async () => {
      const fastify = Fastify();
      const events = [];
      
      await fastify.register(namespace, {
        name: 'module1',
        modules: [],
        onMount: (name) => events.push(`event1:${name}`)
      });
      
      await fastify.register(namespace, {
        name: 'module2',
        modules: [],
        onMount: (name) => events.push(`event2:${name}`)
      });
      
      await fastify.register(namespace, {
        name: 'module3',
        modules: []
      });
      
      await fastify.ready();
      expect(events).to.include('event1:module1');
      expect(events).to.include('event1:module2');
      expect(events).to.include('event1:module3');
      expect(events).to.include('event2:module2');
      expect(events).to.include('event2:module3');
      await fastify.close();
    });
  });

  describe('参数优先级测试', () => {
    it('should get from highest priority source when file path exists', async () => {
      const fastify = Fastify();
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fastify-namespace-test-'));
      const moduleDir = path.join(tempDir, 'test-plugin');
      fs.mkdirSync(moduleDir, { recursive: true });
      
      const pluginFile = path.join(moduleDir, 'plugin.js');
      fs.writeFileSync(pluginFile, `
        module.exports = async function(fastify, options) {
          fastify.decorate('priorityTest', 'file');
        };
        module.exports[Symbol.for('skip-override')] = true;
        module.exports[Symbol.for('fastify.display-name')] = 'priority-plugin';
      `);

      await fastify.register(namespace, {
        name: 'testModule',
        modules: [['priorityModule', pluginFile]]
      });
      await fastify.ready();
      expect(fastify.priorityTest).to.equal('file');
      await fastify.close();
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should fallback to simple value when file path does not exist', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'testModule',
        modules: [['fallbackModule', '/non/existent/path']]
      });
      await fastify.ready();
      expect(fastify.testModule.fallbackModule).to.equal('/non/existent/path');
      await fastify.close();
    });
  });

  describe('文件系统模块测试', () => {
    let tempDir;

    beforeEach(async () => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fastify-namespace-test-'));
    });

    afterEach(async () => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should register directory module with autoload when given directory path', async () => {
      const moduleDir = path.join(tempDir, 'test-plugin');
      fs.mkdirSync(moduleDir, { recursive: true });
      
      const pluginFile = path.join(moduleDir, 'index.js');
      fs.writeFileSync(pluginFile, `
        module.exports = async function(fastify, options) {
          fastify.decorate('dirDecorator', 'loaded');
        };
        module.exports[Symbol.for('skip-override')] = true;
        module.exports[Symbol.for('fastify.display-name')] = 'dir-plugin';
      `);

      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'testModule',
        modules: [['testPlugin', moduleDir]]
      });
      await fastify.ready();
      expect(fastify.testModule.testPlugin).to.be.an('object').that.is.empty;
      expect(fastify.dirDecorator).to.equal('loaded');
      await fastify.close();
    });

    it('should register file module when given file path', async () => {
      const moduleDir = path.join(tempDir, 'test-plugin');
      fs.mkdirSync(moduleDir, { recursive: true });
      
      const pluginFile = path.join(moduleDir, 'plugin.js');
      fs.writeFileSync(pluginFile, `
        module.exports = async function(fastify, options) {
          fastify.decorate('fileDecorator', 'loaded');
        };
        module.exports[Symbol.for('skip-override')] = true;
        module.exports[Symbol.for('fastify.display-name')] = 'file-plugin';
      `);

      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'testModule',
        modules: [['filePlugin', pluginFile]]
      });
      await fastify.ready();
      expect(fastify.testModule.filePlugin).to.be.an('object').that.is.empty;
      expect(fastify.fileDecorator).to.equal('loaded');
      await fastify.close();
    });
  });

  describe('边界情况测试', () => {
    it('should handle empty modules array when given empty array', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'testModule',
        modules: []
      });
      await fastify.ready();
      expect(fastify.testModule).to.exist;
      expect(fastify.testModule.options).to.be.undefined;
      await fastify.close();
    });

    it('should handle null module path when given null', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'testModule',
        modules: [['utils', null]]
      });
      await fastify.ready();
      expect(fastify.testModule.utils).to.be.null;
      await fastify.close();
    });

    it('should handle non-string module path when given non-string', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'testModule',
        modules: [['utils', undefined]]
      });
      await fastify.ready();
      expect(fastify.testModule.utils).to.be.undefined;
      await fastify.close();
    });

    it('should ignore non-function onMount when given non-function', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'module1',
        modules: [],
        onMount: 'not a function'
      });
      await fastify.ready();
      expect(fastify.namespace.mountEvents).to.be.an('array').that.is.empty;
      await fastify.close();
    });

    it('should handle missing options gracefully when given empty object', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {});
      await fastify.ready();
      expect(fastify.namespace).to.exist;
      await fastify.close();
    });

    it('should handle undefined modules when no modules provided', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: 'testModule'
      });
      await fastify.ready();
      expect(fastify.testModule).to.exist;
      await fastify.close();
    });

    it('should throw error when given invalid module type', async () => {
      const fastify = Fastify();
      try {
        await fastify.register(namespace, {
          name: 'testModule',
          modules: 'invalid'
        });
        await fastify.ready();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('modules必须是数组或对象或方法');
      } finally {
        await fastify.close();
      }
    });

    it('should handle null name when given null name', async () => {
      const fastify = Fastify();
      await fastify.register(namespace, {
        name: null,
        modules: []
      });
      await fastify.ready();
      expect(fastify.namespace.modules).to.be.an('object');
      await fastify.close();
    });
  });
});
