export type Controller = {
    location: Location
    context: Context
    handlers: Handlers
    matcher: Matcher
    loader: Loader
    routes: Routes
    store: Store
    errorDidCatch: any
    getComponentFallback: any
    proxyHandler: any
    Model: Record<string, any>
    initialState: Record<string, any>
    actions: Record<string, any>
    SSR: boolean | any
    Loading: React.FC
    KeepAliveOnPush: boolean
    [propName: string]: any
    getViewFallback(...args: any): any
    getInitialState(...args: any): any
    stateDidReuse(...args: any): any
    getFinalActions(...args: any): any
    fetchPreload(...args: any): any
    shouldComponentCreate(...args: any): any
    componentWillCreate(...args: any): any
    refreshView(...args: any): any
    stateDidChange(...args: any): any
    saveToCache(...args: any): any
    removeFromCache(...args: any): any
    pageWillLeave(...args: any): any
    windowWillUnload(...args: any): any
    pageDidBack(...args: any): any
}

export type Location = {
    path?: any
    // search: any
    // hash: any
    // state: any
    // action: any
    key?: any

    action: string
    basename: string
    hash: string
    params: any
    pathname: string
    pattern: string
    query: any
    raw: string
    search: string
    state: any | undefined
}

export type Context = {
    basename: string
    env: string
    isClient: boolean
    isServer: boolean
    preload: Record<string, string>
    prevLocation: any | null
    publicPath: string
    restapi: string
    userInfo: Record<string, any>
    [propName: string]: any
}

export type Handlers = Record<string, Handle>

type Handle = {
    (...args:any):any
}

export type Meta = {
    key?: string | null
    hadMounted: boolean
    id: number
    isDestroyed: boolean
    unsubscribeList: any
}

export type History = {
    createHref(e: any): any
    createKey(): any
    createLocation(e: any): any
    createPath(e: any): any
    getCurrentLocation(): any
    go(e: any): any
    goBack(): any
    goForward(): any
    listen(e: any): any
    listenBefore(e: any): any
    listenBeforeUnload(e: any): any
    push(e: any): void
    replace(e: any): void
    transitionTo(e: any): any
    // pushLocation():void
    // replaceLocation():void
}

export type Loader = {
    (...args:any):any
}

export type Routes = Route[]

type Route = {
    path: string,
    controller: Controller
}

export type Matcher = {
    (...args:any):any
    // path: string
    // params: Record<string, string>
    // controller: Controller
}

export type Store = {
    actions: Record<string, any>
    dispatch(...args:any): any
    getState(): any
    publish(...args:any): any
    replaceState(...args:any): any
    subscribe(callback:(...args: any)=>any): any
}