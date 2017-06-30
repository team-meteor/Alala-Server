import {
	Router
} from 'express'
import Post from '../model/post'
import User from '../model/user'
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
			const query = {
				createdBy: {
					$in: user.following
				}
			}
			const options = {
				sort: { createdAt: -1 },
				populate: ['createdBy', 'likedUsers', 'comments'],
				// offset: 2
				// limit: 10
				page : req.body.page
			}
			Post.paginate(query, options, (err, result) => {
				result.nextPage = Number(result.page) + 1
				res.json(result)
			})
		})
	})

	// get all my followed user's posts
	api.get('/mine', authenticate, (req, res) => {
		Post.find({
			createdBy: req.user.id
		}, (err, posts) => {
			if (err) {
				res.send(err)
			}
			res.json(posts)
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
		post.description = req.body.description
		post.multiparts = receivedmultiparts
		post.save(function (err, savedPost) {
			if (err) {
				res.send(err)
			}
			res.json({
				savedPost
			})
		})
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
				post.likedUser.push(user._id)
				post.save((err, savedPost) => {
					res.json(savedPost)
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
				post.likedUser = post.likedUser.filter(item => String(item) !== String(user._id))
				post.save((err, savedPost) => {
					res.json(savedPost)
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