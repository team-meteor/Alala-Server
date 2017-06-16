import mongoose from 'mongoose'
// import User from './user'
// import Photo from './photo'
let Schema = mongoose.Schema

let PostSchema = new Schema({
	createdBy: {
		type: Schema.Types.ObjectId, ref: 'User'
	},
	photos: [{
		type: Schema.Types.ObjectId,
		ref: 'Photo'
	}],
	description: {
		type: String
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	likedUser: [{
		type: Schema.Types.ObjectId, ref: 'User'
	}],
	comments: [{
		type: Schema.Types.ObjectId, ref: 'Comment'
	}]
})

module.exports = mongoose.model('Post', PostSchema)