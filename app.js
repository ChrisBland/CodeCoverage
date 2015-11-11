
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport')
var ForceDotComStrategy = require('passport-forcedotcom').Strategy
var app = express();
var connect = require('connect');
var ToolingAPI = require('./tooling/tooling');
var cookieParser = express.cookieParser('blandio')
  , sessionStore = new connect.middleware.session.MemoryStore();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(cookieParser);
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session( {store: sessionStore} ));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new ForceDotComStrategy({
    clientID: '',
    clientSecret: '',
    callbackURL: 'http://localhost:3000/auth/forcedotcom/callback'
  },
  function(token, tokenSecret, profile, done) {
    console.log(profile);
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null, id);
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', ensureAuthenticated, function(req, res){
  res.render('index');
});


app.get('/login', passport.authenticate('forcedotcom'));
app.get('/auth/forcedotcom/callback', 
  passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
  function(req, res){
    res.redirect('/');
  });


function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
      return next();
  }
  res.redirect('/login');
};

function queryApexClasses(socket, oauth){
  var api = ToolingAPI.create({oauth: oauth});
  api.getApexClasses(function(err, res){
    var resp = {
      error: false,
      records: [],
    };
    if(err){
      resp.error = true;
      resp.errMsg = err;
    }else{
      resp.records = res;
    } 
    socket.emit('ApexClass', resp);
  });
};

function queryApexTriggers(socket, oauth){
  var api = ToolingAPI.create({oauth: oauth});
  api.getApexTriggers(function(err, res){
    var resp = {
      error: false,
      records: [],
    };
    if(err){
      resp.error = true;
      resp.errMsg = err;
    }else{
      resp.records = res;
    } 
    socket.emit('ApexTrigger', resp);
  });
};

function queryCodeCoverage(socket, oauth){
  var api = ToolingAPI.create({oauth: oauth});
  api.getCoverageForClasses(function(err, res){
    var resp = {
      error: false,
      records: [],
    };
    if(err){
      resp.error = true;
      resp.errMsg = err;
    }else{
      resp.records = res;
    } 
    socket.emit('CoverageAggregateResult', resp);
  });
};

function getApexCodeCoverage(id, socket, oauth){
  var api = ToolingAPI.create({oauth: oauth});
  api.getApexCodeCoverage(id, function(err, res){
    if(err) console.log(err);
    console.log(res);
    socket.emit('ApexCodeCoverage', res);
  });
}

function getApexBody(params, socket, oauth){
  var api = ToolingAPI.create({oauth: oauth});
  api.ApexBody(params, function(err, res){
    if(err) console.log(err);
    socket.emit('ApexBodyResult', res);
  });
}

var server = require('http').createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

sessionSockets.on('connection', function (err, socket, session) {
  var passport = session.passport;
  var user = passport.user;
  var oauth = user._oauthData;

  socket.on('ApexClasses', function(){
    queryApexClasses(socket, oauth);
  });

  socket.on('ApexTriggers', function(){
    queryApexTriggers(socket, oauth);
  });

  socket.on('CodeCoverage', function(data){
    console.log('CodeCoverage');
    getApexCodeCoverage(data.id, socket, oauth);
  });

  socket.on('CoverageAggregate', function(data){
    console.log('CoverageAggregate');
    queryCodeCoverage(socket, oauth);
  });

  socket.on('ApexBody', function(data){
    console.log('ApexBody');
    console.log(data);
    getApexBody(data, socket, oauth);
  });

});
