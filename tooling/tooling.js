var request = require('request')
var qs      = require('querystring');
var url     = require('url');
var _       = require('underscore');
var q       = require('q');


var ToolingAPI = function(opts){
  this.oauth = opts.oauth;
};

ToolingAPI.prototype.getApexClasses = function(callback) {
  var self = this;
  var query = 'SELECT Id, Name, ApiVersion, CreatedDate, LastModifiedDate FROM ApexClass';
  var uri = self.oauth.instance_url +'/services/data/v29.0/tooling/query/';
  var opts = self.getOpts(uri, 'GET');
  opts.qs = {q: query};
  request(opts, function(err, res, body){
    if(err){
      console.log('***************FREAK OUT');
      console.log(err);
      callback(err, null);
    }else{
      var apexClasses = {};
      var data = JSON.parse(body);
      _.each(data.records, function(record){
        apexClasses[record.Id] = record;
      });
      callback(null, apexClasses);
    }
  });
};

ToolingAPI.prototype.getApexTriggers = function(callback) {
  var self = this;
  var query = 'SELECT Id, Name, ApiVersion, CreatedDate, LastModifiedDate FROM ApexTrigger';
  var uri = self.oauth.instance_url +'/services/data/v29.0/tooling/query/';
  var opts = self.getOpts(uri, 'GET');
  opts.qs = {q: query};
  request(opts, function(err, res, body){
    if(err){
      console.log('***************FREAK OUT');
      console.log(err);
      callback(err, null);
    }else{
      var apexTriggers = {};
      var data = JSON.parse(body);
      _.each(data.records, function(record){
        apexTriggers[record.Id] = record;
      });
      callback(null, apexTriggers);
    }
  });
};

ToolingAPI.prototype.getCoverageForClasses = function(apexClasses, callback) {
  var self = this;
  var query = 'SELECT Id, ApexClassorTriggerId, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate';
  var uri = self.oauth.instance_url +'/services/data/v29.0/tooling/query/';
  var opts = self.getOpts(uri, 'GET');
  opts.qs = {q: query};
  request(opts, function(err, res, body){
    if(err){
      callback(err, null);
    }else{
      var data = JSON.parse(body);
      _.each(data.records, function(record){
        if(apexClasses[record.ApexClassOrTriggerId] !== undefined ){
          apexClasses[record.ApexClassOrTriggerId].coverage = record;
        }
      });
      callback(null, apexClasses);
    }
  });
};

ToolingAPI.prototype.orgCodeCoverage = function(callback) {
  var self = this;

    var query = 'SELECT Id, ApexClassorTriggerId, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate';
    var uri = self.oauth.instance_url +'/services/data/v29.0/tooling/query/';
    var opts = self.getOpts(uri, 'GET');
    opts.qs = {q: query};
    request(opts, function(err, res, body){
      if(err){
        console.log('err');
        console.log(err);
        return callback(err, null);
      }else{
        var codeCoverage = JSON.parse(body);
        var results = aggResult.records;
        var data = [];
        self.getApexClasses(codeCoverage.records, function(err, resp){
          if(err) console.log(err);
          console.log(resp);
          _.each(results, function(result){
            var id = result.ApexClassOrTriggerId;
            var test = resp[id];
            if(test != null){
              test.coverage = result;
              data.push(test);
            }
          });
          console.log(data);
          return callback(null, data);
        });        
      }
    });
};

ToolingAPI.prototype.ApexCodeCoverageAggregate = function(id, type, callback) {
  var self = this;
  var uri = self.oauth.instance_url +'/services/data/v29.0/tooling/sobjects/ApexCodeCoverageAggregate/'+id;
  var opts = self.getOpts(uri, 'GET');
  return request(opts, function(err, res, body){
    if(err){
      console.log('err');
      return callback(err, null);
    }else{
      var CodeCoverage = JSON.parse(body);
      console.log('got the code coverage agg back');
      console.log(CodeCoverage);
      var uri = self.oauth.instance_url +'/services/data/v29.0/tooling/sobjects/'+type+'/'+CodeCoverage.ApexClassOrTriggerId;
      var opts = self.getOpts(uri, 'GET');
      return request(opts, function(err, res, body){
        if(err){
          return callback(err, null);
        }else{
          var ApexClass = JSON.parse(body);
          CodeCoverage.ApexClass = ApexClass;
          return callback(null, CodeCoverage);
        }
      });
      
    }
  });
};


ToolingAPI.prototype.getOpts = function(uri, method) {
  var self = this;
  var opts = {};
  opts.uri = uri;
  opts.method = method || 'GET'
  opts.headers = {
      'Authorization': 'Bearer ' + self.oauth.access_token,
      'Accept': 'application/json;charset=UTF-8'
  };
  opts.headers['content-type'] = 'application/json';
  return opts;
};

module.exports.create = function(opts) {
  return new ToolingAPI(opts);
}
