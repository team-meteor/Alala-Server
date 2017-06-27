import express from 'express'
import config from '../config'
import initializeDb from '../db'
import middleware from '../middleware'
import post from '../controller/post'
import user from '../controller/user'
import multipart from '../controller/multipart'

let router = express()

// connect to db
initializeDb(db => {
    // internal middleware
    router.use(middleware({ config, db }))
    
    // api routes v1
    router.use('/post', post({ config, db }))
    router.use('/user', user({ config, db }))
		router.use('/multipart', multipart({ config, db }))
})

export default router