import mongoose from 'mongoose'
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
}, {
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
})

PostSchema.virtual('isLiked').get(function() {
	return this.likedUser.length > 0
})

module.exports = mongoose.model('Post', PostSchema)