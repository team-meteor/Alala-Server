var express = require('express')
var multer = require('multer')
var path = require('path')
var fs = require('fs');

var router = express.Router()
var Post = require('../model/post')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname +'/../uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
var upload = multer({ storage: storage })

router.route('/upload')
    .post(upload.single('image'), function(req, res){
        if (req.file) {
            // console.log(req.body);
            return res.json({"ok": req.file.filename})
        }
        res.sendStatus(404)
    })

router.route('/posts')
    .post(function(req, res) {
        var newPost = Post()
        newPost.text = req.body.text
        newPost.image = req.body.image

        newPost.save(function(err, post) {
            if (err) {
                return res.send(err);
            }
            return res.send({ id: post.id})
        })
    })
    .get(function(req, res) {
        // Post.find(function(err, posts) {
        //     if (err) {
        //         return res.send(err)
        //     }
        //     return res.send({ "posts" : posts.sort("post_created", "descending") })
        // })
        Post.find({}).sort({post_created: -1}).exec(function(err, posts) {
            if (err) {
                return res.send(err)
            } 
            return res.send({"posts": posts})
        })
    })

router.route('/posts/:id')
    .get(function(req, res) {
        Post.findById(req.params.id, function(err, post) {
            if (err) {
                return res.send(err)
            }
            // console.log(post)
            return res.send({ "post": post })
        })
    })
    .put(function(req, res) {
        Post.findByIdAndUpdate(req.params.id, req.body, function(err, result) {
            if (err) {
                return res.send(err)
            }
            // console.log(result)
            // return res.json({ "updated": 1 })
            Post.findById(req.params.id, function(req, result) {
                return res.json({"post" : result })
            })
        })
    })
    .delete(function(req, res) {
        Post.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
                return res.send(err)
            }
            return res.json({ "deleted": 1 })
        })
    })


module.exports = router