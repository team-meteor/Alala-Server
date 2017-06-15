import path from 'path'
import { Router } from 'express'
import Photo from '../model/photo'
import multer from 'multer'

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function(req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname))
	}
})
const upload = multer({ storage: storage })

export default ({ config, db }) => {
	let api = Router()
	// 이미지 한 개 업로드, 이미지 아이디 리턴.
	api.post('/single', upload.single('photo'), function (req, res, next) {
		let photo = new Photo()
		photo.url = req.file.filename
		photo.save(function(err) {
			if (err) {
				res.send(err)
			}
			res.json(photo._id)
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