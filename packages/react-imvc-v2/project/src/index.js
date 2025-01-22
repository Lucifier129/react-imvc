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
        path: '/life_cycle',
        controller: () => import('./life-cycle/Controller'),
    },
    {
        path: '/model',
        controller: () => import('./model/Controller'),
    },
    {
        path: '/lazy',
        controller: () => import('./lazy/controller'),
    },
    {
        path: '/preload',
        controller: () => import('./preload/Controller'),
    },
    {
        path: '/prefetch-header',
        controller: () => import('./prefetch-header/Controller'),
    },
    {
        path: '/batch-refresh',
        controller: () => import('./batch-refresh/Controller'),
    },
]
