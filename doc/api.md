### 配置选项

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| name | string | - | 命名空间的唯一标识符，通过 `fastify.<name>` 访问该命名空间 |
| modules | Array<[string, string\|object\|function]> | [] | 模块配置数组，每个元素是 `[模块名, 模块]` 元组 |
| global | object | {} | 全局共享对象，会与 `fastify.namespace.global` 进行深度合并 |
| options | object | {} | 传递给被加载模块的选项对象，文件和目录模块都会收到此配置 |
| onMount | function | - | 挂载钩子函数，当命名空间注册完成时调用 |

### 模块配置

| 参数名 | 类型 | 说明 |
|--------|------|------|
| [0] | string | 模块名称，用于在命名空间中访问 |
| [1] | string\|object\|function | 模块路径、对象或函数 |

### 装饰器

| 装饰器名 | 类型 | 说明 |
|----------|------|------|
| fastify.<name> | object | 当前命名空间的代理对象，包含该命名空间下所有模块 |
| fastify.namespace | object | 全局命名空间对象，包含所有已注册的命名空间信息 |
| fastify.namespace.modules | Record<string, object> | 所有已注册的命名空间模块的集合 |
| fastify.namespace.global | object | 合并后的全局配置对象 |
| fastify.namespace.mountEvents | Function[] | 挂载事件回调数组，存储所有 onMount 回调 |
