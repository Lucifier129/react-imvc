export default [
    {
        path: '/static_view',
        controller: require('./static-view/Controller')
    },
    {
        path: '/static_view_csr',
        controller: require('./static-view-csr/Controller')
    },
    {
        path: '/basic_state',
        controller: require('./basic_state/Controller')
    }
]