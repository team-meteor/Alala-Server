import path from 'path'
import multer from 'multer'
import sharp from 'sharp'
import AWS from 'aws-sdk'
import {
	Router
} from 'express'

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
const sizes = [40, 64, 128, 200, 320, 640]

export default ({
	config,
	db
}) => {
	let api = Router()
	api.post('/', upload.single('multipart'), function (req, res, next) {
		let fileName = Date.now()
		let ratioFileName = ""
		const extname = path.extname(req.file.originalname)
		let uploadCounter = 0

		function callback() {
			res.json(ratioFileName + extname)
		}

		function sharpBuffer(size) {
			sharp(req.file.buffer).resize(size).max().toBuffer((err, buffer, info) => {
				if (size === 40) {
					ratioFileName = info.height / info.width + "_" + fileName
				}
				s3.putObject({
					Bucket: 'alala-static',
					Key: size + "_" + ratioFileName + extname,
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

		function uploadBuffer(file) {
			s3.putObject({
				Bucket: 'alala-static',
				Key: fileName + extname,
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
		if (req.file.mimetype === "image/jpg" || req.file.mimetype === 'image/png' || req.file.mimetype === 'image/jpeg') {
			sizes.forEach(sharpBuffer)
		} else {
			uploadBuffer(req.file)
		}
	})
	return api
}