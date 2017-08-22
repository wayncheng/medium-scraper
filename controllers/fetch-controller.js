"use strict";
(function() {
	var express = require("express");
	var bodyParser = require("body-parser");
	var router = express.Router();
	//   var db = require("../models");
	var fetch = require("../models/fetch.js");
	// Stock symbols to scrape
	// var arr = [ "AAPL", "NFLX", "AMZN", "TSLA", "SNAP", "DIS", "NKE", "SBUX", "FB", "BRK.A" ];
	var arr = ["AAPL", "NFLX", "AMZN", "TSLA", "TWTR"];
	// var arr = ["AMZN"];

	/////////////////////////////////////////////////////
	router.get("/stocks/:id?", function(req, res) {
		var reqID = req.params.id;
		
		if (!reqID){
			console.log('--> no stock symbol specified');
		}
		else {
			console.log('... Stock:',reqID;
		}
	});

	////////////////////////////////////////////////////
	module.exports = router;
})();
