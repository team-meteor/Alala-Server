import mongoose from 'mongoose'
let Schema = mongoose.Schema

let CommentSchema = new Schema({
	createdBy: {
		type: Schema.Types.ObjectId, 
		ref: 'User'
	},
	likedUsers: [{
		type: Schema.Types.ObjectId, ref: 'User'
	}],
	createdAt: {
		type: Date,
		default: Date.now
	},
	content: {
		type: String
	}
}, {
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
})

CommentSchema.virtual('isLiked').get(function() {
	return this.likedUsers.length > 0
})

module.exports = mongoose.model('Comment', CommentSchema)