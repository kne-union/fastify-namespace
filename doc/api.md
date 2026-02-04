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

### 配置选项说明

| 属性名 | 详细说明 |
|--------|----------|
| `name` | 命名空间的唯一标识符，通过 `fastify.<name>` 访问该命名空间 |
| `modules` | 模块配置数组，每个元素是一个元组 `[name, module]`，其中 module 可以是文件路径、目录路径、对象或函数 |
| `global` | 全局共享对象，会与 `fastify.namespace.global` 进行深度合并 |
| `options` | 传递给被加载模块的选项对象，文件模块和目录模块都会收到此配置 |
| `onMount` | 挂载钩子函数，当命名空间注册完成时调用，接收 `(fastify, name)` 两个参数 |

### 装饰器属性

| 属性名 | 说明 | 类型 |
|--------|------|------|
| `fastify.<name>` | 当前命名空间的代理对象，包含该命名空间下所有模块 | object |
| `fastify.namespace.modules` | 所有已注册的命名空间模块的集合 | Record<string, object> |
| `fastify.namespace.global` | 合并后的全局配置对象 | object |
| `fastify.namespace.mountEvents` | 挂载事件回调数组，存储所有 onMount 回调 | Function[] |
