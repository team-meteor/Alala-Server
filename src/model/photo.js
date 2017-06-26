import mongoose from 'mongoose'
let Schema = mongoose.Schema

let PhotoSchema = new Schema({
	fileName: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('Photo', PhotoSchema)