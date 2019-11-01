# Migration from 2.x to 3.x

## What' new

* Support for Typescript. Intact intelligent code completion.

## How to upgrade

1. Update `react-imvc` to 3.x

    npm

    ```console
    npm install --save react-imvc
    ```

    or yarn

    ```console
    yarn add react-imvc
    ```

2. Add typescript support

    (1) add install typescript

    npm

    ```console
    npm install --save-dev typescript
    ```

    or yarn

    ```console
    yarn add -D typescript
    ```

    (2) add tsconfig.json

    template: [tsconfig.json](https://github.com/Lucifier129/react-imvc/blob/master/tsconfig.json)

    If you just want to use the config same with *react-imvc* and don't want to change any config information, you can create a `tsconfig.json` file with the content down here.

    ```json
    {
      "extends": "react-imvc/tsconfig.json"
    }
    ```

    (3) add tslint.json(not necessary)

    template: [tslint.json](https://github.com/Lucifier129/react-imvc/blob/master/tslint.json)  
    If you use the template file, you need to install `tslint-config-standard` and `tslint-config-prettier`.

    npm

    ```console
    npm  install --save-dev tslint tslint-config-standard tslint-config-prettier
    ```

    or yarn

    ```console
    yarn add -D tslint tslint-config-standard tslint-config-prettier
    ```

3. Change `js|jsx` postfix to `ts|tsx` postfix

    You need to rename file postfix needed.

    If there are some code lack of standardization in you project, it will throw syntactic. eg.

    the way import module lack of standardization

    ```js
    // bad
    const foo = require('foo')

    // bad
    let foo = require('foo')

    // not suggest
    import foo = require('foo)
    ```

    You can't use syntax of `ES2015+` and syntax of `CommonJS`.

    You can do it like code down here.

    ```js
    // good
    // CommonJS
    var foo = require('foo')

    // better and suggest
    // ES2015+
    import foo from 'foo'
    ```

    We suggest you to use the `ES2015+` syntax, it will support all the feature of TypeScript.

    There must be some spots else that we haven't record here. When you find please tell to me, we will append it here to help other people.

4. Refactor `Model` module

    (1) Import `BaseState` to construct new `State` type

    ```typescript
    import { BaseState } from 'react-imvc'
    export type State = BaseState & {
        // some new feild
    }
    ```

    (2) Import `Action` to construct action type

    without `payload`

    ```typescript
    import { Action } from 'react-imvc'

    export const COMPONENT_WILL_CREATE: Action<State> = (state) => {
        // do somethings
        return {
            ...state,
            // add some new value
        }
    }
    ```

    with `payload`

    ```typescript
    import { Action } from 'react-imvc'

    export interface Payload { /* payload feild */ }
    export const COMPONENT_WILL_CREATE: Action<State, Payload> = (state, { /* payload */ }) => {
        // do somethings
        return {
            ...state,
            // add some new value
        }
    }
    ```

5. Refactor `View` module

    (1) import `State` from `Model`

    ```typescript
    import { State } from './Model'
    ```

    (2) import `Ctrl` from `Controller`

    ```typescript
    import Ctrl from './Controller'
    ```

    (3) Construct `ViewProps` type

    ```typescript
    export type ViewProps = {
        state: State,
        ctrl: Ctrl
    }
    ```

    (4) Add `ViewProps` to `View` Component

    ```typescript
    export default function View({ state, ctrl }: ViewProps) {
        // do somethings
    }
    ```

6. Refactor `Controller` module

    (1) Import `View` and `Model`

    ```typescript
    import View from "./View"
    import * as Model from "./Model"
    ```

    (2) Get the `Actions` type

    ```typescript
    // typescript: 3.6.x
    export type Action = Omit<typeof Model, 'initialState'>

    // typescript: 3.5.x
    export type Action = Pick<typeof Model, Exclude<keyof typeof Model, 'initialState'>>
    ```

    (3) Construct `Controller` class

    ```typescript
    class Detail extends Controller<Model.State, Actions> {
        View = View
        Model = Model
        // do somethings
    }
    ```

Note: If you has the `BaseController`, please look through how did we do in [isomorphic-cnode](https://github.com/Lucifier129/isomorphic-cnode)

## Notions when migrating

* Don't change or override the type of attribute is `BaseState`, it will happen unpredictable error.

* Both `shouldComponentCreate` and `componentWillCreate` is support both `sync` and `async` two mode programming. But when you extends Controller and overwrite these two method it's mode will be settled. If these are some mix usage. you must fix it by choose one mode(suggest `async`).

* The default view file extension is 'js'. If you want to use other extension file, please add in config.(eg.view.tsx)

* Props of `View` have changed from `state, handlers, actions` to `state, ctrl`.

* If you start by line command with config file(eg.`imvc.config.js`). You must write config file with `CommonJS` and `ES5` syntax(not support `ES6` or `Typescript` syntax yet).

## Dependence change

### Upgrade

* chalk 1.1.3 -> 2.4.2
* pnp-webpack-plugin 1.2.0 -> 1.5.0
* fork-ts-checker-webpack-plugin 0.5.2 -> 1.4.3
* terser-webpack-plugin 1.1.0 -> 1.3.0
* chalk 2.4.2 1.1.3 -> 2.4.2
* create-app 1.0.0 -> 2.0.3
* debug 2.2.0 -> 4.1.1
* del 3.0.0 -> 5.0.0
* express-react-views 0.10.5 -> 0.11.0
* fork-ts-checker-webpack-plugin 0.5.2 -> 1.4.3
* gulp-clean-css 4.0.4 -> 4.0.2
* pnp-webpack-plugin 1.2.0 -> 1.5.0
* relite 1.0.6 -> 3.0.2
* terser-webpack-plugin 1.1.0 -> 1.3.0
* yargs 8.0.2 -> 13.3.0

### Add

* @types/babel-core 6.25.6
* @types/body-parser 1.17.0
* @types/classnames 2.2.9
* @types/compression 0.0.36
* @types/cookie-parser 1.4.1
* @types/cross-spawn 6.0.0
* @types/debug 4.1.4
* @types/express 4.17.0
* @types/fancy-log 1.3.1
* @types/gulp 4.0.6
* @types/gulp-babel 6.1.29
* @types/gulp-htmlmin 1.3.32
* @types/gulp-imagemin 4.1.1
* @types/gulp.plumber 0.0.32
* @types/gulp-uglify 3.0.6
* @types/helmet 0.0.43
* @types/js-cookie 2.2.2
* @types/memory-fs 0.3.2
* @types/morgan 1.7.36
* @types/node 10.12.24
* @types/node-fetch 2.5.0
* @types/node-notifier 5.4.0
* @types/raf 3.4.0
* @types/react 16.8.2
* @types/react-dom 16.8.0
* @types/resolve 0.0.8
* @types/serve-favicon 2.2.30
* @types/terser-webpack-plugin 1.2.1
* @types/webpack 4.32.1
* @types/webpack-bundle-analyzer 2.13.2
* @types/webpack-dev-middleware 2.0.3
* @types/webpack-hot-middleware 2.16.5
* @types/webpack-manifest-plufin 2.0.0
* @types/yargs 13.0.1
* fs-extra 8.1.0

### Delete

* expect 1.20.2
* mocha 3.0.2
* querystring 0.2.0
