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
    });
  });

//==================================================
router.post("/", function(req, res) {
    model.create(
      ["blah2", "blah1"],
      [req.body.blah2, req.body.blah1],
      function() {
        res.redirect("/");
      }
    );
  });

//==================================================
router.put("/:id", function(req, res) {
    var condition = "id = " + req.params.id;
    console.log("condition", condition);

    model.update(
      {
        blah1: req.body.blah1
      },
      condition,
      function() {
        res.redirect("/");
      }
    );
  });

//==================================================
router.delete("/:id", function(req, res) {
    var condition = "id = " + req.params.id;
    console.log("condition", condition);

    model.remove(
      {
        blah1: req.body.blah1
      },
      condition,
      function() {
        res.redirect("/");
      }
    );
  });

//==================================================
module.exports = router; // Export routes for server.js to use.
////////////////////////////////////////////////////
})();
