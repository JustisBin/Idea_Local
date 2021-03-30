let express = require('express');
let router = express.Router();
let getConnection = require('../common/db.js')
let mailer = require('../common/mailer.js');
let etc = require('../common/etc.js')

// 아이디어 등록
router.post('/newidea', (req, res) => {
  let email = req.session.member_email
  let newIdea_sql = 'insert into idea (idea_title, idea_contents, idea_date, member_email) values (?, ?, ?, ?);'
  let newIdea_params = [req.body.title, req.body.contents, etc.date(), email]
  getConnection((conn) => {
    conn.query(newIdea_sql, newIdea_params, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        console.log(rows)
        res.send(true)
      }
    })
    conn.release()
  })
})

// 아이디어 수정(수정중)
router.patch('/patchidea', (req, res) => {
  let email = req.session.member_email
  let id = req.body.id
  let patch_sql = 'select idea_contents from idea where member_email = ? AND idea_id = ?'
  let patch_params = [email, id]
  getConnection((conn) => {
    conn.query(patch_sql, patch_params, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        let oldContents = rows[0].idea_contents
        let update_sql = 'update idea set idea_contents = ? where idea_id = ?;' + 'insert into idea_log(idea_id, idea_edit_date, idea_contents) values (?, ?, ?)'
        let update_params = [req.body.contents, id, id, etc.date(), oldContents]
        conn.query(update_sql, update_params, (err, rows, field) => {
          if (err) {
            console.log(err)
            res.send(false)
          } else {
            console.log(rows)
            res.send(true)
          }
        })
      }
    })
    conn.release()
  })
})

// 아이디어 게시물 조회
router.get('/listidea', (req, res) => {
  let listIdea_sql = 'select idea_title, idea_date from idea where idea_delete = 0'
  getConnection((conn) => {
    conn.query(listIdea_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        console.log(rows)
        res.json(rows)
      }
    })
    conn.release()
  })
})

// 아이디어 게시물 검색 (수정 중)
router.get('/searchidea', (req, res) => {
  const id = req.query.title
  let listIdea_sql = 'select idea_title, idea_date from idea where idea_delete = 0 AND idea_id = ?'
  getConnection((conn) => {
    conn.query(listIdea_sql, id, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        console.log(rows)
        res.json(rows)
      }
    })
    conn.release()
  })
})

// 아이디어 게시물 보기 열기
router.get('/openidea', (req, res) => {
  const id = req.query.id

})


module.exports = router;
