let express = require('express');
let router = express.Router();
let getConnection = require('../common/db.js')
let etc = require('../common/etc.js');

// 관리자 등록 
router.post('/signup', (req, res) => {
  const pw = req.body.admin_pw
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
  const pw = req.body.admin_password
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

// 회원정보, 로그검색
// 회원 상세정보 보기
router.get('/findmember', (req, res) => {
  let findMem_sql = 'select * from member inner join member_log ml on member.member_email = ml.member_email where ml.member_email = ?'
  getConnection((conn) => {
    conn.query(findMem_sql, req.query.email, (err, rows, field) => {
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

// 회원 로그 조회
router.get('/logmember', (req, res) => {
  let logfindMem_sql = 'select member_login from member_login_log where member_email = ?'
  getConnection((conn) => {
    conn.query(logfindMem_sql, req.query.email, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        console.log(rows)
        res.json(rows)
      }
    })
  })
})

// 회원정지
router.patch('/deletemember', (req, res) => {
  const email = req.session.admin_email
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
  const point = req.body.point
  const id = req.body.id
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

// 아이디어 게시물 삭제(수정중)
router.patch('/deleteidea', (req, res) => {
  const email = req.session.admin_email
  const id = req.body.id
  let deleteIdea_sql = 'update idea '
})

module.exports = router;
