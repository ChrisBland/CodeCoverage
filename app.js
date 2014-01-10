
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

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new ForceDotComStrategy({
    clientID: '3MVG9A2kN3Bn17hv7Rdm203zJQUgJFHyTNHDnbB7VDDvXjMSsSYyLnjE_7Awy9ZBiyuFILqN_03wiM2HQeTga',
    clientSecret: '2317811878079398283',
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

app.get('/', routes.index);
app.get('/apex', ensureAuthenticated, routes.apex);
app.get('/triggers', ensureAuthenticated, routes.trigger);
app.get('/ApexCodeCoverageAggregate/apex/:id', ensureAuthenticated, routes.ApexCodeCoverageAggregate);
app.get('/ApexCodeCoverageAggregate/trigger/:id', ensureAuthenticated, routes.ApexCodeCoverageAggregateTrigger);
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
}


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
