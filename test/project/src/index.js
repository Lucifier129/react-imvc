export default [
	{
		path: '/static_view',
		controller: () => import('./static-view/Controller')
	},
	{
		path: '/static_view_csr',
		controller: () => import('./static-view-csr/Controller')
	},
	{
		path: '/basic_state',
		controller: () => import('./basic_state/Controller')
	}
]
