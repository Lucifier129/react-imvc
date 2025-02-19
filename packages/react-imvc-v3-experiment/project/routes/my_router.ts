import express, { Router } from 'express'
import http from 'http'

const router = Router()

export default function (app: express.Express, server: http.Server) {
  app.use('/my_router', router)
  // @ts-ignore
  server.isTouched = true
  // @ts-ignore
  app.isTouched = true
}

router.get('/', (req, res) => {
  res.json({
    ok: true,
  })
})
