var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Msgs';

router.get('/:msgId', function(req, res) {
   var cnn = req.cnn;
   var msgId = req.params.msgId;
   var query = 'select m.whenMade, p.email, m.content from Message m' +
    ' join Person p on prsId = p.id where m.id = ?';
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Message where id = ?', [msgId], cb);
   },
   function(result, fields, cb) {
      if (vld.check(result.length, Tags.notFound, null, cb)) {
         cnn.chkQry(query, [req.params.msgId], cb);
      }
   },
   function(result, fields, cb) {
      res.json(result[0]);
      cb();
   }],
   function(err, result) {
      cnn.release();
   });
});

module.exports = router;
