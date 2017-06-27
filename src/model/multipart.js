import mongoose from 'mongoose'
let Schema = mongoose.Schema

let MultipartSchema = new Schema({
	fileName: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('Multipart', MultipartSchema)