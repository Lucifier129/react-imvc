import React from 'react'
import Controller from '../controller'
import GlobalContext from '../context'
import ControllerProxy from './ControllerProxy'
import type { Actions } from 'relite'
import type { CacheStorage } from 'create-app/client'
import type { BaseState } from '..'

export interface ViewManagerProps<
  S extends object,
  AS extends Actions<S & BaseState>
> {
  controller: Controller<S, AS>
}

export default class ViewManager<
  S extends object,
  AS extends Actions<S & BaseState>
> extends React.Component<ViewManagerProps<S, AS>> {
  static ignoreErrors = true
  views: Record<string, any> = {}
  scrollMap: Record<string, any> = {}
  constructor(props: ViewManagerProps<S, AS>, context: React.Context<any>) {
    super(props, context)
    this.addItemIfNeed(props.controller.location.raw)
  }

  addItemIfNeed(key: string) {
    if (!this.views.hasOwnProperty(key)) {
      this.views[key] = null
    }
  }

  clearItemIfNeed() {
    let { views, scrollMap } = this
    let { controller } = this.props
    let cache: CacheStorage<Controller<any, any>> = controller.getAllCache
      ? controller.getAllCache()
      : {}

    for (let key in views) {
      if (!cache.hasOwnProperty(key)) {
        delete views[key]
      }
    }

    for (let key in scrollMap) {
      if (!cache.hasOwnProperty(key)) {
        delete scrollMap[key]
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: ViewManagerProps<S, AS>) {
    let currentPath = this.props.controller.location.raw
    let nextPath = nextProps.controller.location.raw
    if (currentPath !== nextPath) {
      this.scrollMap[currentPath] = window.scrollY
    }
    this.addItemIfNeed(nextPath)
    this.clearItemIfNeed()
  }

  renderView(path: string) {
    let { controller } = this.props
    let {
      View,
      store,
      location,
      history,
      context,
      matcher,
      loader,
      prefetch,
      handleInputChange,
      meta,
    } = controller
    let currentPath = controller.location.raw

    if (currentPath !== path) {
      return this.views[path]
    }

    let state = store.getState()
    let actions = store.actions
    let globalContext = {
      ctrl: controller,
      location,
      history,
      state,
      actions,
      preload: context.preload,
      handleInputChange,
      matcher,
      loader,
      prefetch,
    }

    let view = (
      <GlobalContext.Provider value={globalContext as any}>
        <View
          key={`${meta.id}_${currentPath}`}
          state={state}
          ctrl={controller}
        />
      </GlobalContext.Provider>
    )

    if (controller.KeepAlive) {
      this.views[path] = view
    } else if (this.views.hasOwnProperty(path)) {
      delete this.views[path]
    }

    return view
  }

  render() {
    let { controller } = this.props
    return (
      <React.Fragment>
        {Object.keys(this.views).map((path) => {
          return (
            <ViewItem
              key={path}
              path={path}
              isActive={path === controller.location.raw}
              view={this.renderView(path)}
              scrollY={this.scrollMap[path]}
              resetScrollOnMount={controller.resetScrollOnMount}
            />
          )
        })}
        <ControllerProxy
          key={controller.meta.id + controller.location.raw}
          controller={controller}
        />
      </React.Fragment>
    )
  }
}

type ItemProps = {
  key?: string
  path?: string
  isActive: boolean
  view?: JSX.Element
  scrollY: number
  resetScrollOnMount?: boolean
}

class ViewItem extends React.Component<ItemProps> {
  static ignoreErrors = true
  container: HTMLElement | string | null = null

  getContainer = (container: HTMLElement | string | null) => {
    this.container = container
  }

  getResetScrollOnMount = () => {
    let { resetScrollOnMount } = this.props
    return resetScrollOnMount === void 0 ? true : !!resetScrollOnMount
  }

  shouldComponentUpdate(nextProps: ItemProps) {
    if (!nextProps.isActive) {
      ;(this.container as HTMLElement).style.display = 'none'
    } else {
      if (!this.props.isActive) {
        ;(this.container as HTMLElement).style.display = ''
        window.scroll(0, this.props.scrollY)
      }
    }
    return nextProps.isActive
  }

  componentDidMount() {
    if (this.getResetScrollOnMount()) {
      window.scroll(0, 0)
    }
  }

  render() {
    return (
      <div className="imvc-view-item" ref={this.getContainer}>
        {this.props.view}
      </div>
    )
  }
}
