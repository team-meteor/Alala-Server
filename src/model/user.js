import mongoose from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose';
const Schema = mongoose.Schema

let UserSchema = new Schema({
	email: {
		type: String,
	},
	password: {
		type: String,
	},
	profileName: {
		type: Schema.Types.ObjectId,
		ref: 'ProfileName'
	},
	photoId: {
		type: Schema.Types.ObjectId,
		ref: 'Photo'
	},
	following: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	followers: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	createdAt: {
		type: Date,
		default: Date.now
	}
})

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', UserSchema)