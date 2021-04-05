let express = require('express');
let router = express.Router();
let getConnection = require('../common/db.js')
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

// 아이디어 수정
router.patch('/patchidea', (req, res) => {
  let email = req.session.member_email
  let id = req.body.id
  let a_sql = 'select member_email from idea where idea_id = ' + id
  let patch_sql = 'insert into idea_log(idea_id, idea_edit_date, idea_contents) values(?, ?, (select idea_contents from idea where idea_id = ?));' + 'update idea set idea_contents = ? where idea_id = ?;'
  let patch_params = [id, etc.date(), id, req.body.contents, id]
  getConnection((conn) => {
    conn.query(a_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        console.log(rows)
        if (rows[0].member_email === email) {
          conn.query(patch_sql, patch_params, (err, rows, field) => {
            if (err) {
              console.log(err)
              res.send(false)
            } else {
              console.log(rows)
              res.send(true)
            }
          })
        } else {
          res.send(false)
        }
      }
      conn.release()
    })
  })
})

// 아이디어 게시물 조회
router.get('/listidea', (req, res) => {
  let listIdea_sql = 'select idea_id, idea_title, idea_date from idea where idea_delete = 0'
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

// 아이디어 게시물 검색
router.get('/searchidea', (req, res) => {
  const title = req.query.idea_title
  let listIdea_sql = 'select idea_id, idea_title, idea_date from idea where match(idea_title) against(?);'
  getConnection((conn) => {
    conn.query(listIdea_sql, title, (err, rows, field) => {
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

// 아이디어 게시물 상세조회
router.get('/openidea/:idea_id', (req, res) => {
  const id = req.params.idea_id
  let open_sql = 'select idea_title, idea_contents, idea_date from idea where member_email = ? AND idea_id = ?'
  let open_params = [req.session.member_email, id]
  getConnection((conn) => {
    conn.query(open_sql, open_params, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        if (rows.length === 0) {
          res.send(false)
        } else {
          console.log(rows)
          res.json(rows)
        }
      }
    })
  })
})


module.exports = router;
