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
					user.profileName = newProfileName._id
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
		User.findById(req.user.id)
			.populate('following').populate('followers')
			.exec((err, user) => {
				res.status(200).json(user)
			})
	})

	api.post('/follow', authenticate, (req, res) => {
		User.findById(req.user.id, (err, me) => {
			User.findById(req.body.id, (err, targetUser) => {
				if (me.following.includes(targetUser._id) === false && targetUser.followers.includes(me._id) == false) {
					me.following.push(targetUser._id)
					targetUser.followers.push(me._id)
					me.save((err) => {
						if (err) {
							res.send(err)
						}
						targetUser.save((err) => {
							if (err) {
								res.send(err)
							}
							res.status(200).send('follow successed')
						})
					})
				} else {
					res.status(200).send('already followed')
				}
			})
		})
	})

	api.post('/unfollow', authenticate, (req, res) => {
		User.findById(req.user.id, (err, me) => {
			User.findById(req.body.id, (err, targetUser) => {
				me.following = me.following.filter(item => String(item) !== String(targetUser._id))
				targetUser.followers = targetUser.followers.filter(item => String(item) !== String(me._id))
				me.save((err) => {
					if (err) {
						res.send(err)
					}
					targetUser.save((err) => {
						if (err) {
							res.send(err)
						}
						res.status(200).send('unfollow successed')
					})
				})
			})
		})
	})

	return api
}