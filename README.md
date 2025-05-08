
# fastify-namespace


### 描述

用于管理 Fastify 插件命名空间的 Node.js 模块，提供自动加载、命名空间管理和全局配置合并功能


### 安装

```shell
npm i --save @kne/fastify-namespace
```


### 概述

#### 功能概述
`fastify-namespace` 是一个 Fastify 插件，用于实现模块的自动化命名空间管理和动态加载。主要功能包括：
- 自动检测并加载目录/文件模块
- 为模块创建命名空间代理
- 维护全局命名空间合并
- 支持多版本 API 管理
- 提供全局共享数据功能

#### 核心功能

##### 1. 模块自动加载
- **文件模块**：自动 require 指定的 JS 文件
- **目录模块**：自动加载目录下的所有文件（使用 @fastify/autoload）

##### 2. 全局命名空间
```javascript
// 访问全局命名空间
fastify.namespace.version // => '1.0.0'
```

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

### 示例

#### 示例代码



### API

#### 核心配置项

| 属性名       | 说明       | 类型                                        | 默认值 | 必填 |
|-----------|----------|-------------------------------------------|-----|----|
| `name`    | 命名空间名称   | string                                    | -   | 是  |
| `modules` | 模块配置数组   | Array<[string, string\|object\|function]> | []  | 是  |
| `global`  | 全局共享变量   | object                                    | {}  | 否  |
| `options` | 传递给模块的选项 | object                                    | {}  | 否  |

#### 模块配置项

| 属性名   | 说明         | 类型                       | 示例                                    |
|-------|------------|--------------------------|---------------------------------------|
| `[0]` | 模块名称       | string                   | `'users'`                             |
| `[1]` | 模块路径/对象/函数 | string\|object\|function | `'./routes/users.js'` 或 `userService` |

#### 类型定义 (TypeScript)

```typescript
interface NamespaceOptions {
  name: string;
  modules: Array<[string, string | object | Function]>;
  global?: Record<string, any>;
  options?: Record<string, any>;
}
```
