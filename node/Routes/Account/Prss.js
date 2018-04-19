var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Prss';

router.post('/', function(req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

   if (admin && !body.hasOwnProperty('password'))
      body.password = "*";                       // Blocking password
   body.whenRegistered = new Date().getTime();

   async.waterfall([
   function(cb) { // Check properties and search for Email duplicates
      if (vld.hasFields(body, ["email", "lastName", "password", "role"], cb) &&
       vld.truthyFields(body, ["email", "lastName", "password"], cb)
       && vld.chain(!body.role || admin, Tags.noPermission)
       .chain(body.termsAccepted || admin, Tags.noTerms)
       .check(body.role === 0 || body.role === 1, Tags.badValue, ["role"],
       cb)) {
         cnn.chkQry('select * from Person where email = ?', body.email, cb);
      }
   },
   function(existingPrss, fields, cb) {  // If no duplicates, insert new Person
      if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
         body.termsAccepted =
          (body.termsAccepted && body.whenRegistered) || null;
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },
   function(result, fields, cb) { // Return location of inserted Person
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});

/* Much nicer versions */
router.get('/', function(req, res) {
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;
   var email = req.query.email;

   async.waterfall([
   function(cb) {
      if (admin) {
         if (email) {
            cnn.chkQry('select id, email from Person where email like ?',
             [email + '%'], cb);
         }
         else {
            cnn.chkQry('select id, email from Person', null, cb);
         }
      }
      else {
         if (email) {
            cnn.chkQry('select id, email from Person where email like ? ' +
             'and email = ?', [email + '%', req.session.email], cb);
         }
         else {
            cnn.chkQry('select id, email from Person where email = ?',
             [req.session.email], cb);
         }
      }
   },
   function(result, fields, cb) {
      res.json(result);
      cb();
   }],
   function(err, result) {
      cnn.release();
   });
});

router.get('/:id', function(req, res) {
   var cnn = req.cnn;
   var id = req.params.id;
   var qry = 'select id, firstName, lastName, email, whenRegistered, ' +
    'termsAccepted, role from Person where id = ?';
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(id, cb))
         cnn.chkQry(qry, [id], cb);
   },
   function(result, fields, cb) {
      if (vld.check(result.length, Tags.notFound, null, cb)) {
         res.json(result);
         cb();
      }
   }],
   function(err, result) {
      cnn.release();
   });
});

router.put('/:id', function(req, res) {
   var admin = req.session.isAdmin();
   var body = req.body;
   var cnn = req.cnn;
   var id = req.params.id;
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(id, cb) && 
       vld.validFields(body, cb) &&
       vld.check(!('password' in body) || body.password, Tags.badValue,
       ['password'], cb) &&
       vld.check(!('password' in body) || 'oldPassword' in body || admin,
       Tags.noOldPwd, null, cb) &&
       vld.check(!body.role || (admin && body.role === 1), Tags.badValue,
       ['role'], cb)) {
         cnn.chkQry('select * from Person where id = ?', [id], cb);
      }
   },
   function(existing, fields, cb) {
      if (vld.chain(existing.length, Tags.notFound, null)
       .check(admin || !('password' in body)
       || body.oldPassword === existing[0].password, Tags.oldPwdMismatch, null,
       cb)) {
         delete body.oldPassword;
         if (Object.keys(body).length)
            cnn.chkQry('update Person set ? where id = ?', [body, id], cb);
         else
            cb();
      }
   }],
   function(err) {
      if (!err) {
         res.status(200).end();
      }
      cnn.release();
   })
});

router.delete('/:id', function(req, res) {
   var vld = req.validator;
   cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.checkAdmin(cb)) {
         cnn.chkQry('delete from Person where id = ?', [req.params.id], cb);
      }
   },
   function(result, fields, cb) {
      if (vld.check(result.affectedRows, Tags.notFound, null, cb)) {
         res.status(200).end();
         cb();
      }
      else {
         res.status(400).end();
      }
   }],
   function(err, result) {
      cnn.release();
   });
});

module.exports = router;
