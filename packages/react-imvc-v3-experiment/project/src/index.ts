import ES6_Import from './es6_import/Controller'
import ES6_Module from './es6_module/Controller'

export default [
  {
    path: '/static_view',
    controller: () => import('./static-view/Controller'),
  },
  {
    path: '/static_view_csr',
    controller: () => import('./static-view-csr/Controller'),
  },
  {
    path: '/basic_state',
    controller: () => import('./basic-state/Controller'),
  },
  {
    path: '/error_boundary',
    controller: () => import('./error-boundary/Controller'),
  },
  {
    path: '/render_view',
    controller: () => import('./render-view/Controller'),
  },
  {
    path: '/link_from',
    controller: () => import('./link-from/Controller'),
  },
  {
    path: '/link_to',
    controller: () => import('./link-to/Controller'),
  },
  {
    path: '/input',
    controller: () => import('./input/Controller'),
  },
  {
    path: '/outer_click',
    controller: () => import('./outer-click-wrapper/Controller'),
  },
  {
    path: '/event',
    controller: () => import('./event-wrapper/Controller'),
  },
  {
    path: '/style',
    controller: () => import('./style/Controller'),
  },
  {
    path: '/connect',
    controller: () => import('./connect/Controller'),
  },
  {
    path: '/hook',
    controller: () => import('./hook/Controller'),
  },
  {
    path: '/location',
    controller: () => import('./location/Controller'),
  },
  {
    path: '/history',
    controller: () => import('./history/Controller'),
  },
  {
    path: '/loading',
    controller: () => import('./loading/Controller'),
  },
  {
    path: '/api',
    controller: () => import('./api/Controller'),
  },
  {
    path: '/api_map',
    controller: () => import('./api-map/Controller'),
  },
  {
    path: '/restapi',
    controller: () => import('./restapi/Controller'),
  },
  {
    path: '/scroll',
    controller: () => import('./scroll/Controller'),
  },
  {
    path: '/unscroll',
    controller: () => import('./unscroll/Controller'),
  },
  {
    path: '/componentWillCreate',
    controller: () => import('./componentWillCreate/Controller'),
  },
  {
    path: '/getInitialState',
    controller: () => import('./getInitialState/Controller'),
  },
  {
    path: '/es6_import',
    controller: () => ES6_Import,
  },
  {
    path: '/es6_module',
    controller: ES6_Module,
  },
  {
    path: '/es6_dynamic',
    controller: import('./es6_dynamic/Controller'),
  },
  {
    path: '/lazy',
    controller: import('./lazy/controller'),
  },
  {
    path: '/prefetch-header',
    controller: import('./prefetch-header/Controller'),
  },
  {
    path: '/batch-refresh',
    controller: import('./batch-refresh/Controller'),
  },
  {
    path: '/content-hash',
    controller: import('./content-hash/Controller'),
  },
]
