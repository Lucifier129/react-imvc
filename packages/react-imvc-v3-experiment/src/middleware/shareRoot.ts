/**
 * 对 req.url 进行裁剪，以便适应不同的发布路径
 */
import express from 'express'
import type { RequestHandler, Res, Req } from '..'

export default function shareRoot(
  ...rootPathList: string[]
): express.RequestHandler {
  const matcherList = rootPathList.map((rootPath) => {
    if (rootPath.charAt(rootPath.length - 1) === '/') {
      rootPath = rootPath.substr(0, rootPath.length - 1)
    }

    var ROOT_RE = new RegExp('^' + rootPath, 'i')

    return {
      rootPath,
      ROOT_RE,
    }
  })

  const handler: RequestHandler = (
    req: Req,
    res: Res,
    next: express.NextFunction
  ) => {
    if (!req.basename) {
      req.basename = ''
    }

    for (let i = 0; i < matcherList.length; i++) {
      let { rootPath, ROOT_RE } = matcherList[i]

      if (ROOT_RE.test(req.url)) {
        req.url = req.url.replace(ROOT_RE, '')
        req.basename = rootPath
        if (req.url.charAt(0) !== '/') {
          req.url = '/' + req.url
        }
        break
      }
    }

    next()
  }
  return handler as express.RequestHandler
}
