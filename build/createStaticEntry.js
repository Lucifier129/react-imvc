import React from 'react'
import ReactDOMServer from 'react-dom/server'
import path from 'path'
import fs from 'fs'
import { readAssets } from '../page/createPageRouter'

let getModule = module => module.default || module

export default function createStaticEntry(config, assets) {
	let layoutPath = getLayout(config)
	let Layout = getModule(require(layoutPath))
	let props = getProps(config, assets)
	let vdom = React.createElement(Layout, props)
	let html = ReactDOMServer.renderToStaticMarkup(vdom)
	return html
}

function getLayout(config) {
	return config.layout
		? path.join(config.root, config.routes, config.layout)
		: path.join(__dirname, '../page/view')
}

function getProps(config, assets) {
	console.log('config', config)
	let basename = [].concat(config.basename)[0]
    let publicPath = config.publicPath || basename + config.staticPath
    let context = {
      basename,
      publicPath,
      restapi: config.restapi,
      ...config.context,
      preload: {},
    }

    let appSettings = {
      type: 'createHashHistory',
      basename,
      context,
    }

    return {
    	basename,
    	publicPath,
    	assets,
    	appSettings,
    }
}

