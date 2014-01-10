
var ToolingAPI = require('../tooling/tooling.js');
var _          = require('underscore');
var moment = require('moment');
var wait = require('wait.for');


exports.index = function(req, res){
  res.render('index');
};

exports.apex = function(req, res){
var api = ToolingAPI.create({oauth: req.session.passport.user._oauthData});
  api.getApexClasses(function(err, apexClasses){
    if(err) console.log(err);
    api.getCoverageForClasses(apexClasses, function(err, response){
      var result = [];
      for(x in response){
        if(response[x].coverage !== undefined){
          var apex = response[x];
          apex.coverage.percent = 0;
          if(apex.coverage.NumLinesCovered > 0 || apex.coverage.NumLinesUncovered > 0){
            apex.coverage.percent = ((apex.coverage.NumLinesCovered / (apex.coverage.NumLinesCovered + apex.coverage.NumLinesUncovered) ) *100).toPrecision(4);
          }
          result.push(response[x]);
        }
        var orgCoverage = {
          NumLinesCovered : 0,
          NumLinesUncovered: 0,
          percent : 0
        };
        _.each(result, function(obj){
          orgCoverage.NumLinesCovered   += obj.coverage.NumLinesCovered;
          orgCoverage.NumLinesUncovered += obj.coverage.NumLinesUncovered;
        });
        orgCoverage.percent = ((orgCoverage.NumLinesCovered / (orgCoverage.NumLinesCovered + orgCoverage.NumLinesUncovered) ) *100).toPrecision(4);
      }
      res.render('apex', { result: result, orgCoverage: orgCoverage, moment: moment });
    })
    
  });
};

exports.trigger = function(req, res){
var api = ToolingAPI.create({oauth: req.session.passport.user._oauthData});
  api.getApexTriggers(function(err, apexTriggers){
    if(err) console.log(err);
    api.getCoverageForClasses(apexTriggers, function(err, response){
      var result = [];
      for(x in response){
        if(response[x].coverage !== undefined){
          var apex = response[x];
          apex.coverage.percent = 0;
          if(apex.coverage.NumLinesCovered > 0 || apex.coverage.NumLinesUncovered > 0){
            apex.coverage.percent = ((apex.coverage.NumLinesCovered / (apex.coverage.NumLinesCovered + apex.coverage.NumLinesUncovered) ) *100).toPrecision(4);
          }
          result.push(response[x]);
        }
        var orgCoverage = {
          NumLinesCovered : 0,
          NumLinesUncovered: 0,
          percent : 0
        };
        _.each(result, function(obj){
          orgCoverage.NumLinesCovered   += obj.coverage.NumLinesCovered;
          orgCoverage.NumLinesUncovered += obj.coverage.NumLinesUncovered;
        });
        orgCoverage.percent = ((orgCoverage.NumLinesCovered / (orgCoverage.NumLinesCovered + orgCoverage.NumLinesUncovered) ) *100).toPrecision(4);
      }
      res.render('triggers', { result: result, orgCoverage: orgCoverage, moment: moment });
    })
    
  });
};

exports.ApexCodeCoverageAggregate = function(req, res) {
  var id = req.params.id;
  var api = ToolingAPI.create({oauth: req.session.passport.user._oauthData});
  api.ApexCodeCoverageAggregate(id, 'ApexClass', function(err, result){
    if(err) console.log(err);
    res.render('ApexCodeCoverageAggregate', { result: result });
  });
};

exports.ApexCodeCoverageAggregateTrigger = function(req, res) {
  var id = req.params.id;
  var api = ToolingAPI.create({oauth: req.session.passport.user._oauthData});
  api.ApexCodeCoverageAggregate(id, 'ApexTrigger', function(err, result){
    if(err) console.log(err);
    res.render('ApexCodeCoverageAggregate', { result: result });
  });
};

exports.ApexClass = function(req, res) {
  var id = req.params.id;
  var api = ToolingAPI.create({oauth: req.session.passport.user._oauthData});
  api.promise();
};