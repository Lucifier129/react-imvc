// base controller class
/// <reference path="../index.ts" />
import 'whatwg-fetch'
import React from 'react'
import { createStore } from 'relite'
import Cookie from 'js-cookie'
import querystring, { stringify } from 'querystring'
import CA from 'create-app/client'
import CH from 'create-history'
import _ from '../util'
import ViewManager from '../component/ViewManager'
import * as shareActions from './actions'
import attachDevToolsIfPossible from './attachDevToolsIfPossible'
import IMVC from '../index'

const REDIRECT =
  typeof Symbol === 'function'
    ? Symbol('react.imvc.redirect')
    : Object('react.imvc.redirect')

const EmptyView = () => null
let uid = 0 // seed of controller id
/**
 * 绑定 IMVC.Store 到 View
 * 提供 Controller 的生命周期钩子
 * 组装事件处理器 Event IMVC.Handlers
 * 提供 fetch 方法
 */
type UdfFuncType = {
  (...args: any[]): any
}

interface InitailState {
  (location: IMVC.Location, context: IMVC.Context): IMVC.State
}

export default class Controller implements CA.Controller {
  View: IMVC.BaseViewFC | IMVC.BaseViewClass = EmptyView
  restapi: string = ''
  preload: IMVC.Preload
  API: IMVC.API
  Model: IMVC.Model
  initialState: IMVC.State | InitailState | undefined
  actions: IMVC.Actions | undefined
  SSR: boolean | { (location:IMVC.Location, context: IMVC.Context):boolean } | undefined
  KeepAliveOnPush: boolean | undefined
  history: CH.NativeHistory
  store: IMVC.Store
  location: IMVC.Location
  context: IMVC.Context
  handlers: IMVC.Handlers
  meta: IMVC.Meta
  proxyHandler: any
  resetScrollOnMount?: boolean
  [propName: string]: any
  matcher?: CA.Matcher
  loader: IMVC.Loader | undefined
  Loading: IMVC.BaseViewFC | IMVC.BaseViewClass = (...args) => null

  errorDidCatch?(error:Error, str: string): void
  getComponentFallback?(displayName: string, InputComponent: React.ComponentType):void
  getViewFallback?(...args: any[]): any
  getInitialState?(...args: any[]): any
  stateDidReuse?(...args: any[]): any
  getFinalActions?(...args: any[]): any
  shouldComponentCreate?(...args: any[]): any
  componentWillCreate?(...args: any[]): any
  refreshView?(...args: any[]): any
  stateDidChange?(...args: any[]): any
  saveToCache?(...args: any[]): any
  pageWillLeave?(...args: any[]): any
  windowWillUnload?(...args: any[]): any
  pageDidBack?(...args: any[]): any

  constructor(location: IMVC.Location, context: IMVC.Context) {
    this.meta = {
      id: uid++,
      isDestroyed: false,
      hadMounted: false, // change by ControllerProxy
      unsubscribeList: []
    }
    /**
     * 将 location.key 赋值给 this.meta 并在 location 里删除
     * 避免 SSR 时，因为 initialState 里总有 locaiton.key 这个随机字符串
     * 而导致服务端的 Etag 不断变化，无法 304 。
     */
    if (location) {
      this.meta.key = location.key
      delete location.key
    }
    this.location = location
    this.context = context
    this.handlers = {}
    this.preload = {}
    this.history = CH.createHistory()
    this.store = createStore({})
    this.API = {}
    this.Model = {}
  }
  // 绑定 handler 的 this 值为 controller 实例
  combineHandlers(source: Controller) {
    let { handlers } = this
    Object.keys(source).forEach(key => {
      let value = source[key]
      if (key.startsWith('handle') && typeof value === 'function') {
        handlers[key] = value.bind(this)
      }
    })
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
  redirect(redirectUrl: string, isRaw: boolean) {
    let { history, context } = this

    if (context.isServer) {
      if (!isRaw && !_.isAbsoluteUrl(redirectUrl)) {
        // 兼容 history.push，自动补全 basename
        redirectUrl = this.prependBasename(redirectUrl)
      }
      context.res.redirect(redirectUrl)
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
  // 封装 cookie 的同构方法
  cookie(key: string, value: string, options: any) {
    if (value == null) {
      return this.getCookie(key)
    }
    this.setCookie(key, value, options)
  }
  getCookie(key: string) {
    let { context } = this
    if (context.isServer) {
      let { req } = context
      return req.cookies[key]
    } else if (context.isClient) {
      return Cookie.get(key)
    }
  }
  setCookie(key: string, value: string, options: any) {
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
      res.cookie(key, value, options)
    } else if (context.isClient) {
      Cookie.set(key, value, options)
    }
  }
  removeCookie(key: string, options: any) {
    let { context } = this

    if (context.isServer) {
      let { res } = context
      res.clearCookie(key, options)
    } else if (context.isClient) {
      Cookie.remove(key, options)
    }
  }

  /**
   * 封装 fetch, https://github.github.io/fetch
   * options.json === false 不自动转换为 json
   * options.timeout:number 超时时间
   * options.timeoutErrorFormatter 超时时错误信息展示格式
   * options.raw 不补全 restfulBasename
   */
  fetch(url: string, options: Record<string, any> = {}) {
    let { context, API } = this

    /**
     * IMVC.API shortcut，方便 fetch(name, options) 代替 url
     */
    if (API && Object.prototype.hasOwnProperty.call(API, url)) {
      url = API[url]
    }

    // 补全 url
    if (!options.raw) {
      url = this.prependRestapi(url)
    }

    let finalOptions = {
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
      finalOptions.headers['Cookie'] = context.req.headers.cookie || ''
    }

    let fetchData: Promise<any> = fetch(url, finalOptions as RequestInit)

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
      let timeoutErrorMsg =
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
  get(url: string, params: object, options: object) {
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
  post(url: string, data: any, options: object) {
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
  fetchPreload(preload?: IMVC.Preload) {
    preload = preload || this.preload
    let keys = Object.keys(preload)

    if (keys.length === 0) {
      return
    }

    let { context } = this
    let list = keys.map(name => {
      if ((context.preload as IMVC.Payload)[name]) {
        return
      }
      let url = (preload as IMVC.Preload)[name]

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
          (context.preload as IMVC.Payload)[name] = content
        })
    })
    return Promise.all(list)
  }

  /**
   * 预加载页面的 js bundle
   */
  prefetch(url: string) {
    if (!url || typeof url !== 'string') return null
    let matches = (this.matcher as CA.Matcher)(url)
    if (!matches) return null
    return (this.loader as IMVC.Loader)(matches.controller)
  }

  async init() {
    if (this.errorDidCatch || this.getComponentFallback) {
      this.proxyHandler = proxyReactCreateElement(this)
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
      this.proxyHandler = null
    }

    if (meta.unsubscribeList.length > 0) {
      meta.unsubscribeList.forEach((unsubscribe: any) => unsubscribe())
      meta.unsubscribeList.length = 0
    }
    meta.isDestroyed = true
  }

  async initialize() {
    let { Model, initialState, actions, context, location, SSR, Loading } = this

    /**
     * 关闭 SSR 后，不执行 componentWillCreate 和 shouldComponentCreate，直接返回 Loading 界面
     * SSR 如果是个方法，则执行并等待它完成
     */
    if (context.isServer) {
      if (typeof this.SSR === 'function') {
        SSR = await this.SSR(location, context)
      }
      if (SSR === false) {
        let View: IMVC.BaseViewFC | IMVC.BaseViewClass = Loading || EmptyView
        return <View />
      }
    }

    // 在 init 方法里 bind this，这样 fetch 可以支持继承
    // 如果用 fetch = (url, option = {}) => {} 的写法，它不是原型方法，无法继承
    this.fetch = this.fetch.bind(this)
    this.prefetch = this.prefetch.bind(this)

    // 如果 Model 存在，且 initialState 和 actions 不存在，从 Model 里解构出来
    if (Model && initialState === undefined && actions === undefined) {
      let { initialState: $initialState, ...$actions } = Model
      initialState = this.initialState = $initialState
      actions = this.actions = $actions
    }

    let globalInitialState: IMVC.State | undefined

    // 服务端把 initialState 吐在 html 里的全局变量 __INITIAL_STATE__ 里
    if (typeof __INITIAL_STATE__ !== 'undefined') {
      globalInitialState = __INITIAL_STATE__
      __INITIAL_STATE__ = undefined
    }

    if (typeof initialState === 'function') {
      initialState = initialState(location, context)
    }

    if (typeof initialState === 'object') {
      //保护性复制初始化状态，避免运行中修改引用导致其他实例初始化数据不对
      initialState = JSON.parse(JSON.stringify(initialState))
    }

    let finalInitialState: IMVC.State = {
      ...initialState,
      ...globalInitialState,
      location,
      basename: context.basename,
      publicPath: context.publicPath,
      restapi: context.restapi
    }

    /**
     * 动态获取初始化的 initialState
     */
    if (!globalInitialState && this.getInitialState) {
      finalInitialState = await this.getInitialState(finalInitialState)
    }

    /**
     * 复用了 server side 的 state 数据之后执行
     */
    if (globalInitialState && this.stateDidReuse) {
      this.stateDidReuse(finalInitialState)
    }

    /**
     * 动态获取最终的 actions
     */
    if (this.getFinalActions) {
      actions = this.getFinalActions(actions)
    }

    /**
     * 创建 store
     */
    let finalActions: IMVC.Actions = { ...actions, ...shareActions }
    this.store = createStore(finalActions, finalInitialState)
    attachDevToolsIfPossible(this.store)

    // proxy store.actions for handling error
    if (this.errorDidCatch) proxyStoreActions(this)

    /**
     * 将 handle 开头的方法，合并到 this.handlers 中
     */
    this.combineHandlers(this)

    /**
     * 如果存在 globalInitialState
     * 说明服务端渲染了 html 和 intitialState
     * component 已经创建
     * 不需要再调用 shouldComponentCreate 和 componentWillCreate
     */
    if (globalInitialState) {
      this.bindStoreWithView()

      // 如果 preload 未收集到或者加载成功，重新加载一次
      let preloadedKeys:string[] = Object.keys(this.context.preload || {})
      let isPreload:boolean = Object.keys(this.preload || {}).every(key =>
        preloadedKeys.includes(key)
      )

      if (!isPreload) await this.fetchPreload()
      return this.render()
    }

    let promiseList:(Promise<any> | undefined)[] = []

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
      let unsubscribe = (store.subscribe as Function)((data: any) => {
        (this.refreshView as UdfFuncType)()
        if (this.stateDidChange) {
          this.stateDidChange(data)
        }
      })
      meta.unsubscribeList.push(unsubscribe)
    }

    // 判断是否缓存
    {
      let unlisten = history.listenBefore((location: IMVC.Location) => {
        if (!this.KeepAliveOnPush) return
        if (location.action === 'PUSH') {
          (this.saveToCache as UdfFuncType)()
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
      let unlisten = (history.listenBeforeUnload as CH.ListenBeforeUnload)(
        this.windowWillUnload.bind(this)
      )
      meta.unsubscribeList.push(unlisten)
    }
  }

  restore(location: IMVC.Location, context: IMVC.Context) {
    let { meta, store } = this
    let { __PAGE_DID_BACK__ } = store.actions as IMVC.Actions

    if (this.proxyHandler) {
      // detach first, and re-attach
      this.proxyHandler.detach()
      this.proxyHandler.attach()
    }

    meta.isDestroyed = false;
    (__PAGE_DID_BACK__ as Function)(location)

    if (this.pageDidBack) {
      this.pageDidBack(location, context)
    }

    this.bindStoreWithView()
    return this.render()
  }
  reload() {
    // if not remove controller cache, it will not reload correctly, it will restore instead of reload
    this.removeFromCache()
    this.history.replace(this.location.raw)
  }

  renderView(View = this.View) {
    if (this.context.isServer) return
    if (View && !View.viewId) {
      View.viewId = Date.now()
    }
    let ctrl:Controller = Object.create(this)
    ctrl.View = View
    ctrl.componentDidFirstMount = null
    ctrl.componentDidMount = null
    ctrl.componentWillUnmount = null
    ctrl.meta = {
      ...this.meta,
      id: View.viewId
    }
    if (this.proxyHandler) this.proxyHandler.attach()
    (this.refreshView as UdfFuncType)(<ViewManager controller={ctrl} />)
  }

  render() {
    if (this.proxyHandler) this.proxyHandler.attach()
    return <ViewManager controller={this} />
  }
}

// fixed: webpack rebuild lost original React.createElement
// @ts-ignore
let createElement = React.originalCreateElement || React.createElement

type ProxyReactCreateElement = (ctrl: Controller) => { attach:object, detach:object }

const proxyReactCreateElement: ProxyReactCreateElement = ctrl => {
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

      state: IMVC.State = {
        hasError: false
      }

      static getDerivedStateFromError() {
        return { hasError: true }
      }

      componentDidCatch(error: Error) {
        if (typeof ctrl.errorDidCatch === 'function') {
          ctrl.errorDidCatch(error, 'view')
        }
      }
      render() {
        if (this.state.hasError) {
          if (ctrl.getComponentFallback) {
            let result = ctrl.getComponentFallback(displayName as string, InputComponent)
            if (result !== undefined) return result
          }
          return null
        }
        let { forwardedRef, ...rest } = this.props
        return createElement(InputComponent, { ...rest, ref: forwardedRef })
      }
    }

    let Forwarder: {
      isErrorBoundary?: boolean
      [propName: string]: any
    } = React.forwardRef((props, ref) => {
      return createElement(ErrorBoundary, { ...props, forwardedRef: ref })
    })

    Forwarder.isErrorBoundary = true
    map.set(InputComponent, Forwarder)

    return Forwarder
  }

  return { attach, detach }
}

const proxyStoreActions = (ctrl: Controller) => {
  let actions: IMVC.Actions = {}

  for (let key in ctrl.store.actions as IMVC.Actions) {
    let action = (ctrl.store.actions as IMVC.Actions)[key]
    actions[key] = (payload: IMVC.Payload) => {
      try {
        return (action as { (...args: any[]): IMVC.State })(payload)
      } catch (error) {
        (ctrl.errorDidCatch as { (error: Error, str: string):void})(error, 'model')
        throw error
      }
    }
  }

  ctrl.store.actions = actions
}
