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
		type: String
	},
	multipartId: {
		type: String
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
	},
	displayName: {
		type: String
	},
	bio: {
		type: String
	},
	website: {
		type: String
	},
	gender: {
		type: String
	},
	phone: {
		type: String
	}
})

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', UserSchema)