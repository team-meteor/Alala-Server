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
		let counter = 0

		function uploadImage(file) {
			sizes.forEach(function (size) {
				sharp(file.buffer).resize(size).max().toBuffer((err, buffer, info) => {
					const uploadedFilename = size + "_" + file.originalname
					s3.putObject({
						Bucket: 'alala-static',
						Key: uploadedFilename,
						Body: buffer,
						ACL: 'public-read'
					}, (err, data) => {
						counter += 1
						callback()
					})
				})
			})
		}

		function uploadVideo(file) {
			s3.putObject({
				Bucket: 'alala-static',
				Key: file.originalname,
				Body: file.buffer,
				ACL: 'public-read'
			}, (err, data) => {
				if (data) {
					counter += 1
					callback()
				}
			})
		}

		function callback() {
			if (fileNames.length === counter) {
				res.json(fileNames)
			}
		}
		req.files.forEach(function (file) {
			if (file.mimetype.includes("image")) {
				const dimensions = sizeOf(file.buffer)
				file.originalname = String(dimensions.height / dimensions.width) + "_" + String(Date.now()) + path.extname(file.originalname)
				fileNames.push(file.originalname)
				uploadImage(file)
			} else {
				uploadVideo(file)
				file.originalname = String(Date.now()) + path.extname(file.originalname)
			}
		})
	})
	return api
}