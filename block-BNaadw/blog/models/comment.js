var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  content: String,
  likes: {type: Number, default: 0},
  author: String,
  articleId: {type: Schema.Types.ObjectId, ref: "Article"},
}, {timestamps: true});

module.exports = mongoose.model("Comment", commentSchema);
