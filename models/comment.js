// Setup mongoose and schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// make NoteSchema a Schema
var CommentSchema = new Schema({
  comment: {
    type: String
  }
});

var Comment = mongoose.model("Comment", CommentSchema);

// Export Comment
module.exports = Comment;
