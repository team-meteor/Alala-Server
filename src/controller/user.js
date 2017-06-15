import { Router } from 'express'
import User from '../model/user'
import Photo from '../model/photo'
import passport from 'passport'

import { generateAccessToken, respond, authenticate } from '../middleware/authMiddleWare'

export default ({ config, db }) => {
	let api = Router()
	api.get('/getall',authenticate, (req, res) => {
		User.find({}, (err, users) => {
			if (err) {
				res.send(err)
			}
			res.json(users)
		})
	})
	
	api.post('/register', (req, res) => {
		// console.log(req.body)
		User.register(new User({ username: req.body.email }), req.body.password,
		function(err, user) {
			if (err) {
				if (err.name === "UserExistsError") {
					console.log("User Exists")
					return res.status(409).send(err)
				} else {
					return res.status(500).send(err)
				}
			}
			passport.authenticate(
				'local', {
					session: false
				})(req, res, () => {
						res.status(200).send(user._id)
				})
		})
	})
	
	api.put('/profile/', authenticate, (req, res) => {
		User.findOne({ username: req.body.email } , (err, user) => {
			console.log("user", user)
			if (err) {
				res.send(err)
			}
			user.profilename = req.body.profilename
			Photo.findById(req.body.photoId, (err, id) => {
				if (err) {
					res.send(err)
				}
				user.photoId = id
				user.save((err) => {
					if (err) {
						res.send(err)
					}
					res.json({ message: 'profile updated' })
				})
			})
		})
	})
	
	api.post('/login', passport.authenticate(
		'local', {
			session: false,
			scope: []
		}), generateAccessToken, respond)
		
	api.get('/logout', authenticate, (req, res) => {
		req.logout()
		res.status(200).send('Succeefully logged out')
	})
	
	api.get('/me', authenticate, (req, res) => {
		res.status(200).json(req.user)
	})
	
	return api
}