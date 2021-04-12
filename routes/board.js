let express = require('express');
let router = express.Router();
let getConnection = require('../common/db.js')
let etc = require('../common/etc.js')
let upload = require('../common/file.js')

/**아이디어 게시판 */
// 아이디어 등록
router.post('/idea/newidea', upload.array('fileupload'), (req, res) => {
  let email = req.session.member_email
  if (etc.isEmpty(email)) {
    res.json({
      result: false,
      reason: 'not login'
    })
  } else {
    getConnection((conn) => {
      let newIdea_sql = 'insert into idea (idea_title, idea_contents, idea_date, member_email) values (?, ?, ?, ?);'
      let newIdea_params = [req.body.title, req.body.contents, etc.date(), email]
      conn.query(newIdea_sql, newIdea_params, (err, rows, field) => {
        if (err) {
          console.log(err)
          res.send(false)
        } else {
          console.log(rows)
          if (req.files.length === 0) {
            res.send(true)
          } else {
            let select_sql = 'select idea_id from idea where member_email = ' + conn.escape(email) + 'order by idea_id desc'
            conn.query(select_sql, (err, rows, feild) => {
              if (err) {
                console.log(err)
                res.send(false)
              } else {
                let id = rows[0].idea_id
                let length = req.files.length
                let valText = ""
                if (length > 1) {
                  for (let i = 0; i < length - 1; i++) {
                    valText = valText + '(' + id + ',' + conn.escape(req.files[i].filename) + ',' + conn.escape(req.files[i].path) + '),'
                  }
                  valText = valText + '(' + id + ',' + conn.escape(req.files[length - 1].filename) + ',' + conn.escape(req.files[length - 1].path) + ');'
                  let fileInsert_sql = 'insert into idea_file_dir (idea_id, idea_file_name, idea_file_path) values ' + valText
                  conn.query(fileInsert_sql, (err, rows, field) => {
                    if (err) {
                      console.log(err)
                      res.send(false)
                    } else {
                      console.log(rows)
                      res.send(true)
                    }
                  })
                } else {
                  let fileInsert_sql = 'insert into idea_file_dir (idea_id, idea_file_name, idea_file_path) values (?, ?, ?)'
                  let fileInsert_params = [id, req.files[length - 1].filename, req.files[length - 1].path]
                  conn.query(fileInsert_sql, fileInsert_params, (err, rows, field) => {
                    if (err) {
                      console.log(err)
                      res.send(false)
                    } else {
                      console.log(rows)
                      res.send(true)
                    }
                  })
                }
              }
            })
          }
        }
      })
      conn.release()
    })
  }
})

// 아이디어 수정
router.patch('/idea/patchidea', (req, res) => {
  let email = req.session.member_email
  let id = req.body.id
  let a_sql = 'select member_email from idea where idea_id = ' + id
  let patch_sql = 'insert into idea_log(idea_id, idea_edit_date) values(?, ?);' + 'update idea set idea_contents = ? where idea_id = ?'
  let patch_params = [id, etc.date(), req.body.contents, id]
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
  let title = req.query.title
  let listIdea_sql = 'select idea_id, idea_title, idea_date from idea where match(idea_title) against("' + title + '" IN BOOLEAN MODE) AND idea_delete = 0;'
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
  let id = req.params.cs_id
  let open_sql = 'select idea_title, idea_contents, idea_date, member_email from idea where idea_id = ?'
  getConnection((conn) => {
    conn.query(open_sql, id, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        if (rows.length === 0) {
          res.send(false)
        } else {
          if (rows[0].member_email === req.session.member_email || etc.isEmpty(req.session.admin_email) === false) {
            console.log(rows)
            res.json(rows)
          } else {
            res.json({
              result: false,
              reason: 'not open'
            })
          }

        }
      }
    })
    conn.release()
  })
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
  let listAnno_sql = 'select anno_id, anno_title, anno_date from anno where match(anno_title) against("' + title + '" IN BOOLEAN MODE);'
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
router.post('/notice/newnotice', upload.array('fileupload'), (req, res) => {
  let email = req.session.admin_email
  if (etc.isEmpty(email)) {
    res.json({
      result: false,
      reason: 'not login'
    })
  } else {
    getConnection((conn) => {
      let newNotice_sql = 'insert into notice (notice_title, notice_contents, notice_date, admin_email) values (?, ?, ?, ?)'
      let newNotice_params = [req.body.title, req.body.contents, etc.date(), email]
      conn.query(newNotice_sql, newNotice_params, (err, rows, field) => {
        if (err) {
          console.log(err)
          res.send(false)
        } else {
          console.log(rows)
          if (req.files.length === 0) {
            res.send(true)
          } else {
            let select_sql = 'select notice_id from notice where admin_email = ' + conn.escape(email) + 'order by notice_id desc'
            conn.query(select_sql, (err, rows, feild) => {
              if (err) {
                console.log(err)
                res.send(false)
              } else {
                let id = rows[0].notice_id
                let length = req.files.length
                let valText = ""
                if (length > 1) {
                  for (let i = 0; i < length - 1; i++) {
                    valText = valText + '(' + id + ',' + conn.escape(req.files[i].filename) + ',' + conn.escape(req.files[i].path) + '),'
                  }
                  valText = valText + '(' + id + ',' + conn.escape(req.files[length - 1].filename) + ',' + conn.escape(req.files[length - 1].path) + ');'
                  let fileInsert_sql = 'insert into notice_file_dir (notice_id, notice_file_name, notice_file_path) values ' + valText
                  conn.query(fileInsert_sql, (err, rows, field) => {
                    if (err) {
                      console.log(err)
                      res.send(false)
                    } else {
                      console.log(rows)
                      res.send(true)
                    }
                  })
                } else {
                  let fileInsert_sql = 'insert into notice_file_dir (notice_id, notice_file_name, notice_file_path) values (?, ?, ?)'
                  let fileInsert_params = [id, req.files[length - 1].filename, req.files[length - 1].path]
                  conn.query(fileInsert_sql, fileInsert_params, (err, rows, field) => {
                    if (err) {
                      console.log(err)
                      res.send(false)
                    } else {
                      console.log(rows)
                      res.send(true)
                    }
                  })
                }
              }
            })
          }
        }
      })
      conn.release()
    })
  }
})

// 공지사항 수정
router.patch('/notice/patchnotice', (req, res) => {
  let email = req.session.admin_email
  let id = req.body.id
  let a_sql = 'select admin_email from notice where notice_id = ' + id
  let patch_sql = 'insert into notice_log(notice_id, notice_edit_date) values(?, ?);' + 'update notice set notice_contents = ? where notice_id = ?'
  let patch_params = [id, etc.date(), req.body.contents, id]
  getConnection((conn) => {
    conn.query(a_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        console.log(rows)
        if (rows[0].admin_email === email) {
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

// 공지사항 게시물 조회
router.get('/notice/listnotice', async (req, res) => {
  let start_page = req.query.page
  let page_size = req.query.pageSize
  let last_page = Math.ceil(await etc.noticeCnt() / page_size)
  if (start_page <= 0) {
    start_page = 1
  } else if (start_page > last_page) {
    start_page = (last_page - 1) * page_size
  } else {
    start_page = (start_page - 1) * page_size;
  }
  let listNotice_sql = 'select notice_id, notice_title, notice_date from notice where notice_delete = 0 LIMIT ' + start_page + ', ' + page_size
  getConnection((conn) => {
    conn.query(listNotice_sql, (err, rows, field) => {
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

// 공지사항 게시물 검색
router.get('/notice/searchnotice', (req, res) => {
  let title = req.query.title
  let listnotice_sql = 'select notice_id, notice_title, notice_date from notice where match(notice_title) against("' + title + '" IN BOOLEAN MODE) AND notice_delete = 0;'
  getConnection((conn) => {
    conn.query(listnotice_sql, (err, rows, field) => {
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

// 공지사항 게시물 상세조회
router.get('/notice/opennotice/:notice_id', (req, res) => {
  let id = req.params.notice_id
  let open_sql = 'select notice_title, notice_contents, notice_date from notice where notice_id = ?'
  getConnection((conn) => {
    conn.query(open_sql, id, (err, rows, field) => {
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


/**문의 게시판 */
// 문의게시글 등록
router.post('/cs/newcs', upload.array('fileupload'), async (req, res) => {
  let email = req.session.member_email
  let num = await etc.csCnt() + 1
  if (etc.isEmpty(email)) {
    res.json({
      result: false,
      reason: 'not login'
    })
  } else {
    getConnection((conn) => {
      let newCs_sql = 'insert into cs (cs_id, cs_title, cs_contents, cs_date, member_email, cs_secret) values (?, ?, ?, ?, ?, ?);'
      let newCs_params = [num, req.body.title, req.body.contents, etc.date(), email, req.body.secret]
      conn.query(newCs_sql, newCs_params, (err, rows, field) => {
        if (err) {
          console.log(err)
          res.send(false)
        } else {
          console.log(rows)
          if (req.files.length === 0) {
            res.send(true)
          } else {
            let select_sql = 'select cs_id from cs where member_email = ' + conn.escape(email) + 'order by cs_id desc'
            conn.query(select_sql, (err, rows, feild) => {
              if (err) {
                console.log(err)
                res.send(false)
              } else {
                let id = rows[0].cs_id
                let length = req.files.length
                let valText = ""
                if (length > 1) {
                  for (let i = 0; i < length - 1; i++) {
                    valText = valText + '(' + id + ',' + conn.escape(req.files[i].filename) + ',' + conn.escape(req.files[i].path) + '),'
                  }
                  valText = valText + '(' + id + ',' + conn.escape(req.files[length - 1].filename) + ',' + conn.escape(req.files[length - 1].path) + ');'
                  let fileInsert_sql = 'insert into cs_file_dir (cs_id, cs_file_name, cs_file_path) values ' + valText
                  conn.query(fileInsert_sql, (err, rows, field) => {
                    if (err) {
                      console.log(err)
                      res.send(false)
                    } else {
                      console.log(rows)
                      res.send(true)
                    }
                  })
                } else {
                  let fileInsert_sql = 'insert into cs_file_dir (cs_id, cs_file_name, cs_file_path) values (?, ?, ?)'
                  let fileInsert_params = [id, req.files[length - 1].filename, req.files[length - 1].path]
                  conn.query(fileInsert_sql, fileInsert_params, (err, rows, field) => {
                    if (err) {
                      console.log(err)
                      res.send(false)
                    } else {
                      console.log(rows)
                      res.send(true)
                    }
                  })
                }
              }
            })
          }
        }
      })
      conn.release()
    })
  }
})

// 문의게시물 수정
router.patch('/cs/patchcs', (req, res) => {
  let email = req.session.member_email
  let id = req.body.id
  let a_sql = 'select member_email from cs where cs_id = ' + id
  let patch_sql = 'insert into cs_log(cs_id, cs_edit_date) values(?, ?);' + 'update cs set cs_contents = ? where cs_id = ?'
  let patch_params = [id, etc.date(), req.body.contents, id]
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

// 문의게시물 조회
router.get('/cs/listcs', async (req, res) => {
  let start_page = req.query.page
  let page_size = req.query.pageSize
  let last_page = Math.ceil(await etc.csCnt() / page_size)
  if (start_page <= 0) {
    start_page = 1
  } else if (start_page > last_page) {
    start_page = (last_page - 1) * page_size
  } else {
    start_page = (start_page - 1) * page_size;
  }
  let listCs_sql = 'select cs_id, cs_title, cs_date from cs where cs_delete = 0 LIMIT ' + start_page + ', ' + page_size
  getConnection((conn) => {
    conn.query(listCs_sql, (err, rows, field) => {
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

// 문의게시물 검색
router.get('/cs/searchcs', (req, res) => {
  let title = req.query.title
  let listCs_sql = 'select cs_id, cs_title, cs_date from cs where match(cs_title) against("' + title + '" IN BOOLEAN MODE) AND cs_delete = 0;'
  getConnection((conn) => {
    conn.query(listCs_sql, (err, rows, field) => {
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

// 문의게시물 상세조회
router.get('/cs/opencs/:cs_id', (req, res) => {
  let id = req.params.cs_id
  let open_sql = 'select cs_title, cs_contents, cs_date, cs_secret, member_email from cs where cs_id = ?'
  getConnection((conn) => {
    conn.query(open_sql, id, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        if (rows.length === 0) {
          res.send(false)
        } else {
          if (rows[0].cs_secret === 1) {
            if (rows[0].member_email === req.session.member_email || etc.isEmpty(req.session.admin_email) === false) {
              console.log(rows)
              res.json(rows)
            } else {
              res.json({
                result: false,
                reason: 'not open'
              })
            }
          } else {
            console.log(rows)
            res.json(rows)
          }
        }
      }
    })
    conn.release()
  })
})

/**고객센터 */
// 고객센터 문의
router.post('/contact/write', (req, res) => {
  let email = req.body.email
  let write_sql = 'insert into contact (email, contact_title, contact_contents) values (?, ?, ?)'
  let write_params = [email, req.body.title, req.body.contents]
  getConnection((conn) => {
    conn.query(write_sql, write_params, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        let select_sql = 'select contact_id from contact where email = ' + conn.escape(email) + 'order by contact_id desc'
        conn.query(select_sql, (err, rows, feild) => {
          if (err) {
            console.log(err)
            res.send(false)
          } else {
            let id = rows[0].contact_id
            let log_sql = 'insert into contact_log (contact_id, contact_send) values (?, ?)'
            let log_params = [id, etc.date()]
            conn.query(log_sql, log_params, (err, rows, field) => {
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
      }
    })
  })
})

module.exports = router;
