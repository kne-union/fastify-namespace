import { FastifyPluginAsync, FastifyInstance } from 'fastify';

type ModuleValue = string | Record<string, any> | Function;

type Modules = Array<[string, ModuleValue]> | Record<string, ModuleValue> | Function;

interface NamespaceOptions {
  name: string;
  global?: Record<string, any>;
  modules?: Modules;
  options?: Record<string, any>;
  onMount?: (namespaceName: string) => void;
}

interface Namespace {
  mountEvents: Array<(namespaceName: string) => void>;
  modules: Record<string, any>;
  global: Record<string, any>;
}

declare module 'fastify' {
  interface FastifyInstance {
    namespace: Namespace;
  }
}

declare const fastifyNamespace: FastifyPluginAsync<NamespaceOptions>;

export default fastifyNamespace;
