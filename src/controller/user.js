import {
	Router
} from 'express'
import User from '../model/user'
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
	api.get('/all', authenticate, (req, res) => {
		// User.find({}, (err, users) => {
		// 	if (err) {
		// 		res.send(err)
		// 	}
		// 	res.json(users)
		// })

		User.find({}).populate([{
				path: 'followers'
			},
			{
				path: 'following'
			}
		]).exec((err, users) => {
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
		User.findById(req.user.id, (err, user) => {
			if (err) {
				res.send(err)
			}
			let newProfileName = ProfileName()
			newProfileName.name = req.body.profileName
			newProfileName.save((err) => {
				if (err) {
					res.send(err)
				}
				user.multipartId = req.body.multipartId
				user.profileName = req.body.profileName
				user.email = req.body.email
				user.displayName = req.body.displayName
				user.bio = req.body.bio
				user.website = req.body.website
				user.gender = req.body.gender
				user.phone = req.body.phone
				user.save((err) => {
					if (err) {
						res.send(err)
					}
					res.json(user)
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
			if (err) {
				res.send(err)
			}
			User.findById(req.body.id, (err, targetUser) => {
				if (err) {
					res.send(err)
				}
				if (me.following.length === me.following.filter(item => String(item) !== String(targetUser._id)).length && targetUser.followers.length === targetUser.followers.filter(item => String(item) !== String(me._id)).length) {
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
							User.findById(me._id).populate([{
									path: 'followers'
								},
								{
									path: 'following'
								}
							]).exec((err, user) => {
								res.json(user)
							})
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
						User.findById(me._id).populate([{
								path: 'followers'
							},
							{
								path: 'following'
							}
						]).exec((err, user) => {
							res.json(user)
						})
					})
				})
			})
		})
	})

	return api
}