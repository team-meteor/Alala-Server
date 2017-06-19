import mongoose from 'mongoose'
let Schema = mongoose.Schema

let profileNameSchema = new Schema({
	name: {
		type: String,
	}
})

module.exports = mongoose.model('ProfileName', profileNameSchema)