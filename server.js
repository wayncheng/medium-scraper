"use strict";
(function() {
	// DEPENDENCIES ===================================
	const express = require("express");
	const bodyParser = require("body-parser");
	const logger = require('morgan');
	const exphbs = require("express-handlebars");
	const path = require("path");
	const methodOverride = require("method-override");
	require("dotenv").config();
	// var mongojs = require("mongojs");
	const request = require("request");
	const cheerio = require("cheerio");
	const moment = require('moment');

	// Database configuration
	// var databaseUrl = "exchanges";
	// var collections = ["nyse", "nasdaq"];

// CONFIG =======================================
	const mongoose = require("mongoose");
	const Article = require('./models/Article.js');
	const Comment = require('./models/Comment.js');
	mongoose.Promise = Promise;

	const app = express();
	const port = process.env.PORT || 5000;

	app.disable("x-powered-by");

	// Set Static Directory
	app.use(express.static(path.join(__dirname, "public")));

	// Set Handlebars
	app.engine("handlebars", exphbs({ defaultLayout: "main" }));
	app.set("view engine", "handlebars");

	// Use morgan with app
	app.use(logger('dev'));
	
	// Set Body Parser
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.text());
	app.use(bodyParser.json({ type: "application/vnd.api+json" }));

	// Override with POST having ?_method=
	app.use(methodOverride("_method"));

	// logs each url that is requested, then passes it on.
	app.use(function(req, res, next) {
		console.log("url : " + req.url);
		next();
	});
	//=================================================
		mongoose.connect(process.env.MONGODB_URI);
		// mongoose.connect('mongodb://localhost:27017');
		// mongoose.connect('mongodb://localhost/medium_articles');
		var db = mongoose.connection;
	
		db.on('error', function(err){
			console.log('Mongoose error:',err);
		})
		db.once("open", function() {
			// we're connected!
			console.log('Mongoose connected!');
		});
	
		var Schema = mongoose.Schema;
	
	//=================================================
		//   var entry = new Article({
		// 	  title: 'Pizza is delicious.',
		// 	  link: 'https://che.ng',
		// 	  author: 'Batman Batman',
		// 	  author_profile: 'https://instagram.com/wayncheng',
		// 	  date: 'Aug 24'
		//   });
	
		//   // Now, save that entry to the db
		//   entry.save(function(err, doc) {
		// 	if (err) { console.log(err); }
		// 	else {
		// 	  console.log(doc);
		// 	}
		//   });

	//==================================================
	app.get('/', function(req,res){
		Article.find({}, function(error, doc) {
			if (error) { console.log(error); }
			else {
			//   res.json(doc);
			  res.render('feed', {
				  results: doc,
				  title: 'Top Stories on Medium'
			  })
			}
		  });
	})
//==================================================
	app.get("/fetch", function(req, res) {
		var results = [];
		var qURL = "https://medium.com/browse/top";

		request(qURL, function(error, response, html) {
			var $ = cheerio.load(html);
			// var all_articles_wrap = $('.js-homeStream');
			var $article = $(".postArticle");

			$article.each(function(i, el) {
				var $el = $(el);

				// Grab article title
				var title = $el.find(".graf--title").text().trim();

				// Link to article
				// e.g. https://medium.com/@raulk/if-youre-a-startup-you-should-not-use-react-reflecting-on-the-bsd-patents-license-b049d4a67dd2?source=top_stories---------0----------------
				var link_raw = $el.find(".postArticle-content a").attr("href");
				var link_split = link_raw.split("?source");
				var link = link_split[0];
				// Removes the https://medium.com/ from the beginning of the url.
				// Used as ID for an article
				// var linkTail = link.slice(19).replace('/','-');
				var linkID = encodeURIComponent(link);

				// Article Thumbnail Image
				var imageURL = $el
					.find(".progressiveMedia-image")
					.attr("data-src");
				var thumbURL = $el
					.find(".progressiveMedia-thumbnail")
					.attr("src");
				// u-block u-backgroundSizeCover u-backgroundOriginBorderBox
				// Meta details
				var metaWrap = $el.find(".postMetaInline-authorLockup");
				var authorURL_raw = metaWrap.children("a").attr("href");
				var authorURL = authorURL_raw.split("?source")[0];
				var author = metaWrap.children("a").text();
				var dateRaw = metaWrap
					.find(".js-postMetaInlineSupplemental a time")
					.attr("datetime");
					// .text();
				var date = moment(dateRaw).format('MMM D, YY');
					// id: linkID,
					//   image: imageURL,
					//   thumbnail: thumbURL,
				let articleData = new Article({
					title: title,
					link: link,
					author: author,
					author_profile: authorURL,
					date: date
				});
				articleData.save(function(err,doc){
					if(err) throw err;
					else {
						console.log('doc',doc);
					}
				})
			});

			// console.log("results", results);
			// res.render("feed", {
				// results: results,
				// title: "Newsfeed"
			// });
			res.redirect('/');
		});

		// }
	});

// SAVING ITEMS ==================================================
	app.post("/api/save", function(req, res){
		let { _id, saved } = req.body;
		console.log('--> _id',_id);
		console.log('--> saved',saved);
		
		// Find document by id, then updated saved to the new status, which we got above
		let query = {_id: _id};
		Article.findOneAndUpdate(query, {$set: { saved: saved }}, function(err,doc){
			if(err) console.log(err)
		});

		// Refresh page afterwards
		res.redirect('/');
	});
// SAVED PAGE ==================================================
	app.get('/saved', function(req,res){
		Article.find({saved: true}, function(err,docs){
			if (err) console.log(err);
			else {
				res.render('feed', {
					results: docs,
					title: "Saved Items"
				})
			}
		})
	})
	// Basic HTML gets
	var routes = require("./controllers/basic-controller.js");
	app.use("/", routes);

	// ERRORS =========================================
	app.use(function(req, res) {
		res.type("text/html");
		res.status(404);
		res.render("404");
	});

	app.use(function(err, req, res, next) {
		console.error(err.stack);
		res.status(500);
		res.render("500");
	});

	// START SERVER ===================================
	app.listen(port, function() {
		console.log(`-------------------------------------------------------
                                          ready @ ${port}`);
	});
	//==================================================
})();

// var open = $('.kv__value .kv__primary')
// var price = $('.intraday__price .value').text();
// // var change = $('.intraday__change .change--point--q').text();
// // var percentchange = $('.intraday__change .change--percent--q').text();
// var change = $('.intraday__change .change--point--q bg-quote').text();
// var percentchange = $('.intraday__change .change--percent--q bg-quote').text();
// console.log('change',change);
// console.log('percentchange',percentchange);

// results.push({
// 	stock: stock,
// 	company: company,
// 	price: price,
// 	change: change,
// 	percentchange: percentchange
// })
