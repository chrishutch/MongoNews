// Setup mongoose and schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NewsSchema = new Schema({
  title: {
    type: String,
    unique: true
  },
  link: {
      type: String
  },
  comment: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]
});

var Article = mongoose.model("Article", NewsSchema);

// Export Article
module.exports = Article;
