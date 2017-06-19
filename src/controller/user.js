import {
	Router
} from 'express'
import User from '../model/user'
import Photo from '../model/photo'
import ProfileName from '../model/profilename'
import passport from 'passport'

import {
	generateAccessToken,
	respond,
	authenticate
} from '../middleware/authMiddleWare'

export default ({
	config,
	db
}) => {
	let api = Router()
	api.get('/getall', authenticate, (req, res) => {
		User.find({}, (err, users) => {
			if (err) {
				res.send(err)
			}
			res.json(users)
		})
	})

	api.post('/register', (req, res) => {
		User.register(new User({
				username: req.body.email
			}), req.body.password,
			function (err, user) {
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

	api.post('/profile/checkname', (req, res) => {
		ProfileName.findOne({
			name: req.body.name
		}, (err, name) => {
			if (err) {
				res.send(err)
			}
			if (name) {
				res.json({
					isunique: false,
					message: "username alreay exists"
				})
			} else {
				res.json({
					isunique: true,
					message: "available username"
				})
			}
		})
	})

	api.put('/profile/', authenticate, (req, res) => {
		console.log("user", req.user)
		User.findById(req.user.id, (err, user) => {
			if (err) {
				res.send(err)
			}
			let newProfileName = ProfileName()
			newProfileName.name = req.body.profilename
			newProfileName.save((err) => {
				console.log(newProfileName)
				if (err) {
					res.send(err)
				}
				Photo.findById(req.body.photoId, (err, id) => {
					if (err) {
						res.send(err)
					}
					if (id) {
						user.photoId = id
					}
					user.profilename = newProfileName._id
					user.save((err) => {
						if (err) {
							res.send(err)
						}
						res.json({
							message: 'profile updated'
						})
					})
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