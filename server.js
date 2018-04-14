// Dependencies
var mongoose = require("mongoose");
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var methodOverride = require("method-override");
// Import Comment and Article models
var Comment = require("./models/comment.js");
var Article = require("./models/article.js");

// Scraping
var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;


// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

// Setup bodyParser
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(methodOverride('_method'));

// Setup public folder
app.use(express.static("./public"));

// Setup Handlebars
var express = require("express-handlebars");

app.set('views', __dirname + '/views');
app.engine("handlebars", express({ defaultLayout: "main", layoutsDir: __dirname + "/views/layouts" }));
app.set("view engine", "handlebars");


var databaseGame = "mongodb://localhost/gamersnest";
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseGame);
}
var db = mongoose.connection;

// Added Heroku here
/*mongoose.connect("mongodb://heroku");*/

db.on("error", function(error) {
  console.log("Error: ", error);
});

db.once("open", function() {
  console.log("Connection to Mongo successful!");
});



app.get("/", function (req, res) {
  Article.find({})
    .exec(function (error, data) {
      if (error) {
        res.send(error);
      }
      else {
        var newArticle = {
          Article: data
        };
        res.render("index", newArticle);
      }
    });
});

// GET Request for GameSpot
app.get("/search", function(req, res) {
  request("https://www.gamespot.com", function(error, response, html) {
    var $ = cheerio.load(html);
    $("h3.media-title").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      result.link = $(this).parent("a").attr("href");

      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
    res.redirect("/");
    console.log("Successfully Scraped");
  });
});

app.post("/comments/:id", function (req, res) {
  var newNote = new Comment(req.body);
  newNote.save(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("this is the DOC " + doc);
      Article.findOneAndUpdate({
        "_id": req.params.id
      },
        { $push: { "comment": doc._id } }, {new: true},  function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log("Comment: " + doc);
            res.redirect("/comments/" + req.params.id);
          }
        });
    }
  });
});

app.get("/comments/:id", function (req, res) {
  console.log("This is the req.params: " + req.params.id);
  Article.find({
    "_id": req.params.id
  }).populate("comment")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        var notesObj = {
          Article: doc
        };
        console.log(notesObj);
        res.render("comments", notesObj);
      }
    });
});

app.get("/delete/:id", function (req, res) {
  Comment.remove({
    "_id":req.params.id
  }).exec(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("Comment was deleted successfully.");
      res.redirect("/" );
    }
  });
});

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on PORT" + PORT + "!");
});
