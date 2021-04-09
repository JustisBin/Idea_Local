let express = require('express');
let router = express.Router();
let getConnection = require('../common/db.js')
let etc = require('../common/etc.js')
let upload = require('../common/file.js')

/**아이디어 게시판 */
// 아이디어 등록
router.post('/idea/newidea', (req, res) => {
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
router.patch('/idea/patchidea', (req, res) => {
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
router.get('/idea/listidea', async (req, res) => {
  let start_page = req.query.page
  let page_size = req.query.pageSize
  let last_page = Math.ceil(await etc.ideaCnt() / page_size)
  console.log(last_page)
  if (start_page <= 0) {
    start_page = 1
  } else if (start_page > last_page) {
    start_page = (last_page - 1) * page_size
  } else {
    start_page = (start_page - 1) * page_size;
  }
  let listIdea_sql = 'select idea_id, idea_title, idea_date from idea where idea_delete = 0 LIMIT ' + start_page + ', ' + page_size
  getConnection((conn) => {
    conn.query(listIdea_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.json(rows)
      }
    })
    conn.release()
  })
})

// 아이디어 게시물 검색
router.get('/idea/searchidea', (req, res) => {
  let title = req.query.idea_title
  let listIdea_sql = 'select idea_id, idea_title, idea_date from idea where match(idea_title) against("' + title + '*" IN BOOLEAN MODE) AND idea_delete = 0;'
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

// 아이디어 게시물 상세조회
router.get('/idea/openidea/:idea_id', (req, res) => {
  let id = req.params.idea_id
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
    conn.release()
  })
})

// 아이디어 파일 업로드(수정중)
router.post('/idea/upload', upload.single('fileupload'), (req, res) => {
  console.log(req.file)
  console.log(req.file.path)
  console.log(upload)
  console.log(upload.storage.getFilename)
  res.send(true)
  // getConnection((conn) => {
  //   let upload_sql = 'insert into '
  // })
})

/**공고 게시판 */
// 공고사항 조회
router.get('/anno/listanno', async (req, res) => {
  let start_page = req.query.page
  let page_size = req.query.pageSize
  let last_page = Math.ceil(await etc.annoCnt() / page_size)
  if (start_page <= 0) {
    start_page = 1
  } else if (start_page > last_page) {
    start_page = (last_page - 1) * page_size
  } else {
    start_page = (start_page - 1) * page_size;
  }
  let listAnno_sql = 'select anno_id, anno_title, anno_date from anno LIMIT ' + start_page + ', ' + page_size
  getConnection((conn) => {
    conn.query(listAnno_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.json(rows)
      }
    })
    conn.release()
  })
})

// 공고사항 게시물 검색
router.get('/anno/searchanno', (req, res) => {
  let title = req.query.title
  let listAnno_sql = 'select anno_id, anno_title, anno_date from anno where match(anno_title) against("' + title + '*" IN BOOLEAN MODE);'
  getConnection((conn) => {
    conn.query(listAnno_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.json(rows)
      }
    })
    conn.release()
  })
})

// 공고사항 게시물 상세조회
router.get('/anno/openanno/:anno_id', (req, res) => {
  let id = req.params.anno_id
  let open_sql = 'select anno_contents from anno where anno_id = ?'
  getConnection((conn) => {
    conn.query(open_sql, id, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        if (rows.length === 0) {
          res.send(false)
        } else {
          res.json(rows)
        }
      }
    })
    conn.release()
  })
})

/**공지사항 게시판 */
// 공지사항 게시물 등록

// 공지사항 게시물 조회

// 공지사항 게시물 검색

// 공지사항 게시물 상세조회

/**문의 게시판 */
// 문의게시글 등록

// 문의게시물 수정

// 문의게시물 검색

// 문의게시물 상세조회

/**고객센터 */
// 고객센터 이메일 작성

module.exports = router;
