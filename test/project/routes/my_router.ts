import { Router } from 'express'
import express from 'express';
import http from 'http';

const router = Router()

export default function(app: express.Express, server: http.Server) {
    app.use('/my_router', router)
    server.isTouched = true
    app.isTouched = true
}

router.get('/', (req, res) => {
    res.json({
        ok: true
    })
})