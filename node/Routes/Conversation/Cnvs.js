var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Cnvs';

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var title = body.title;

   body.ownerId = req.session.id;

   async.waterfall([
   function(cb) {
      if (vld.check(title && title.length, Tags.missingField, ['title'], cb) &&
       vld.check(title.length <= 80, Tags.badValue, ['title'], cb)) {
         cnn.chkQry('select * from Conversation where title = ?',
          body.title, cb);   
      }
   },
   function(existingCnv, fields, cb) {
      if (vld.check(!existingCnv.length, Tags.dupTitle, null, cb))
         cnn.chkQry("insert into Conversation set ?", [body], cb);
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function(err, result) {
      cnn.release();
   });
});

router.post('/:cnvId/Msgs', function(req, res){
   var content = req.body.content;
   var cnn = req.cnn;
   var cnvId = req.params.cnvId;
   var now;
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (vld.chain(req.session, Tags.noPermission)
       .check(content, Tags.missingField, ['content'], cb) &&
       vld.check(content.length <= 5000, Tags.badValue, ['content'], cb)) {
         cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
      }
   },
   function(cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb))
         cnn.chkQry('insert into Message set ?',
          {cnvId: cnvId, prsId: req.session.id,
          whenMade: now = new Date().getTime(), content: req.body.content}, cb);
   },
   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId);
      cnn.chkQry("update Conversation set lastMessage = ? where id = ?",
       [now, cnvId], cb);
   }],
   function(err) {
      if (!err) {
         res.status(200).end();
      }
      cnn.release();
   });
});

router.get('/', function(req, res) {
   var cnn = req.cnn;
   var owner = req.query.owner;
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (owner) {
         cnn.chkQry('select * from Conversation where ownerId = ?',
          [owner], cb);
      }
      else {
         cnn.chkQry('select * from Conversation', null, cb);
      }
   }],
   function(err, result) {
      res.json(result);
      cnn.release();
   });
});

router.get('/:cnvId', function(req, res) {
   var cnn = req.cnn;
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (vld.check(req.session, Tags.noPermission, null, cb)) {
         cnn.chkQry('select * from Conversation where id = ?',
          [req.params.cnvId], cb);
      }
   },
   function(cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb)) {
         res.json(cnvs[0]);
         cb();
      }
   }],
   function(err, result) {
      cnn.release();
   })
});

router.get('/:cnvId/Msgs', function(req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;
   var query = 'select m.id, whenMade, email, content from Conversation c' +
    ' join Message m on cnvId = c.id join Person p on prsId = p.id' +
    ' where c.id = ?'
   var params = [cnvId];

   if (req.query.dateTime) {
      query += ' and whenMade <= ?';
      params.push(req.query.dateTime);
   }

   query += ' order by whenMade asc';

   // And finally add a limit clause and parameter if indicated.
   if (req.query.num) {
      query += ' limit ' + req.query.num;
   }

   async.waterfall([
   function(cb) {  // Check for existence of conversation
      cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function(cnvs, fields, cb) { // Get indicated messages
      if (vld.check(cnvs.length, Tags.notFound, null, cb))
         cnn.chkQry(query, params, cb);
   },
   function(msgs, fields, cb) { // Return retrieved messages
      res.json(msgs);
      cb();
   }],
   function(err){
      cnn.release();
   });
});

router.put('/:cnvId', function(req, res) {
   var body = req.body;
   var cnn = req.cnn;
   var cnvId = req.params.cnvId;
   var title = req.body.title;
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (vld.check(body.hasOwnProperty('title'), Tags.missingField, ['title'],
       cb) &&
       vld.check(title.length && title.length <= 80, Tags.badValue, ['title'],
       cb)) {
         cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
      }
   },
   function(cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(cnvs[0].ownerId, cb))
         cnn.chkQry('select * from Conversation where id <> ? && title = ?',
          [cnvId, body.title], cb);
   },
   function(sameTtl, fields, cb) {
      if (vld.check(!sameTtl.length, Tags.dupTitle, null, cb)) {
         cnn.chkQry("update Conversation set title = ? where id = ?",
          [body.title, cnvId], cb);
      }
   }],
   function(err) {
      if (!err)
         res.status(200).end();
      req.cnn.release();
   });
});

router.delete('/:cnvId', function(req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
   },
   function(cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(cnvs[0].ownerId, cb))
         cnn.chkQry('delete from Conversation where id = ?', [cnvId], cb);
   }],
   function(err, result) {
      cnn.release();
      if (!err) {
         res.status(200).end();
      }
   });
});

module.exports = router;
