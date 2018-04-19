var Express = require('express');
var async = require('async');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});

router.baseURL = '/Ssns';

router.post('/', function(req, res) {
   var cookie;
   var cnn = req.cnn;
   var vld = req.validator;
   var email = req.body.email || '';
   var password = req.body.password || '';

   console.log('posting session');
   console.log(req.body);

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Person where email = ?', [email], cb);
   },
   function(result, fields, cb) {
      if (vld.check(result.length && result[0].password === password,
       Tags.badLogin)) {
         console.log('making session');
         cookie = ssnUtil.makeSession(result[0], res);
         res.location(router.baseURL + '/' + cookie).status(200).end();
      }
      cb();
   }],
   function() {
      console.log('releasing connection');
      cnn.release();
   });
});

router.get('/', function(req, res) {
   var body = [], ssn;

   async.waterfall([
   function(cb) {
      if (req.validator.checkAdmin(cb)) {
         for (var cookie in ssnUtil.sessions) {
            ssn = ssnUtil.sessions[cookie];
            body.push({cookie: cookie, prsId: ssn.id,
             loginTime: ssn.loginTime});
         }
         cb();
      }
   }],
   function(err, result) {
      if (!err)
         res.status(200).json(body);
      req.cnn.release();
   });
});

router.get('/:cookie', function(req, res) {
   var cnn = req.cnn;
   var cookie = req.params.cookie;
   var sessions = ssnUtil.sessions;
   var vld = req.validator;
   var prsId, loginTime;

   async.waterfall([
   function(cb) {
      if (vld.check(cookie in sessions, Tags.notFound, null, cb) &&
       vld.checkPrsOK(sessions[cookie].id, cb)) {
         prsId = req.session.id;
         loginTime = sessions[cookie].loginTime;
         cb();
      }
   }],
   function(err, result) {
      if (!err)
         res.json({cookie: cookie, prsId: prsId, loginTime: loginTime});
      cnn.release();
   });
});

router.delete('/:cookie', function(req, res) {
   var admin = req.session && req.session.isAdmin();
   var cookie = req.params.cookie;
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (vld.check(cookie in ssnUtil.sessions, Tags.notFound, null, cb) &&
       vld.check(cookie === req.cookies[ssnUtil.cookieName] || admin,
       Tags.noPermission, null, cb)) {
         ssnUtil.deleteSession(cookie);
         res.status(200).end();
         cb();
      }
   }],
   function(err, result) {
      req.cnn.release();
   });
});

module.exports = router;
