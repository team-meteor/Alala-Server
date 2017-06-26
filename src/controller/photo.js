import path from 'path'
import multer from 'multer'
import sharp from 'sharp'
import AWS from 'aws-sdk'
import { Router } from 'express'

import Photo from '../model/photo'
import awskey from '../config/credentials'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const sizes = [640, 320, 200, 128, 64, 40]
AWS.config.update({
	accessKeyId: awskey.accessKeyId, 
	secretAccessKey: awskey.secretKey, 
	region: 'ap-northeast-2'})
const s3 = new AWS.S3()

export default ({ config, db }) => {
	let api = Router()

	api.post('/single', upload.single('photo'), function (req, res, next) {
		let fileName = Date.now()
		function sharpWithSize(size) {
			sharp(req.file.buffer).resize(size).toBuffer((err, data, info) => {
				return s3.putObject({
					Bucket: 'alala-static',
					Key: fileName + String(size) + path.extname(req.file.originalname),
					Body: data,
					ACL: 'public-read'
				}, (err) => {
					if (err) {
						console.log(err)
					}
				}).promise()
			})
		}
		Promise.all(sizes.map(sharpWithSize)).then(() => {
			let photo = new Photo()
			photo.fileName = fileName
			photo.save(function(err) {
				if (err) {
					res.send(err)
				}
				res.json(photo._id)
			})
		})
	})
	// 이미지 여러 개 업로드, 이미지 아이디 배열 리턴.
	api.post('/multi', upload.array('photos', 12), function (req, res, next) {
		let photoIdArray = []
		req.files.forEach(function(file) {
			let photo = Photo()
			photo.url = file.filename
			photo.save(function (err) {
				if (err) { 
					res.send(err)
				}
				photoIdArray.push(photo._id)
				if (photoIdArray.length === req.files.length) {
					res.json(photoIdArray)
				}
			})
		});
	})
	
	return api
}