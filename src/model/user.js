import mongoose from 'mongoose'
const Schema = mongoose.Schema
import passportLocalMongoose from 'passport-local-mongoose';

let User = new Schema({
    email: {
			type: String,
		},
    password: {
			type: String,
		},
		profilename: {
			type: String,
			default: ""
		},
		photoId: {
			type: Schema.Types.ObjectId,
			ref: 'Photo'
		},
		following: [{
			type: Schema.Types.ObjectId,
			ref: 'User'
		}]
})

User.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', User)
