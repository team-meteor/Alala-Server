var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var postSchema = new Schema({
    text: String,
    image: String,
    post_created: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Post', postSchema)