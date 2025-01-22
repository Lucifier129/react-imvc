/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="jest" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
  }
}
