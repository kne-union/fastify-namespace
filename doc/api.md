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