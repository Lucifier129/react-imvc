import Controller from './index'

export interface State {
    [propName:string]: any
}

export interface Actions {
    [propName:string]: { (...args:any):State } | State
}

export interface Model {
    initialState?: State
    [propName:string]: any
}

export interface Preload  {
    [propName:string]: string
}

export type API = Record<string, string>

export interface Payload {
    [propName:string]: any 
}

export interface Location {
    // path?: any
    key?: string
    action: string
    basename: string
    hash: string
    params: object
    pathname: string
    pattern: string
    query: object
    raw: string
    search: string
    state: any
    [propName: string]: any
}

export interface Context {
    basename: string
    env: string
    isClient: boolean
    isServer: boolean
    preload: Record<string, string>
    prevLocation: object | null
    publicPath: string
    restapi: string
    userInfo: object
    [propName: string]: any
}

export interface Handlers {
    [handleName: string]: Handle
}

interface Handle {
    (...args:any):any
}

export interface Meta {
    key?: string | null
    hadMounted: boolean
    id: number
    isDestroyed: boolean
    unsubscribeList: any
}

export interface History {
    createHref(e: string): string
    createKey(): string
    createLocation(e: string): Location
    createPath(e: string): string
    getCurrentLocation(): Location
    go(url: string): void
    goBack(): void
    goForward(): void
    listen(func: any): object
    listenBefore(func: any): object
    listenBeforeUnload(func: any): object
    push(url: string): void
    replace(url: string): void
    transitionTo(url: string): void
    // pushLocation():void
    // replaceLocation():void
}

export interface Loader {
    (...args:any):any
}

export interface Routes {
    [index: number]: Route
}

interface Route {
    path: string,
    controller: Controller
}

export interface Matcher {
    (...args:any):MatcherReturn
}

interface MatcherReturn {
    path?: string
    params?: Record<string, string>
    controller?: Controller
}

export interface Store {
    actions: Record<string, any>
    dispatch(...args:any): void
    getState(): State
    publish(...args:any): void
    replaceState(...args:any): void
    subscribe(callback:(...args: any)=>any): object
}