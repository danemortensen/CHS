var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
var Session = require('./Routes/Session.js');
var Validator = require('./Routes/Validator.js');
var CnnPool = require('./Routes/CnnPool.js');

var async = require('async');

var app = express();

// Static paths to be served like index.html and all client side js
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
   console.log("Handling " + req.path + '/' + req.method);
   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
   res.header("Access-Control-Allow-Credentials", true);
   res.header("Access-Control-Allow-Headers", "Content-Type, Location");
   res.header("Access-Control-Allow-Methods", "DELETE, PUT");
   res.header("Access-Control-Expose-Headers", "Location");
   next();
});

// No further processing needed for options calls.
app.options("/*", function(req, res) {
   res.status(200).end();
});

// Parse all request bodies using JSON
app.use(bodyParser.json());

// Attach cookies to req as req.cookies.<cookieName>
app.use(cookieParser());

// Set up Session on req if available
app.use(Session.router);

// Check general login.  If OK, add Validator to |req| and continue processing,
// otherwise respond immediately with 401 and noLogin error tag.
app.use(function(req, res, next) {
   console.log(req.path);
   if (req.session || (req.method === 'POST' &&
    (req.path === '/Prss' || req.path === '/Ssns'))) {
      console.log('Attaching validator');
      req.validator = new Validator(req, res);
      next();
   } else
      res.status(401).end();
});

// Add DB connection, with smart chkQry method, to |req|
app.use(CnnPool.router);

// Load all subroutes
app.use('/Prss', require('./Routes/Account/Prss.js'));
app.use('/Ssns', require('./Routes/Account/Ssns.js'));
app.use('/Cnvs', require('./Routes/Conversation/Cnvs.js'));
app.use('/Msgs', require('./Routes/Conversation/Msgs.js'));

// Special debugging route for /DB DELETE.  Clears all table contents,
//resets all auto_increment keys to start at 1, and reinserts one admin user.
app.delete('/DB', function(req, res) {
   var cnn = req.cnn;
   var session = req.session;
   var vld = req.validator;

   // Equivalent expanded code for instructional reference
   async.series([
   function(callback) {
      if (vld.check(session && session.isAdmin(), Validator.Tags.noPermission,
       null, callback)) {
         cnn.query('delete from Person', callback);
      }
   },
   function(callback) {
      cnn.query('delete from Conversation', callback);
   },
   function(callback) {
      cnn.query('delete from Message', callback);
   },
   function(callback) {
      cnn.query('alter table Person auto_increment = 1', callback);
   },
   function(callback) {
      cnn.query('alter table Conversation auto_increment = 1', callback);
   },
   function(callback) {
      cnn.query('alter table Message auto_increment = 1', callback);
   },
   function(callback) {
      cnn.query('INSERT INTO Person (firstName, lastName, email,' +
       ' password, whenRegistered, role) VALUES ' +
       '("Joe", "Admin", "adm@11.com","password", UNIX_TIMESTAMP(NOW()), 1);',
       callback);
   },
   function(callback) {
      for (var session in Session.sessions)
         delete Session.sessions[session];
      res.send();
      callback();
   }],
   function(err, status) {
      req.cnn.release();
   });
});

// Handler of last resort.  Print a stacktrace to console and send a 500 response.
app.use(function(req, res) {
   res.status(404).end();
   req.cnn && req.cnn.release();
});

app.use(function(err, req, res, next) {
   res.status(500).json(err.message);    // err.stack will give the stack trace in Postman
   req.cnn && req.cnn.release();
});

var portNum = 3000;
var args = process.argv;
args.forEach(function(arg, index) {
   if (arg === '-p' && args[index + 1]) {
      portNum = args[index + 1];
   }
});

app.listen(portNum, function() {
   console.log('App Listening on port ' + portNum);
});
