
# fastify-namespace


### 描述

用于管理 Fastify 插件命名空间的 Node.js 模块，提供自动加载、命名空间管理和全局配置合并功能


### 安装

```shell
npm i --save @kne/fastify-namespace
```


### 概述

`fastify-namespace` 是一个轻量且强大的 Fastify 插件，旨在解决复杂项目中的模块化管理和命名空间隔离问题。它提供了优雅的自动加载机制，能够智能识别并加载目录或文件模块，为每个模块创建独立的命名空间代理，避免命名冲突。

该插件的核心优势在于其灵活的全局配置合并功能，支持多个命名空间间的数据共享与隔离，特别适合 API 版本管理、插件聚合等场景。通过 `onMount` 钩子机制，开发者可以在模块挂载时执行自定义逻辑，实现更精细的控制。简洁的 API 设计和直观的配置方式，使得即使是大型项目也能轻松实现模块化的架构组织，提升代码的可维护性和可扩展性。


### 示例

#### 示例代码



### API

### 核心配置项

| 属性名 | 说明 | 类型 | 默认值 | 必填 |
|--------|------|------|--------|------|
| `name` | 命名空间名称 | string | - | 是 |
| `modules` | 模块配置数组 | Array<[string, string\|object\|function]> | [] | 是 |
| `global` | 全局共享变量 | object | {} | 否 |
| `options` | 传递给模块的选项 | object | {} | 否 |
| `onMount` | 模块挂载时的回调函数 | function | - | 否 |

### 模块配置项

| 属性名 | 说明 | 类型 | 示例 |
|--------|------|------|------|
| `[0]` | 模块名称 | string | `'users'` |
| `[1]` | 模块路径/对象/函数 | string\|object\|function | `'./routes/users.js'` 或 `userService` |

### 类型定义 (TypeScript)

```typescript
interface NamespaceOptions {
  name: string;
  modules: Array<[string, string | object | Function]>;
  global?: Record<string, any>;
  options?: Record<string, any>;
  onMount?: (fastify: FastifyInstance, name: string) => void;
}
```

### 装饰器属性

| 属性名 | 说明 | 类型 |
|--------|------|------|
| `fastify.<name>` | 当前命名空间的代理对象 | object |
| `fastify.namespace.modules` | 所有已注册的命名空间模块 | Record<string, object> |
| `fastify.namespace.global` | 合并后的全局配置 | object |
| `fastify.namespace.mountEvents` | 挂载事件回调数组 | Function[] |

