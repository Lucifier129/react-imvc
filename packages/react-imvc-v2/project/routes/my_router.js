import { Router } from 'express'

const router = Router()

export default function (app, server) {
    app.use('/my_router', router)
    server.isTouched = true
    app.isTouched = true
}

router.get('/', (req, res) => {
    res.json({
        ok: true,
    })
})
