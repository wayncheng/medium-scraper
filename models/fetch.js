"use strict";
(function() {
	// var orm = require("../config/orm.js");

	var fetch = {
		stock: function(cb) {
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
					var latest_news = {
						MarketWatch: [],
						DowJonesNetwork: [],
						Other: [],
						PressReleases: []
					};
					// .collection__list.j-scrollElement data-type="< MarketWatch | DowJonesNetwork | Other | PressReleases >"
					// 	-- .element.element--article.j-scrollByElement

					for (var prop in latest_news) {
						var source = prop;
						var articles = [];

						var $article = $(
							`.collection__list.j-scrollElement[data-type='${source}']`
						).children(".element");

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
							var imageSource = $el
								.find(".article__figure img")
								.attr("srcset");
							console.log("imageSource", imageSource);

							// Details
							var timestamp = $el
								.find(".article__timestamp")
								.attr("data-est");
							var author = $el
								.find(".article__author")
								.text()
								.trim()
								.slice(3);

							// Push to corresponding array in latest_news
							latest_news[source].push({
								title: headline,
								link: link,
								image_url: imageSource,
								timestamp: timestamp,
								author: author
							});
						});
					}
					//==================================================
					// Add performance data to result object, which is then sent to the results array
					// resultObj.performance = performanceData;

					var resultObj = {
						stock: stock,
						company: company,
						key_data: keyData,
						performance: performanceData,
						competitors: competitorData,
						latest_news: latest_news
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
		}, //end fetch stock
		medium: function(cb) {}
	}; // end fetch object

	module.exports = fetch;
})();
