// blah1 is the column name/ name attr in html
"use strict";
(function() {

  var express = require("express");
  var router = express.Router();
  var model = require("../models/model.js");

//================================================== 
router.get("/", function(req, res) {
    model.all(function(data) {
      var hbsObject = {
        models: data
      };
      console.log(hbsObject);
      res.render("index", hbsObject);
    });s
  });


//==================================================
module.exports = router; // Export routes for server.js to use.
////////////////////////////////////////////////////
})();
