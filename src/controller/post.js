import { Router } from 'express'
import Post from '../model/post'

import { authenticate } from '../middleware/authMiddleWare'

export default({ config, db }) => {
	let api = Router()
	// get all posts created by logined user
	api.get('/myposts', authenticate,(req, res) => {
		console.log(req.user.id)
		Post.find({ createdBy : req.user.id }, (err, posts) => {
			if (err) {
				res.send(err)
			}
			res.json(posts)
		})
	})
	
	// get all my followed user's posts
	api.get('/myfeed', authenticate,(req, res) => {
		console.log(req.user.id)
		Post.find({ createdBy : req.user.id }, (err, posts) => {
			if (err) {
				res.send(err)
			}
			res.json(posts)
		})
	})
	
	// get a post by id
	api.get('/:id', (req, res) => {
		Post.findById(req.params.id, (err, post) => {
			if (err) {
				res.send(err)
			}
			res.json(post)
		})
	})
	
	// add a post
	api.post('/add', authenticate, (req, res) => {
		// console.log(req.user.id)
		let post = new Post()
		let receivedphotos = []
		// console.log(req.body.photos)
		req.body.photos.forEach(function(element) {
			receivedphotos.push(element)
		});
		post.createdBy = req.user.id
		post.description = req.body.description
		post.photos = receivedphotos
		post.save(function(err) {
			if (err) {
				res.send(err)
			}
			res.json({ message: 'Post saved successfully' })
		})
	})
	
	// remove post
	api.delete('/:id', authenticate, (req, res) => {
		
	})
	
	// update post
	
	return api
}