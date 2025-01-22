import React from 'react'
import GlobalContext from '../context'
import ControllerProxy from './ControllerProxy'

export default class ViewManager extends React.Component {
    static ignoreErrors = true
    views = {}
    scrollMap = {}
    constructor(props, context) {
        super(props, context)
        this.addItemIfNeed(props.controller.location.raw)
    }
    addItemIfNeed(key) {
        if (!this.views.hasOwnProperty(key)) {
            this.views[key] = null
        }
    }
    clearItemIfNeed() {
        let { views, scrollMap } = this
        let { controller } = this.props
        let cache = controller.getAllCache()

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
    componentWillReceiveProps(nextProps) {
        let currentPath = this.props.controller.location.raw
        let nextPath = nextProps.controller.location.raw
        if (currentPath !== nextPath) {
            this.scrollMap[currentPath] = window.scrollY
        }
        this.addItemIfNeed(nextPath)
        this.clearItemIfNeed()
    }
    renderView(path) {
        let { controller } = this.props
        let currentPath = controller.location.raw

        if (currentPath !== path) {
            return this.views[path]
        }

        let { meta, store, handlers, View } = controller
        let state = store.getState()
        let actions = store.actions

        let view = (
            <GlobalContext.Provider value={getContextByController(controller)}>
                <View key={`${meta.id}_${currentPath}`} state={state} handlers={handlers} actions={actions} />
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
                <ControllerProxy key={controller.meta.id + controller.location.raw} controller={controller} />
            </React.Fragment>
        )
    }
}

class ViewItem extends React.Component {
    static ignoreErrors = true
    getContainer = (container) => {
        this.container = container
    }
    getResetScrollOnMount = () => {
        let { resetScrollOnMount } = this.props
        return resetScrollOnMount == undefined ? true : !!resetScrollOnMount
    }
    shouldComponentUpdate(nextProps) {
        if (!nextProps.isActive) {
            this.container.style.display = 'none'
        } else {
            if (!this.props.isActive) {
                this.container.style.display = ''
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

function getContextByController(ctrl) {
    let { store, handlers, location, history, context, matcher, loader, prefetch, handleInputChange } = ctrl
    let state = store.getState()
    return {
        ctrl,
        location,
        history,
        state,
        actions: store.actions,
        preload: context.preload,
        handleInputChange,
        handlers,
        matcher,
        loader,
        prefetch,
    }
}
