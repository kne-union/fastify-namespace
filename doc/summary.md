#### 功能概述
`fastify-namespace` 是一个轻量且强大的 Fastify 插件，旨在解决复杂项目中的模块化管理和命名空间隔离问题。它提供了优雅的自动加载机制，能够智能识别并加载目录或文件模块，为每个模块创建独立的命名空间代理，避免命名冲突。

该插件的核心优势在于其灵活的全局配置合并功能，支持多个命名空间间的数据共享与隔离，特别适合 API 版本管理、插件聚合等场景。通过 `onMount` 钩子机制，开发者可以在模块挂载时执行自定义逻辑，实现更精细的控制。简洁的 API 设计和直观的配置方式，使得即使是大型项目也能轻松实现模块化的架构组织，提升代码的可维护性和可扩展性。

#### 核心功能

##### 1. 模块自动加载
- **文件模块**：自动 require 指定的 JS 文件
- **目录模块**：自动加载目录下的所有文件（使用 @fastify/autoload）

#### 配置选项
```javascript
{
  name: 'mySpace',      // 必填，命名空间名称
  modules: [            // 模块列表
    ['module1', './path/to/file.js'],
    ['module2', './path/to/directory'],
    ['func1', func1],
    ['obejct1', object1]
  ],
  global: {              // 可选，全局变量
    config: 'value';
  },
  options: {            // 可选，传递给模块的选项
    prefix: '/v1';
  }
}
```

#### 实际应用场景

##### 场景1：API 版本管理
```javascript
fastify.register(fastifyNamespace, {
  name: 'v1',
  modules: [
    ['auth', './api/v1/auth'],
    ['users', './api/v1/users']
  ],
  global: { apiVersion: 1 }
});

fastify.register(fastifyNamespace, {
  name: 'v2',
  modules: [
    ['auth', './api/v2/auth'],
    ['users', './api/v2/users']
  ],
  global: { apiVersion: 2 }
});
```

##### 场景2：插件聚合
```javascript
fastify.register(fastifyNamespace, {
  name: 'plugins',
  modules: [
    ['swagger', './plugins/swagger'],
    ['socketio', './plugins/socketio']
  ]
});
```

#### 最佳实践
1. 建议将相关功能模块组织在单独的目录中
2. 对于大型项目，可以分层级使用多个命名空间
3. 通过 `fastify.namespace` 访问合并后的全局命名空间
4. 模块路径建议使用绝对路径
5. 命名空间名称不能重复