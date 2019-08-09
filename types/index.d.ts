import Controller from '../controller'
import express from 'express'

export interface Global extends NodeJS.Global {
  controller: Controller
  __webpack_public_path__: string
  fetch: any
}

export interface WindowNative extends Window {
  controller: Controller
  __CUSTOM_LAYOUT__: string
  __PUBLIC_PATH__: string
  __APP_SETTINGS__: object
  __INITIAL_STATE__: object
}

export interface Req extends express.Request {
  basename?: string
  serverPublicPath?: string
  publicPath?: string
}

export interface Res extends express.Response {
  sendResponse: express.Send
  renderPage: any
}

export interface RequestHandler {
  (req: Req, res: Res, next: express.NextFunction): any
}

export interface NativeModule extends NodeModule {
  hot?: {
    accept: Function
  }
}