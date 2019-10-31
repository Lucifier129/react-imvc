// base controller class
import 'whatwg-fetch'
import express from 'express'
import React from 'react'
import Cookie from 'js-cookie'
import querystring from 'query-string'
import {
  createStore,
  Store,
  Data,
  Actions,
  Curring,
  Currings
} from 'relite'
import {
  Controller as AppController,
  Actions as HistoryActions,
  HistoryLocation,
  createHistory,
  Matcher,
  Loader,
  CacheStorage
} from 'create-app/server'
import {
  HistoryWithBFOL,
  ILWithBQ,
  BLWithBQ
} from 'create-history'
import {
  BaseViewFC,
  BaseViewClass,
  Preload,
  API,
  Context,
  BaseState,
  Meta,
  Location
} from '..'
import * as shareActions from './actions'
import attachDevToolsIfPossible from './attachDevToolsIfPossible'
import ViewManager from '../component/ViewManager'
import _ from '../util'

export type BaseActions = typeof shareActions

const REDIRECT =
  typeof Symbol === 'function'
    ? Symbol('react.imvc.redirect')
    : Object('react.imvc.redirect')

const EmptyView = <Ctrl extends Controller<any, any>>(props?: {
  state?: {},
  actions?: {},
  ctrl?: Ctrl
}) => null

let uid = 0 // seed of controller id
// fixed: webpack rebuild lost original React.createElement
// @ts-ignore
let createElement = React.originalCreateElement || React.createElement

/**
 * 绑定 Store 到 View
 * 提供 Controller 的生命周期钩子
 * 提供 fetch 方法
 */
export default class Controller<
  S extends object = {},
  AS extends Actions<S & BaseState> = {}
> implements AppController {
  location: Location
  history: HistoryWithBFOL<BLWithBQ, ILWithBQ>
  context: Context
  View: React.ComponentType<any> = EmptyView
  Model?: any
  initialState?: any
  actions?: any
  store: Store<S & BaseState, AS & BaseActions>
  SSR?: boolean | { (location: Location, context: Context): Promise<boolean> } | undefined
  preload: Preload
  KeepAlive?: boolean
  KeepAliveOnPush?: boolean | undefined
  Loading: BaseViewFC | BaseViewClass = () => null
  API?: API
  restapi?: string
  resetScrollOnMount?: boolean
  
  meta: Meta
  proxyHandler?: {
    attach(): void
    detach(): void
  }
  deepCloneInitialState: boolean
  matcher: Matcher
  loader: Loader

  // life circle
  getInitialState(state: S & BaseState): any { return state }
  getFinalActions(actions: AS): any { return actions }
  shouldComponentCreate?(): void | boolean | Promise<void | boolean>
  componentWillCreate?(): void | Promise<void>
  componentDidFirstMount?(): void | Promise<void>
  componentDidMount?(): void | Promise<void>
  pageWillLeave?(location: ILWithBQ): void
  componentWillUnmount?(): void | Promise<void>
  pageDidBack?(location: HistoryLocation, context?: Context): void
  windowWillUnload?(location: ILWithBQ): void

  errorDidCatch?(error: Error, str: string): void
  getComponentFallback?(displayName: string, InputComponent: React.ComponentType): React.ReactElement | string | undefined | null
  getViewFallback?(view?: string): React.ReactElement | string | undefined | null
  stateDidReuse?(state: S & BaseState): void
  stateDidChange?(data?: Data<S & BaseState, AS & BaseActions>): void

  // will excute in *creatye-app/client*
  saveToCache(): void {}
  removeFromCache(): void {}
  getAllCache?(): CacheStorage<this>

  refreshView?(view?: any): void
  getContainer?(): HTMLElement | null
  clearContainer?(): void

  // state change listener
  handleInputChange(path: string, value: S, oldValue: S): S { return value }

  constructor(location: Location, context: Context) {
    this.meta = {
      id: uid++,
      viewId: Date.now(),
      isDestroyed: false,
      hadMounted: false, // change by ControllerProxy
      unsubscribeList: []
    }
    /**
     * 将 location.key 赋值给 this.meta 并在 location 里删除
     * 避免 SSR 时，因为 initialState 里总有 location.key 这个随机字符串
     * 而导致服务端的 Etag 不断变化，无法 304 。
     */
    if (location) {
      this.meta.key = location.key
      delete location.key
    }
    this.location = location
    this.context = context
    this.preload = {}
    this.deepCloneInitialState = true

    this.store = createStore({} as (AS & BaseActions), {} as S & BaseState)
    this.history = createHistory() as HistoryWithBFOL<BLWithBQ, ILWithBQ>
  }
  
  /**
   * 封装 fetch, https://github.github.io/fetch
   * options.json === false 不自动转换为 json
   * options.timeout:number 超时时间
   * options.timeoutErrorFormatter 超时时错误信息展示格式
   * options.raw 不补全 restfulBasename
   */
  fetch(
    url: string,
    options: RequestInit & {
      raw?: boolean
      json?: boolean
      timeout?: number
      timeoutErrorFormatter?: ((opstion: any) => string) | string
      fetch?: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
    } = {}
  ) {
    let { context, API } = this

    /**
     * API shortcut，方便 fetch(name, options) 代替 url
     */
    if (API && Object.prototype.hasOwnProperty.call(API, url)) {
      url = API[url]
    }

    // 补全 url
    if (!options.raw) {
      url = this.prependRestapi(url)
    }

    let finalOptions: RequestInit = {
      method: 'GET',
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }
    /**
     * 浏览器端的 fetch 有 credentials: 'include'，会自动带上 cookie
     * 服务端得手动设置，可以从 context 对象里取 cookie
     */
    if (context.isServer && finalOptions.credentials === 'include') {
      // @ts-ignore
      finalOptions.headers['Cookie'] = context.req
        && context.req.headers
        && context.req.headers.cookie || ''
    }

    // 支持使用方手动传入自定义fetch方法
    let fetchLocal = typeof options.fetch === 'function' ? options.fetch : fetch

    let fetchData: Promise<any> = fetchLocal(url, finalOptions)

    /**
     * 拓展字段，如果手动设置 options.json 为 false
     * 不自动 JSON.parse
     */
    if (options.json !== false) {
      fetchData = fetchData.then(_.toJSON)
    }

    /**
     * 设置自动化的超时处理
     */
    if (typeof options.timeout === 'number') {
      let { timeoutErrorFormatter } = options
      let timeoutErrorMsg: string | undefined =
        typeof timeoutErrorFormatter === 'function'
          ? timeoutErrorFormatter({ url, options: finalOptions })
          : timeoutErrorFormatter
      fetchData = _.timeoutReject(fetchData, options.timeout, timeoutErrorMsg)
    }

    return fetchData
  }
  /**
   *
   * 封装 get 请求，方便使用
   */
  get(
    url: string,
    params?: Record<string, string | number | boolean>,
    options?: RequestInit & {
      raw?: boolean
      json?: boolean
      timeout?: number
      timeoutErrorFormatter?: ((opstion: any) => string) | string
    }
  ) {
    let { API } = this
    /**
     * API shortcut，方便 fetch(name, options) 代替 url
     */
    if (API && Object.prototype.hasOwnProperty.call(API, url)) {
      url = API[url]
    }
    if (params) {
      let prefix = url.includes('?') ? '&' : '?'
      url += prefix + querystring.stringify(params)
    }
    options = {
      ...options,
      method: 'GET'
    }
    return this.fetch(url, options)
  }
  /**
   *
   * 封装 post 请求，方便使用
   */
  post(
    url: string,
    data?: any,
    options?: RequestInit & {
      raw?: boolean
      json?: boolean
      timeout?: number
      timeoutErrorFormatter?: ((opstion: any) => string) | string
    }
  ) {
    options = {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    }
    return this.fetch(url, options)
  }
  /**
   * 预加载 css 样式等资源
   */
  fetchPreload(preload?: Preload) {
    preload = preload || this.preload || {}
    let keys = Object.keys(preload)

    if (keys.length === 0) {
      return
    }

    let { context } = this
    let list = keys.map(name => {
      if ((context.preload as Preload)[name]) {
        return
      }
      let url = (preload as Preload)[name]

      if (!_.isAbsoluteUrl(url)) {
        if (context.isServer) {
          // 在服务端应请求本地的资源
          url = context.serverPublicPath + url
        } else if (context.isClient) {
          url = context.publicPath + url
        }
      }

      return fetch(url)
        .then(_.toText)
        .then(content => {
          if (url.split('?')[0].indexOf('.css') !== -1) {
            /**
             * 如果是 CSS ，清空回车符
             * 否则同构渲染时 react 计算 checksum 值会不一致
             */
            content = content.replace(/\r+/g, '')
          }
          (context.preload as Preload)[name] = content
        })
    })
    return Promise.all(list)
  }

  /**
   * 预加载页面的 js bundle
   */
  prefetch(url: string) {
    if (!url || typeof url !== 'string') return null
    let matches = this.matcher(url)
    if (!matches) return null
    return this.loader(matches.controller)
  }

  // 补 basename 前缀
  prependBasename(pathname: string) {
    if (_.isAbsoluteUrl(pathname)) {
      return pathname
    }
    let { basename } = this.context
    return basename + pathname
  }

  // 补 publicPath 前缀
  prependPublicPath(pathname: string) {
    if (_.isAbsoluteUrl(pathname)) {
      return pathname
    }
    let { publicPath } = this.context
    return publicPath + pathname
  }

  // 处理 url 的相对路径或 mock 地址问题
  prependRestapi(url: string) {
    let { context } = this

    /**
     * 如果已经是绝对路径
     * 在服务端直接返回 url
     * 在客户端裁剪掉 http: 使之以 // 开头
     * 让浏览器自动匹配协议，支持 Https
     */
    if (_.isAbsoluteUrl(url)) {
      if (context.isClient && url.startsWith('http:')) {
        url = url.replace('http:', '')
      }
      return url
    }

    // 对 mock 的请求进行另一种拼接，转到 node.js 服务去
    if (url.startsWith('/mock/')) {
      return this.prependBasename(url)
    }

    let restapi = this.restapi || context.restapi
    return restapi + url
  }

  /**
   * 封装重定向方法，根据 server/client 环境不同而选择不同的方式
   * isRaw 是否不拼接 Url，直接使用
   */
  redirect(redirectUrl: string, isRaw?: boolean) {
    let { history, context } = this

    if (context.isServer) {
      if (!isRaw && !_.isAbsoluteUrl(redirectUrl)) {
        // 兼容 history.push，自动补全 basename
        redirectUrl = this.prependBasename(redirectUrl)
      }
      context.res && context.res.redirect(redirectUrl)
      // 使用 throw 语句，模拟浏览器跳转时中断代码执行的效果
      // 将在外层 catch 住，并 return null 通知 create-app 无须渲染
      throw REDIRECT
    } else if (context.isClient) {
      if (isRaw || _.isAbsoluteUrl(redirectUrl)) {
        window.location.replace(redirectUrl)
      } else {
        history.replace(redirectUrl)
      }
    }
  }
  
  reload() {
    // if not remove controller cache, it will not reload correctly, it will restore instead of reload
    this.removeFromCache()
    this.history.replace(this.location.raw)
  }

  // 封装 cookie 的同构方法
  cookie(key: string, value?: string, options?: Cookie.CookieAttributes | express.CookieOptions) {
    if (!value) {
      return this.getCookie(key)
    }
    this.setCookie(key, value, options)
  }

  getCookie(key: string) {
    let { context } = this
    if (context.isServer) {
      let { req } = context
      return req && req.cookies[key]
    } else if (context.isClient) {
      return Cookie.get(key)
    }
  }

  setCookie(key: string, value: string, options?: Cookie.CookieAttributes | express.CookieOptions) {
    let { context } = this

    if (options && options.expires) {
      let isDateInstance = options.expires instanceof Date
      if (!isDateInstance) {
        throw new Error(
          `cookie 的过期时间 expires 必须为 Date 的实例，而不是 ${
          options.expires
          }`
        )
      }
    }

    if (context.isServer) {
      let { res } = context
      res && res.cookie(key, value, options as express.CookieOptions)
    } else if (context.isClient) {
      Cookie.set(key, value, options as Cookie.CookieAttributes)
    }
  }

  removeCookie(key: string, options?:  Cookie.CookieAttributes | express.CookieOptions) {
    let { context } = this

    if (context.isServer) {
      let { res } = context
      res && res.clearCookie(key, options)
    } else if (context.isClient) {
      Cookie.remove(key, options as Cookie.CookieAttributes)
    }
  }

  async init() {
    if (this.errorDidCatch || this.getComponentFallback) {
      let self = this
      let isAttach = false
      let attach = () => {
        if (isAttach) return
        isAttach = true
        React.createElement = (type: any, ...args: any[]) => {
          if (typeof type === 'function') {
            if (!type.isErrorBoundary) {
              type = createErrorBoundary(type)
            }
          }
          return createElement(type, ...args)
        }
        // @ts-ignore
        React.originalCreateElement = createElement
      }
      let detach = () => {
        isAttach = false
        React.createElement = createElement
      }
      let map = new Map()
      let createErrorBoundary = (InputComponent: React.ComponentType & { ignoreErrors: boolean }) => {
        if (!InputComponent) return InputComponent

        if (InputComponent.ignoreErrors) return InputComponent

        if (map.has(InputComponent)) {
          return map.get(InputComponent)
        }

        const displayName = InputComponent.name || InputComponent.displayName

        interface ErrorBoundaryProps {
          forwardedRef?: any
        }
        class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
          static displayName = `ErrorBoundary(${displayName})`
          static isErrorBoundary = true

          state: Partial<BaseState> = {
            hasError: false
          }

          static getDerivedStateFromError() {
            return { hasError: true }
          }

          componentDidCatch(error: Error) {
            if (typeof self.errorDidCatch === 'function') {
              self.errorDidCatch(error, 'view')
            }
          }
          render() {
            if (self.store.getState().hasError) {
              if (self.getComponentFallback) {
                let result = self.getComponentFallback(displayName as string, InputComponent)
                if (result !== undefined) return result
              }
              return null
            }
            let { forwardedRef, ...rest } = this.props
            return createElement(InputComponent, { ...rest, ref: forwardedRef })
          }
        }

        let Forwarder: React.ForwardRefExoticComponent<{}> & { isErrorBoundary?: boolean } = React.forwardRef((props, ref) => {
          return createElement(ErrorBoundary, { ...props, forwardedRef: ref })
        })

        /**
         * 同步 InputComponent 的静态属性/方法，一些 UI 框架，如 Ant-Design 
         * 依赖静态属性/方法去判断组件类型
         */
        Object.assign(Forwarder, InputComponent)
        Forwarder.isErrorBoundary = true
        map.set(InputComponent, Forwarder)

        return Forwarder
      }

      this.proxyHandler = { attach, detach }
    }
    try {
      return await this.initialize()
    } catch (error) {
      if (error === REDIRECT) return null
      if (this.errorDidCatch) this.errorDidCatch(error, 'controller')
      if (this.getViewFallback) {
        return this.getViewFallback() || <EmptyView />
      }
      throw error
    }
  }

  destroy() {
    let { meta } = this

    if (this.proxyHandler) {
      this.proxyHandler.detach()
    }

    if (meta.unsubscribeList.length > 0) {
      meta.unsubscribeList.forEach((unsubscribe: () => {}) => unsubscribe())
      meta.unsubscribeList.length = 0
    }
    meta.isDestroyed = true
  }

  async initialize() {
    /**
     * 关闭 SSR 后，不执行 componentWillCreate 和 shouldComponentCreate，直接返回 Loading 界面
     * SSR 如果是个方法，则执行并等待它完成
     */
    let SSR = this.SSR
    if (this.context.isServer) {
      if (typeof this.SSR === 'function') {
        SSR = await this.SSR(this.location, this.context)
      }
      if (SSR === false) {
        let View: BaseViewFC | BaseViewClass = this.Loading || EmptyView
        return <View />
      }
    }

    // 在 init 方法里 bind this，这样 fetch 可以支持继承
    // 如果用 fetch = (url, option = {}) => {} 的写法，它不是原型方法，无法继承
    this.fetch = this.fetch.bind(this)
    this.prefetch = this.prefetch.bind(this)

    let actions: AS = this.actions || {} as AS
    let initialState: S = this.initialState || {} as S

    // 如果 Model 存在，且 initialState 和 actions 不存在，从 Model 里解构出来
    if (this.Model && this.initialState === undefined && this.actions === undefined) {
      let { initialState: initState, ...acts } = this.Model
      initialState = initState
      actions = acts as unknown as AS
    }

    let globalInitialState: BaseState | undefined

    // 服务端把 initialState 吐在 html 里的全局变量 __INITIAL_STATE__ 里
    if (typeof __INITIAL_STATE__ !== 'undefined') {
      globalInitialState = __INITIAL_STATE__
      __INITIAL_STATE__ = undefined
    }

    if (typeof initialState === 'object' && this.deepCloneInitialState) {
      // 保护性复制初始化状态，避免运行中修改引用导致其他实例初始化数据不对
      initialState = JSON.parse(JSON.stringify(initialState))
    }

    let baseState: BaseState = {
      location: this.location,
      basename: this.context.basename || '',
      publicPath: this.context.publicPath || '',
      restapi: this.context.restapi || ''
    }

    /**
     * 动态获取初始化的 initialState
     */
    let finalInitialState: S & BaseState = await this.getInitialState({
      ...initialState,
      ...(globalInitialState || {}),
      ...baseState
    })

    /**
     * 复用了 server side 的 state 数据之后执行
     */
    if (globalInitialState && this.stateDidReuse) {
      this.stateDidReuse(finalInitialState)
    }

    /**
     * 动态获取最终的 actions
     */
    let finalActions: AS & BaseActions = await this.getFinalActions({ ...shareActions, ...actions })
    
    /**
     * 创建 store
     */
    this.store = createStore(finalActions, finalInitialState)
    attachDevToolsIfPossible(this.store)

    // TODO
    // proxy store.actions for handling error
    if (this.errorDidCatch) {
      let keys = _.getKeys(this.store.actions)
      let actions: Currings<S & BaseState, AS & BaseActions> = keys.reduce((obj, key) => {
        let action = this.store.actions[key]
        let newAction = (payload: any) => {
          try {
            return action(payload)
          } catch (error) {
            if (this.errorDidCatch) {
              this.errorDidCatch(error, 'model')
            }
            throw error
          }
        }
        obj[key] = newAction as Curring<S & BaseState, (AS & typeof import("d:/Projects/react-imvc/src/controller/actions"))[keyof AS]>
        return obj
      }, {} as Currings<S & BaseState, AS & BaseActions>)

      this.store.actions = actions
    }

    /**
     * 如果存在 globalInitialState
     * 说明服务端渲染了 html 和 intitialState
     * component 已经创建
     * 不需要再调用 shouldComponentCreate 和 componentWillCreate
     */
    if (globalInitialState) {
      this.bindStoreWithView()

      // 如果 preload 未收集到或者加载成功，重新加载一次
      let preloadedKeys: string[] = Object.keys(this.context.preload || {})
      let isPreload: boolean = Object.keys(this.preload || {}).every(key =>
        preloadedKeys.includes(key)
      )

      if (!isPreload) await this.fetchPreload()
      return this.render()
    }

    let promiseList: (Promise<any> | void)[] = []

    /**
     * 如果 shouldComponentCreate 返回 false，不创建和渲染 React Component
     * 可以在 shouldComponentCreate 里重定向到别的 Url
     */
    if (this.shouldComponentCreate) {
      let shouldCreate = await this.shouldComponentCreate()
      if (shouldCreate === false) {
        return null
      }
    }

    // 在 React Component 创建前调用，可以发 ajax 请求获取数据
    if (this.componentWillCreate) {
      promiseList.push(this.componentWillCreate())
    }

    /**
     * 获取预加载的资源
     */
    if (this.preload) {
      promiseList.push(this.fetchPreload())
    }



    if (promiseList.length) {
      await Promise.all(promiseList)
    }



    this.bindStoreWithView()
    return this.render()
  }
  bindStoreWithView() {
    let { context, store, history, meta } = this

    // bind store with view in client
    if (!context.isClient || meta.isDestroyed) {
      return
    }

    if (store) {
      let unsubscribe = store.subscribe((data) => {
        this.refreshView && this.refreshView()
        if (this.stateDidChange) {
          this.stateDidChange(data)
        }
      })
      meta.unsubscribeList.push(unsubscribe)
    }

    // 判断是否缓存
    {
      let unlisten = history.listenBefore((location) => {
        if (!this.KeepAliveOnPush) return
        if (location.action === HistoryActions.PUSH) {
          this.saveToCache()
        } else {
          this.removeFromCache()
        }
      })
      meta.unsubscribeList.push(unlisten)
    }

    // 监听路由跳转
    if (this.pageWillLeave) {
      let unlisten = history.listenBefore(
        this.pageWillLeave.bind(this)
      )
      meta.unsubscribeList.push(unlisten)
    }

    // 监听浏览器窗口关闭
    if (this.windowWillUnload) {
      let unlisten = history.listenBeforeUnload(
        this.windowWillUnload.bind(this)
      )
      meta.unsubscribeList.push(unlisten)
    }
  }

  restore(location: Location, context?: Context): React.ReactElement {
    let { meta, store } = this
    let { __PAGE_DID_BACK__ } = store.actions

    if (this.proxyHandler) {
      // detach first, and re-attach
      this.proxyHandler.detach()
      this.proxyHandler.attach()
    }

    meta.isDestroyed = false
    if (__PAGE_DID_BACK__) {
      __PAGE_DID_BACK__(location)
    }

    if (this.pageDidBack) {
      this.pageDidBack(location, context)
    }

    this.bindStoreWithView()
    return this.render()
  }

  renderView(View = this.View) {
    if (this.context.isServer) return
    let ctrl: this = Object.create(this)
    ctrl.View = View
    ctrl.componentDidFirstMount = undefined
    ctrl.componentDidMount = undefined
    ctrl.componentWillUnmount = undefined
    if (this.proxyHandler) {
      this.proxyHandler.attach()
    }
    this.refreshView && this.refreshView(<ViewManager controller={ctrl} />)
  }

  render(): React.ReactElement {
    if (this.proxyHandler) this.proxyHandler.attach()
    return <ViewManager controller={this} />
  }
}
