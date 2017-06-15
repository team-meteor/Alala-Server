import mongoose from 'mongoose'
let Schema = mongoose.Schema

let CommentSchema = new Schema({
	createdBy: {
		type: Schema.Types.ObjectId, 
		ref: 'User'
	},
	likeCount: {
		type: Number,
		default: 0
	},
	isLiked: {
		type: Boolean,
		default: false
	},
	content: {
		type: String
	}
})

module.exports = mongoose.model('Comment', CommentSchema)