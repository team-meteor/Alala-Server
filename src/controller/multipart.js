import path from 'path'
import multer from 'multer'
import sharp from 'sharp'
import sizeOf from 'image-size'
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
	api.post('/', upload.array('multiparts'), function (req, res, next) {
		let fileNames = []
		function uploadImage(file) {
			sizes.forEach(function (size) {
				sharp(file.buffer).resize(size).max().toBuffer((err, buffer, info) => {
					const uploadedFilename = Date.now() + path.extname(file.originalname)
					s3.putObject({
						Bucket: 'alala-static',
						Key: uploadedFilename,
						Body: buffer,
						ACL: 'public-read'
					}, (err, data) => {
						fileNames.push(uploadedFilename)
						callback()
					})
				})
			})
		}

		function uploadVideo(file) {
			const uploadedFilename = Date.now() + path.extname(file.originalname)
			s3.putObject({
				Bucket: 'alala-static',
				Key: uploadedFilename,
				Body: file.buffer,
				ACL: 'public-read'
			}, (err, data) => {
				if (data) {
					fileNames.push(uploadedFilename)
					callback()
				}
			})
		}

		function callback() {
			if (fileNames.length === req.files.length) {
				res.json(fileNames)
			}
		}
		req.files.forEach(function (file) {
			if (file.mimetype.includes("image")) {
				uploadImage(file)
			} else {
				uploadVideo(file)
			}
		})
	})
	return api
}