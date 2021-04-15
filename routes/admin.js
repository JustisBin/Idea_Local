let express = require('express');
let router = express.Router();
let getConnection = require('../common/db.js')
let etc = require('../common/etc.js');
let mailer = require('../common/mailer');

// 관리자 등록 
router.post('/signup', (req, res) => {
  let pw = req.body.admin_pw
  let sql = 'insert into admin (admin_email, admin_name, admin_sex, admin_birth, admin_state, admin_pw, admin_phone) values (?, ?, ?, ?, ?, ?, ?);' + 'insert into admin_log (admin_email, admin_log_join) values (?, ?);'
  let params = [req.body.admin_email, req.body.admin_name, req.body.admin_sex, req.body.admin_birth, req.body.admin_state, etc.pwCrypto(pw), req.body.admin_phone, req.body.admin_email, etc.date()]
  getConnection((conn) => {
    conn.query(sql, params, (err, rows, fields) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        console.log('rows : ', rows)
        res.send(true)
      }
    })
    conn.release()
  })
})

// 관리자 로그인
router.post('/signin', (req, res) => {
  let pw = req.body.admin_password
  let sql = 'SELECT admin_email, admin_pw FROM admin WHERE admin_email = ? AND admin_secede = ?;'
  let sql_params = [req.body.admin_email, 0]
  getConnection((conn) => {
    conn.query(sql, sql_params, (err, rows, fields) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        if (rows.length === 0) {
          console.log('Not found')
          res.send(false)
        } else {
          if (rows[0].admin_email === req.body.admin_email && rows[0].admin_pw === etc.pwCrypto(pw)) {
            req.session.admin_email = req.body.admin_email
            req.session.admin_pw = etc.pwCrypto(pw)
            let log_sql = 'update admin_log set admin_login_lately = ? where admin_email = ?;'
            let log_params = [etc.date(), req.body.admin_email]
            conn.query(log_sql, log_params, (err, rows, fields) => {
              if (err) {
                console.log(err)
                res.send('error')
              } else {
                req.session.save(() => {
                  res.redirect('/');
                });
                console.log('Success')
              }
            })
          } else {
            res.send(false)
          }
        }
      }
    })
    conn.release()
  })
})

// 관리자 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    console.log(err)
  })
  res.redirect('/')
})

// 관리자 탈퇴
router.patch('/deleteadmin', (req, res) => {
  let email = req.session.email
  let deleteAdmin_sql = 'update admin set admin_secede = 1 where admin_email = ?'
  getConnection((conn) => {
    conn.query(deleteAdmin_sql, email, (err, rows, fields) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        req.session.destroy((err) => {
          console.log(err)
        })
        res.redirect('/')
      }
    })
    conn.release()
  })
})

// 관리자 목록조회
router.get('/adminlist', (req, res) => {
  let getAdmin_sql = 'select admin_email, admin_name from admin'
  getConnection((conn) => {
    conn.query(getAdmin_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.json(rows)
      }
    })
  })
})

// 관리자 검색
router.get('/searchadmin', (req, res) => {
  let email = req.query.email
  let searchAdmin_sql = 'select admin_email, admin_name from admin where match(admin_email) against("' + email + '" IN BOOLEAN MODE);'
  getConnection((conn) => {
    conn.query(searchAdmin_sql, (err, rows, field) => {
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

// 관리자 상세정보 조회
router.get('/findadmin', (req, res) => {
  let findAdmin_sql = 'select * from admin inner join admin_log ml on admin.admin_email = ml.admin_email where ml.admin_email = ?'
  getConnection((conn) => {
    conn.query(findAdmin_sql, req.query.email, (err, rows, field) => {
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

// 관리자 로그 조회
router.get('/logadmin', (req, res) => {
  let logfindMem_sql = 'select * from admin_log where admin_email = ?'
  getConnection((conn) => {
    conn.query(logfindMem_sql, req.query.email, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.json(rows)
      }
    })
  })
})

// 회원 목록조회
router.get('/memberlist', (req, res) => {
  let getMem_sql = 'select member_email, member_name from member'
  getConnection((conn) => {
    conn.query(getMem_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.json(rows)
      }
    })
  })
})

// 회원 검색
router.get('/searchmember', (req, res) => {
  let email = req.query.email
  let searchMem_sql = 'select member_email, member_name from member where match(member_email) against("' + email + '" IN BOOLEAN MODE);'
  getConnection((conn) => {
    conn.query(searchMem_sql, (err, rows, field) => {
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

// 회원 상세정보 보기
router.get('/findmember', (req, res) => {
  let findMem_sql = 'select * from member inner join member_log ml on member.member_email = ml.member_email where ml.member_email = ?'
  getConnection((conn) => {
    conn.query(findMem_sql, req.query.email, (err, rows, field) => {
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

// 회원 로그 조회
router.get('/logmember', (req, res) => {
  let logfindMem_sql = 'select * from member_login_log where member_email = ?'
  getConnection((conn) => {
    conn.query(logfindMem_sql, req.query.email, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.json(rows)
      }
    })
  })
})

// 회원정지
router.patch('/deletemember', (req, res) => {
  let email = req.session.admin_email
  let deleteMem_sql = 'update member set member_ban = 1 where member_email = ?;' + 'insert into member_ban (member_email, member_ban_reason, member_ban_date, admin_email) values (?, ?, ?, ?) '
  let deleteMem_params = [req.body.email, req.body.email, req.body.reason, etc.date(), email]
  getConnection((conn) => {
    conn.query(deleteMem_sql, deleteMem_params, (err, rows, field) => {
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

// 회원정지해제
router.patch('/recmember', (req, res) => {
  const email = req.session.admin_email
  let recMem_sql = 'update member set member_ban = 0 where member_email = ?' + + 'insert into member_ban (member_email, member_ban_reason, member_ban_date, admin_email) values (?, ?, ?, ?) '
  let deleteMem_params = [req.body.email, req.body.email, req.body.reason, etc.date(), email]
  getConnection((conn) => {
    conn.query(recMem_sql, deleteMem_params, (err, rows, field) => {
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

// 아이디어 포인트 부여, 회수
router.patch('/givepoint', (req, res) => {
  let point = req.body.point
  let id = req.body.id
  let findIdea_sql = 'select idea.idea_id, idea.add_point, mem.member_email, mem.member_point, mem.save_point from member mem INNER JOIN idea ON mem.member_email = idea.member_email AND idea_id = ?'
  getConnection((conn) => {
    conn.query(findIdea_sql, id, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        addPoint = rows[0].add_point + point
        memPoint = rows[0].member_point + point
        savePoint = rows[0].save_point + point
        let plusPoint_sql = 'update idea set admin_email = ?, add_point = ?, date_point = ? where idea_id = ?;' + 'update member set member_point = ?, save_point = ? where member_email = ?'
        let plusPoint_params = [req.session.admin_email, addPoint, etc.date(), id, memPoint, savePoint, rows[0].member_email]
        conn.query(plusPoint_sql, plusPoint_params, (err, rows, field) => {
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

// 아이디어게시물 삭제
router.patch('/deleteidea/:idea_id', (req, res) => {
  let id = req.params.idea_id
  let delete_sql = 'update idea set idea_delete = 1 where idea_id = ' + id
  getConnection((conn) => {
    conn.query(delete_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.send(true)
      }
    })
    conn.release()
  })
})

// 아이디어 로그 조회
router.get('/idea/log/:idea_id', (req, res) => {
  let id = req.params.idea_id
  let openlog_sql = 'select idea_id, idea_edit_date from idea_log where idea_id = ?'
  getConnection((conn) => {
    conn.query(openlog_sql, id, (err, rows, field) => {
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

// 공지사항 게시물 삭제
router.patch('/deletenotice/:notice_id', (req, res) => {
  let id = req.params.notice_id
  let delete_sql = 'update notice set notice_delete = 1 where notice_id = ' + id
  getConnection((conn) => {
    conn.query(delete_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.send(true)
      }
    })
    conn.release()
  })
})

// 공지사항 게시물 로그 조회
router.get('/notice/log/:notice_id', (req, res) => {
  let id = req.params.notice_id
  let openlog_sql = 'select notice_id, notice_edit_date from notice_log where notice_id = ?'
  getConnection((conn) => {
    conn.query(openlog_sql, id, (err, rows, field) => {
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

// 문의게시물 답변 작성
router.patch('/cs/commentcs', (req, res) => {
  let comment_sql = 'update cs set admin_email = ?, cs_resp = ?, cs_resp_date = ? where cs_id = ?'
  let comment_params = [req.session.admin_email, req.body.comment, etc.date(), req.body.id]
  getConnection((conn) => {
    conn.query(comment_sql, comment_params, (err, rows, feild) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.send(true)
      }
    })
    conn.release()
  })
})

// 문의게시물 삭제
router.patch('/deletecs/:cs_id', (req, res) => {
  let id = req.params.cs_id
  let delete_sql = 'update cs set cs_delete = 1 where cs_id = ' + id
  getConnection((conn) => {
    conn.query(delete_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.send(true)
      }
    })
    conn.release()
  })
})

// 문의게시물 로그 조회
router.get('/cs/log/:cs_id', (req, res) => {
  let id = req.params.cs_id
  let openlog_sql = 'select cs_id, cs_edit_date from cs_log where cs_id = ?'
  getConnection((conn) => {
    conn.query(openlog_sql, id, (err, rows, field) => {
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

// 고객센터 문의글 조회
router.get('/contact/listcontact', async (req, res) => {
  let start_page = req.query.page
  let page_size = req.query.pageSize
  let last_page = Math.ceil(await etc.contCnt() / page_size)
  if (start_page <= 0) {
    start_page = 1
  } else if (start_page > last_page) {
    start_page = (last_page - 1) * page_size
    if (start_page <= 0) {
      start_page = 1
    }
  } else {
    start_page = (start_page - 1) * page_size;
  }
  let listCont_sql = 'select contact_id, contact_title, email from contact LIMIT ' + start_page + ', ' + page_size
  getConnection((conn) => {
    conn.query(listCont_sql, (err, rows, field) => {
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

//고객센터 문의글 상세조회
router.get('/contact/opencontact/:contact_id', (req, res) => {
  let id = req.params.contact_id
  let open_sql = 'select c.contact_title, c.contact_contents, cl.contact_send from contact as c inner join contact_log as cl on c.contact_id = cl.contact_id and c.contact_id = ?'
  getConnection((conn) => {
    conn.query(open_sql, id, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        if (etc.isEmpty(rows)) {
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

// 고객센터 답변
router.patch('/contact/request', async (req, res) => {
  let emailParam = {
    toEmail: req.body.email,
    subject: "[아이디어플랫폼]문의주신 내용에 대한 답변입니다.",
    html: "<p>아이디어 플랫폼 운영자 정의빈입니다.</p> <br>" + req.body.contents
  }

  await mailer.sendMail(emailParam)

  let req_sql = 'update contact_log set contact_response = ? where contact_id = ?'
  let req_params = [etc.date(), req.body.id]
  getConnection((conn) => {
    conn.query(req_sql, req_params, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        res.send(true)
      }
    })
    conn.release()
  })
})

// 고객센터 로그 조회
router.get('/contact/log/:contact_id', (req, res) => {
  let id = req.params.contact_id
  let openlog_sql = 'select contact_id, contact_send, contact_response from contact_log where contact_id = ?'
  getConnection((conn) => {
    conn.query(openlog_sql, id, (err, rows, field) => {
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


module.exports = router;
