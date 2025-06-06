import my_router from './my_router'

export { my_router }

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const my_async_router = async (app, server) => {
    console.log('my_async_router is running')
    await delay(100)
    console.log('my_async_router is done')
}

export const my_another_async_router = async (app, server) => {
    console.log('my_another_async_router is running')
    await delay(100)
    console.log('my_another_async_router is done')
}

export const my_sync_router = [
    (app, server) => {
        console.log('my_sync_router is running')
        console.log('my_sync_router is done')
    },
    (app, server) => {
        console.log('my_sync_router1 is running')
        console.log('my_sync_router1 is done')
    },
]

export default [
    async (app, server) => {
        console.log('index router is running')
        console.log('index router is done')
    },
    async (app, server) => {
        console.log('index1 router is running')
        console.log('index1 router is done')
    },
]
