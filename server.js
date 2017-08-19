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
  var arr = ["AMZN"];

  app.get("/fetch", function(req, res) {
    var results = [];

    // Counter to prevent premature finish. Only sends res once all requests have returned back.
    var count = 0;

    arr.forEach(function(stock) {
      var qURL = `http://www.marketwatch.com/investing/stock/${stock}`;

      request(qURL, function(error, response, html) {
        var $ = cheerio.load(html);
        var company = $(".company__name").text();

        // var resultObj = {
        //   stock: stock,
        //   company: company
        // }

        // KEY DATA ==================================================
        var keyData = {};

        $(".kv__item").each(function(i, el) {
          var $el = $(el);
          var label = $el.find(".kv__label").text();
          var v = $el.find(".kv__primary").text();

          keyData[label] = v;
        });
        // Add to the total result object
        // resultObj.key_data = keyData

        // PERFORMANCE DATA==================================================
        var performanceData = {};
        var $row = $(".element.element--table.performance")
          .find("tbody")
          .children(".table__row");
        $row.each(function(i, el) {
          var $el = $(el);

          // Complete selector for label --> $('.element.element--table.performance').find('tbody').children('.table__row').children().first().text().trim()
          var labelEl = $el.children().first();
          var label = labelEl.text().trim();
          // Complete selector for performance --> $('.element.element--table.performance').find('tbody').children('.table__row').children().first().next().text().trim();
          var performance = labelEl.next().text().trim();
          // var performance = $el.find('.content__item.value').text().trim();

          // Write to performanceData object
          performanceData[label] = performance;
        });

        // COMPETITOR DATA==================================================
        var competitorData = {};
        var $row = $(".element.element--table.Competitors")
          .find("tbody")
          .children(".table__row");
        $row.each(function(i, el) {
          var $el = $(el);
          // Complete selector for label --> $('.element.element--table.performance').find('tbody').children('.table__row').children().first().text().trim()
          var labelEl = $el.children().first();
          var pctEl = labelEl.next();
          var marketCapEl = pctEl.next();

          var label = labelEl.text().trim();
          var pct = pctEl.text().trim();
          var marketCap = marketCapEl.text().trim();

          // Write to performanceData object
          competitorData[label] = {
            percent_change: pct,
            market_cap: marketCap
          };
        });

        // NEWS ======================================================

        // .collection__list.j-scrollElement data-type="< MarketWatch | DowJonesNetwork | Other | PressReleases >"
        // 	-- .element.element--article.j-scrollByElement
        var marketwatch_articles = [];
        var $article = $(".collection__list.j-scrollElement[data-type='MarketWatch']").children(".element");

        $article.each(function(i, el) {
        	var $el = $(el);

        	var headlineEl = $el.find(".article__headline");
        	var link = headlineEl.find("a").attr("href");
        	var headline = headlineEl.text().trim();

			// var srcset = $el.find('.article__figure img').attr('data-srcset').trim();
			// var lastLinkStart = srcset.lastIndexOf('http://'); // should give you the index right before it starts
			// var lastLinkEnd = srcset.lastIndexOf(' '); // get the last space which marks the end of link
			// var imgURL = srcset.slice(lastLinkStart,lastLinkEnd); // Extract the img URL of the largest src!

			// var imageSource = $el.find('.article__figure img').prop('currentSrc');
			var imageSource = $el.find('.article__figure img').attr('srcset');
			console.log('imageSource',imageSource);
			
			
			// Details
			var timestamp = $el.find('.article__timestamp').attr('data-est');
			var author = $el.find('.article__author').text().trim().slice(3);;

			marketwatch_articles.push({
				title: headline,
				link: link,
				image_url: imageSource,
				timestamp: timestamp,
				author: author
			})
        });

        //==================================================
        // Add performance data to result object, which is then sent to the results array
        // resultObj.performance = performanceData;

        var resultObj = {
          stock: stock,
          company: company,
          key_data: keyData,
          performance: performanceData,
		  competitors: competitorData,
			latest_news: {
				"MarketWatch": marketwatch_articles
			}
        };
        results.push(resultObj);

        // Only ends once every request is finished
        count++;
        if (count === arr.length) {
          console.log("results", results);
          res.json(results);
        }
      });
    });
    // console.log('results',results);
    // db.posts.insert({results});
    // console.log(results);
    // res.json(results);
  });

  // ROUTES =========================================
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
