let express = require('express');
let router = express.Router();
let getConnection = require('../common/db.js')
let mailer = require('../common/mailer.js');
let etc = require('../common/etc.js')
let crypto = require('crypto')

router.get('/', (req, res) => {
  let sql = 'select * from contact'
  getConnection((conn) => {
    conn.query(sql, (err, rows, field) => {
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

/* 회원가입 시 이메일 인증 */
router.post('/agreemember', (req, res) => {
  let agree = req.body.chosen_agree
  if (agree === 0) {
    res.session.chosen = 0;
    res.send(true)
  } else {
    req.session.chosen = 1
    res.send(true)
  }
})

/* 이메일 인증 */
router.post('/pass-email', (req, res) => {
  let num = String(etc.ranNum(111111, 999999));
  req.session.token = num

  let emailParam = {
    toEmail: req.body.mail,
    subject: "[아이디어플랫폼]인증메일",
    html: "<p>아래의 인증번호를 입력해주세요.</p>" + num
  }

  mailer.sendMail(emailParam)

  res.send(true)
})

/* 이메일 인증번호 확인 */
router.get('/check-token', (req, res) => {
  if (req.query.token === req.session.token) {
    delete req.session.token
    res.send(true)
  }
  else {
    res.send(false)
  }
})

// 이메일 중복확인
// DB member table 에서 일치하는 이메일 검색 후 중복되는 값이 있을 경우 true,
// 중복이 아닐경우 false 반환
router.get('/check-email', (req, res) => {
  let param_email = req.query.member_email
  let sql = 'SELECT member_email, member_secede, member_ban FROM member WHERE member_email = "' + param_email + '";'
  getConnection((conn) => {
    conn.query(sql, (err, rows, fields) => {
      if (err) {
        console.log(err)
      } else {
        if (rows.length != 0) {
          let is_email = rows[0].member_email
          if (is_email === param_email) {
            console.log(is_email + ' == ' + param_email)
            if (rows[0].member_secede === 1 || rows[0].member_ban === 1) {
              res.send('error1')
            } else {
              res.send('error2')
            }
          } else {
            res.send('error3')
          }
        } else {
          console.log(param_email + 'Not Found')
          res.send(true)
        }
      }
    })
    conn.release()
  })
})

// 회원가입
router.post('/signup', (req, res) => {
  const pw = req.body.member_pw
  let sql = 'insert into member (member_email, member_name, member_sex, member_birth, member_company, member_state, member_pw, member_phone, chosen_agree) values (?, ?, ?, ?, ?, ?, ?, ?, ?);'
  let params = [req.body.member_email, req.body.member_name, req.body.member_sex, req.body.member_birth, req.body.member_company, req.body.member_state, etc.pwCrypto(pw), req.body.member_phone, req.session.chosen]
  getConnection((conn) => {
    conn.query(sql, params, (err, rows, fields) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        delete req.session.chosen
        req.session.save()
        let log_sql = 'insert into member_log (member_email, member_log_join) values (?, ?);'   // 로그인 로그 저장
        let log_params = [req.body.member_email, etc.date()]
        conn.query(log_sql, log_params, (err, rows, fields) => {
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

//회원로그인
router.post('/signin', (req, res) => {
  const pw = req.body.password
  let sql = 'SELECT member_email, member_pw FROM member WHERE member_email = ? AND member_secede = ? AND member_ban = ?;'
  let sql_params = [req.body.email, 0, 0]
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
          if (rows[0].member_email === req.body.email && rows[0].member_pw === etc.pwCrypto(pw)) {
            req.session.member_email = req.body.email
            req.session.member_pw = etc.pwCrypto(pw)
            let log_sql = 'update member_log set member_login_lately = ? where member_email = ?;' + 'insert into member_login_log (member_email, member_login) values (? ,?);'
            let log_params = [etc.date(), req.body.email, req.body.email, etc.date()]
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

//회원 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    console.log(err)
  })
  res.redirect('/')
})

// 회원정보 수정 전 비밀번호 재확인
router.post('/mypage/update', (req, res) => {
  const pw = req.body.member_pw

  if (req.session.member_pw === etc.pwCrypto(pw)) {
    res.redirect('/')
  } else {
    res.send(false)
  }
})

//회원정보 수정
router.patch('/mypage/resetmypage', (req, res) => {
  const pw = req.body.member_pw
  if (req.body.member_pw === req.body.member_repw) {
    let reset_sql = 'update member set member_name = ?, member_pw = ?, member_sex = ?, member_birth = ? , member_phone = ?, member_company = ?, member_state = ? where member_email = ?;'
    let reset_params = [req.body.member_name, etc.pwCrypto(pw), req.body.member_sex, req.body.member_birth, req.body.member_phone, req.body.member_company, req.body.member_state, req.session.member_email]
    getConnection((conn) => {
      conn.query(reset_sql, reset_params, (err, rows, fields) => {
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
      conn.release()
    })
  } else {
    res.send('not eaquals pw')
  }
})

// 비밀번호 찾기
router.post('/findpassword', (req, res) => {
  let sql = 'SELECT member_email FROM member WHERE member_email = "' + req.body.mail + '";'   //이메일 입력 시 해당 가입자가 존재하는지 확인.
  getConnection((conn) => {
    conn.query(sql, (err, rows, fields) => {
      if (err) {
        console.log(err)
      } else {
        if (rows[0].member_email === req.body.mail) {   // 해당 이메일이 존재 시
          const now = new Date();
          const tomorrow = new Date(now.setDate(now.getDate() + 1));    // link의 유효기간 설정
          const token = crypto.randomBytes(20).toString('hex')    // 20자리의 랜덤 토큰 생성
          let pw_sql = 'insert into pw_find (pw_key, pw_date, member_email) values (?, ?, ?);'    // 비밀번호 찾기 관련 테이블에 토큰 유효기간, 이메일 저장.
          let params = [token, tomorrow, req.body.mail]
          conn.query(pw_sql, params, (err, rows, fields) => {
            if (err) {
              console.log(err)
            } else {
              let emailParam = {
                toEmail: req.body.mail,
                subject: "[아이디어플랫폼] 비밀번호 재설정",
                html: `<p>아래의 링크를 클릭해주세요 </p> <a href=localhost:3000/member/resetpassword/${token}/${req.body.mail}>인증하기</a>`
              }
              mailer.sendMail(emailParam)
              res.send(true)
            }
          })
        } else {
          res.send(false)
        }
      }
    })
    conn.release()
  })
})

// 비밀번호재설정
// 이메일에서 LINK 클릭 시 token값을 비교하여 유효여부를 판단 후 반환
router.patch(/resetpassword/, (req, res) => {
  let variable = req.path.split("/")
  req.session.token = variable[2]   // 세션에 토큰 값 저장
  req.session.us_mail = variable[3]   // 세션에 이메일 저장
  getConnection((conn) => {
    let reset_sql = 'select pw_key, pw_dispose, pw_date from pw_find where pw_key = ' + conn.escape(req.session.token)   // 해당 링크의 유효여부를 확인.
    conn.query(reset_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send('2')
      } else {
        console.log(rows)
        if (rows[0].pw_dispose === 0) {    // 유효한 링크
          let date_sql = 'update pw_find set pw_dispose = 1 where pw_key = "' + req.session.token + '";'    // 해당 토큰의 폐기여부 업데이트
          conn.query(date_sql, (err, rows, field) => {
            if (err) {
              console.log(err)
              res.send('3')
            } else {
              if (req.body.pw === req.body.repw) {
                let pw = req.body.pw
                let pw_sql = 'update member set member_pw = ? where member_email = "' + req.session.us_email + '";'    // 입력받은 pw를 업데이트
                let pw_param = [etc.pwCrypto(pw)]
                getConnection((conn) => {
                  conn.query(pw_sql, pw_param, (err, rows, field) => {
                    delete req.session.us_mail
                    req.session.save(() => { })
                    if (err) {
                      console.log(err)
                      res.send('4')
                    } else {
                      let log_sql = 'update pw_find set pw_edit = ?, pw_dispose = ? where pw_key = "' + req.session.token + '";'  // 토큰 완전폐기
                      let log_params = [1, 1]
                      conn.query(log_sql, log_params, (err, rows, field) => {
                        if (err) {
                          console.log(err)
                        } else {
                          req.session.destroy()
                          res.redirect('/')
                        }
                      })
                    }
                  })
                  conn.release()
                })
              } else {
                res.send('1')
              }
            }
          })
        } else {
          res.send('5')   // 유효하지 않은 링크
        }
      }
    })
    conn.release()
  })
})

//포인트 현황 조회
router.get('/mypage/point', (req, res) => {
  let email = req.session.member_email
  let point_sql = 'select member_point, save_point, use_point, member_rank from member where member_email = "' + email + '";'
  getConnection((conn) => {
    conn.query(point_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        console.log('rows', rows)
        res.json(rows)
      }
    })
  })
})

//회원탈퇴
router.patch('/mypage/deletemember', (req, res) => {
  let email = req.session.member_email
  let delmem_sql = 'update member set member_secede = 1 where member_email = "' + email + '";'
  getConnection((conn) => {
    conn.query(delmem_sql, (err, rows, field) => {
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

//포인트 사용내역 조회
router.get('/mypage/usepointlist', (req, res) => {
  let email = req.session.member_email
  let uselist_sql = 'select point.use_contents, point.point, point.use_date FROM point INNER JOIN member mem ON mem.member_email = point.member_email where mem.member_email = "' + email + '";'
  getConnection((conn) => {
    conn.query(uselist_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        console.log('rows', rows)
        res.json(rows)
      }
    })
    conn.release()
  })
})

// 포인트 적립내역 조회
router.get('/mypage/savepointlist', (req, res) => {
  let email = req.session.member_email
  getConnection((conn) => {
    let savelist_sql = 'select idea.idea_title, idea.add_point, idea.date_point FROM idea INNER JOIN member mem ON mem.member_email = idea.member_email where mem.member_email = ' + conn.escape(email) + ' and idea.add_point is not NULL;'
    conn.query(savelist_sql, (err, rows, field) => {
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

// 포인트 사용
router.patch('/mypage/usepoint', (req, res) => {
  let point = req.body.use_point
  let contents = req.body.use_contents
  let email = req.session.member_email
  let point_sql = 'select member_point, save_point, use_point, member_rank from member where member_email = "' + email + '";'
  getConnection((conn) => {
    conn.query(point_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
      } else {
        if (rows[0].member_point < point) {
          console.log(rows[0].member_point)
          res.send(false)
        } else {
          let use_member_point = rows[0].member_point - point
          let use_point = rows[0].use_point + point
          let use_point_sql = 'update member set member_point = ?, use_point = ? where member_email = ?;' + 'insert into point (member_email, use_date, use_contents, point) values (?, ?, ?, ?);'
          let use_point_params = [use_member_point, use_point, email, email, etc.date(), contents, point]
          conn.query(use_point_sql, use_point_params, (err, rows, field) => {
            if (err) {
              console.log(err)
            } else {
              console.log('use_point : ', use_point, 'member_point : ', use_member_point)
              res.send(true)
            }
          })
        }
      }
    })
    conn.release()
  })
})

//내 아이디어 조회
router.get('/idea', (req, res) => {
  let email = req.session.member_email
  let idea_sql = 'select idea_title, idea_date from idea where member_email = "' + email + '";'
  getConnection((conn) => {
    conn.query(idea_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        if (rows.length === 0) {
          console.log('error')
          res.send(false)
        } else {
          res.json(rows)
        }
      }
    })
    conn.release()
  })
})

// 관심사업 등록
router.patch('/check', (req, res) => {
  let email = req.session.member_email
  let sele_sql = 'insert into inter_anno (member_email, anno_id) values (?, ?);'
  let sele_params = [email, req.body.anno_key]
  getConnection((conn) => {
    conn.query(sele_sql, sele_params, (err, rows, field) => {
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

//내 관심사업 조회
router.get('/marked', (req, res) => {
  let email = req.session.member_email
  getConnection((conn) => {
    let anno_sql = 'select an.anno_id, an.anno_title, an.anno_date FROM member mem INNER JOIN inter_anno inan ON mem.member_email = inan.member_email INNER JOIN anno an ON inan.anno_id = an.anno_id AND mem.member_email = ' + conn.escape(email)
    conn.query(anno_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        if (rows.length === 0) {
          console.log('not found')
          res.send(false)
        } else {
          console.log('rows', rows)
          res.json(rows)
        }
      }
    })
    conn.release()
  })
})

//내 관심사업 해제
router.delete('/deletecheck', (req, res) => {
  let email = req.session.member_email
  let delchk_sql = 'delete from inter_anno where anno_id = ' + req.query.anno_id + ' AND member_email = "' + email + '";'
  getConnection((conn => {
    conn.query(delchk_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        console.log(rows)
        res.send(true)
      }
    })
    conn.release()
  }))
})

module.exports = router;
