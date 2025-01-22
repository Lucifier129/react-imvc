process.env.NODE_ENV = 'production'

import { start } from '../dist'
import config from './imvc.config'

start({
  config: {
    ...config,
    root: __dirname,
    logger: 'dev',
  },
})
