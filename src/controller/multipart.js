import path from 'path'
import multer from 'multer'
import sharp from 'sharp'
import AWS from 'aws-sdk'
import {
	Router
} from 'express'

import Multipart from '../model/multipart'
import awskey from '../config/credentials'

const storage = multer.memoryStorage()
const upload = multer({
	storage: storage
})
AWS.config.update({
	accessKeyId: awskey.accessKeyId,
	secretAccessKey: awskey.secretKey,
	region: 'ap-northeast-2'
})
const s3 = new AWS.S3()
const sizes = [640, 320, 200, 128, 64, 40]

export default ({
	config,
	db
}) => {
	let api = Router()
	api.post('/', upload.single('multipart'), function (req, res, next) {
		const fileName = Date.now()
		let uploadCounter = 0

		function callback() {
			let multipart = new Multipart()
			multipart.fileName = fileName
			multipart.save((err) => {
				if (err) {
					res.send(err)
				}
				res.send(multipart._id)
			})
		}

		function sharpBuffer(size) {
			sharp(req.file.buffer).resize(size).toBuffer((err, buffer, info) => {
				s3.putObject({
					Bucket: 'alala-static',
					Key: fileName + String(size) + path.extname(req.file.originalname),
					Body: buffer,
					ACL: 'public-read'
				}, (err, data) => {
					if (data) {
						uploadCounter++
						if (uploadCounter === sizes.length) {
							callback()
						}
					}
				})
			})
		}

		function videoBuffer(file) {
			s3.putObject({
				Bucket: 'alala-static',
				Key: fileName + path.extname(req.file.originalname),
				Body: file.buffer,
				ACL: 'public-read'
			}, (err, data) => {
				if (data) {
					if (data) {
						callback()
					}
				}
			})
		}
		if (req.file.mimetype === "image/jpg") {
			sizes.forEach(sharpBuffer)
		} else {
			videoBuffer(req.file)
		}
	})
	return api
}