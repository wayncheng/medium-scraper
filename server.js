"use strict";
(function() {
  // DEPENDENCIES ===================================
  var express = require("express");
  var bodyParser = require("body-parser");
  var exphbs = require("express-handlebars");
  var path = require("path");
  var methodOverride = require("method-override");
  require("dotenv").config();
  // var mongojs = require("mongojs");
  var request = require("request");
  var cheerio = require("cheerio");

  // Database configuration
  // var databaseUrl = "exchanges";
  // var collections = ["nyse", "nasdaq"];

  // MONGOOSE =======================================
  var mongoose = require("mongoose");
  mongoose.connect(process.env.MONGODB_URI);

  var Schema = mongoose.Schema;

  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function() {
    // we're connected!
  });

  // CONFIG =========================================
  var app = express();
  var port = process.env.PORT || 3000;

  app.disable("x-powered-by");

  // Set Static Directory
  app.use(express.static(path.join(__dirname, "public")));

  // Set Handlebars
  app.engine("handlebars", exphbs({ defaultLayout: "main" }));
  app.set("view engine", "handlebars");

  // Set Body Parser
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
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
  // var qURL = `https://finance.yahoo.com/quote/${symbol}?p=${symbol}`; // Yahoo Finance URL
  //=================================================
  // Stock symbols to scrape
  //   var arr = [ "AAPL", "NFLX", "AMZN", "TSLA", "SNAP", "DIS", "NKE", "SBUX", "FB", "BRK.A" ];
  //   var arr = ["AAPL", "NFLX", "AMZN", "TSLA", "TWTR"];
  //   var arr = ["AMZN"];

  // ROUTES =========================================

  // var fetchController = require("./controllers/fetch-controller.js");
  // app.use("/fetch", fetchController);

  //==================================================
  app.get("/feed", function(req, res) {

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

        // Article Thumbnail Image
        var imageURL = $el.find(".progressiveMedia-image").attr("data-src");
        var thumbURL = $el.find(".progressiveMedia-thumbnail").attr("src");
		// u-block u-backgroundSizeCover u-backgroundOriginBorderBox
        // Meta details
        var metaWrap = $el.find(".postMetaInline-authorLockup");
		var authorURL_raw = metaWrap.children("a").attr("href");
		var authorURL = authorURL_raw.split('?source')[0];
        var author = metaWrap.children("a").text();
        var date = metaWrap
		  .find(".js-postMetaInlineSupplemental a time")
		  .text();
        //   .attr("datetime");

        results.push({
          title: title,
          link: link,
          image: imageURL,
          thumbnail: thumbURL,
          author: author,
          author_profile: authorURL,
          date: date
		});
	  });
	  
	  console.log("results", results);
	  res.render('feed',{
		  results: results,
		  title: 'Newsfeed'
	  });

	});

    // }
  });
  
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
