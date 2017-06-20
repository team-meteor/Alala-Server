import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import config from './config'
import routes from './routes'
import passport from 'passport'
const LocalStrategy = require('passport-local').Strategy

let app = express()
app.server = http.createServer(app)

// middleware
app.use(bodyParser.json({
  limit: config.bodyLimit
}))

app.use('/static', express.static('uploads'))

// passport config
app.use(passport.initialize())
let User = require('./model/user')
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  User.authenticate()
))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// api routes v1
app.use('/api/v1', routes)

app.server.listen(config.port)
console.log(`Started on port ${app.server.address().port}`)

export default app

