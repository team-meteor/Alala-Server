import {
	Router
} from 'express'
import Post from '../model/post'
import User from '../model/user'
import Comment from '../model/comment'
import {
	authenticate
} from '../middleware/authMiddleWare'

export default ({
	config,
	db
}) => {
	let api = Router()
	// get all posts created by logined user
	api.post('/feed', authenticate, (req, res) => {
		User.findById(req.user.id, (err, user) => {
			if (err) {
				res.send(err)
			}
			user.following.push(req.user.id)
			const query = {
				createdBy: {
					$in: user.following
				}
			}
			const options = {
				sort: {
					createdAt: -1
				},
				populate: [{
						path: 'createdBy'
					},
					{
						path: 'likedUsers'
					},
					{
						path: 'comments',
						model: 'Comment'
					},
					{
						path: 'comments',
						populate: {
							path: 'createdBy'
						}
					},
				],
				page: req.body.page
			}
			Post.paginate(query, options, (err, result) => {
				result.nextPage = String(Number(result.page) + 1)
				res.json(result)
			})
		})
	})

	api.post('/mine', authenticate, (req, res) => {
		const query = {
			createdBy: req.user.id
		}
		const options = {
			sort: {
				createdAt: -1
			},
			populate: [{
					path: 'createdBy'
				},
				{
					path: 'likedUsers'
				},
				{
					path: 'comments',
					model: 'Comment'
				},
				{
					path: 'comments',
					populate: {
						path: 'createdBy'
					}
				},
			],
			page: req.body.page
		}
		Post.paginate(query, options, (err, result) => {
			res.json(result)
		})
	})

	// get a post by id
	api.get('/:id', authenticate, (req, res) => {
		Post.findById(req.params.id, (err, post) => {
			if (err) {
				res.send(err)
			}
			res.json(post)
		})
	})

	// add a post
	api.post('/add', authenticate, (req, res) => {
		let post = new Post()
		let receivedmultiparts = []
		req.body.multiparts.forEach(function (element) {
			receivedmultiparts.push(element)
		});
		post.createdBy = req.user.id
		post.multiparts = receivedmultiparts
		if (req.body.content !== null) {
			let newComment = new Comment()
			newComment.createdBy = req.user.id
			newComment.content = req.body.content
			newComment.save((err) => {
				post.comments.push(newComment)
				post.save(function (err, savedPost) {
					if (err) {
						res.send(err)
					}
					Post.findById(savedPost._id).populate([{
							path: 'createdBy'
						},
						{
							path: 'likedUsers'
						},
						{
							path: 'comments',
							model: 'Comment'
						},
						{
							path: 'comments',
							populate: {
								path: 'createdBy'
							}
						},
					]).exec((err, post) => {
						res.json(post)
					})
				})
			})
		} else {
			post.save(function (err, savedPost) {
				if (err) {
					res.send(err)
				}
				Post.findById(savedPost._id).populate('createdBy').exec((err, post) => {
					res.json(post)
				})
			})
		}
	})

	api.post('/like', authenticate, (req, res) => {
		Post.findById(req.body.id, (err, post) => {
			if (err) {
				res.send(err)
			}
			User.findById(req.user.id, (err, user) => {
				if (err) {
					res.send(err)
				}
				if (post.likedUsers.indexOf(user._id) === -1) {
					post.likedUsers.push(user._id)
				}
				post.save((err, savedPost) => {
					Post.findById(savedPost.id).populate({
						path: 'likedUsers'
					}).exec((err, post) => {
						res.json(post)
					})
				})
			})
		})
	})

	api.post('/unlike', authenticate, (req, res) => {
		Post.findById(req.body.id, (err, post) => {
			if (err) {
				res.send(err)
			}
			User.findById(req.user.id, (err, user) => {
				if (err) {
					res.send(err)
				}
				post.likedUsers = post.likedUsers.filter(item => String(item) !== String(user._id))
				post.save((err, savedPost) => {
					Post.findById(savedPost.id).populate('likedUsers').exec((err, post) => {
						res.json(post)
					})
				})
			})
		})
	})

	api.post('/comment/add/', authenticate, (req, res) => {
		Post.findById(req.body.id, (err, post) => {
			if (err) {
				res.send(err)
			}
			let newComment = new Comment()
			newComment.createdBy = req.user.id
			newComment.content = req.body.content
			newComment.save((err, savedComment) => {
				post.comments.push(savedComment)
				post.save((err, updatedPost) => {
					Post.findById(updatedPost._id).populate('createdBy comments').exec((err, post) => {
						res.json(post)
					})
				})
			})
		})
	})

	// remove post
	api.delete('/:id', authenticate, (req, res) => {

	})

	// update post

	return api
}