const dotenv = require('dotenv')
const express = require('express')
const app = express()
app.use(express.json())
const nodemailer = require('nodemailer')
const mysql = require('mysql')
const crypto = require('crypto')
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
dotenv.config({
  path: '/Users/jeong-uibin/Documents/Idle_1st/process.env'
});
const port = process.env.SERVER_PORT

//데이터 베이스 연결
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_USE,
  multipleStatements: true
});

connection.connect();

// 메일전송 연결
const smtpTransport = nodemailer.createTransport({
  service: process.env.SERVICE_NAME,
  auth: {
    user: process.env.STMP_USER,
    pass: process.env.STMP_PW
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 세션 저장 연결
const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PW,		//데이터베이스 접근 비밀번호
  database: process.env.DB_USE		//데이터베이스의 이름
};

const sessionStore = new MySQLStore(options);

// 세션 사용 설정
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));

// 이용약관 확인
// 선택약관에 체크시 결과값 반환, 
// 동의(0) 할 경우 true, 비동의(1) 일 경우 false를 반환합니다.
app.post('/member/agreemember', (req, res) => {
  let agree = req.body.chosen_agree;
  if (agree === 0) {
    req.session.chosen = 0
    res.send(true);
  } else {
    req.session.chosen = 1
    res.send(false);
  }
})

// 이메일 인증번호 확인. 확인시 true 반환
app.get('/member/signup/checktoken', (req, res) => {
  if (req.query.param === req.session.token) {
    res.send(true)
  }
  else {
    res.send(false)
  }
})

// 회원가입
app.post('/member/signup', (req, res) => {
  const pw = req.body.member_pw
  const pwCrypto = pw => {
    return crypto.createHash('sha512').update(pw).digest('base64')    // 비밀번호 해시화
  }
  let sql = 'insert into member (member_email, member_name, member_sex, member_birth, member_company, member_state, member_pw, member_phone, chosen_agree) values (?, ?, ?, ?, ?, ?, ?, ?, ?);'
  let params = [req.body.member_email, req.body.member_name, req.body.member_sex, req.body.member_birth, req.body.member_company, req.body.member_state, pwCrypto(pw), req.body.member_phone, req.session.chosen]
  connection.query(sql, params, (err, rows, fields) => {
    if (err) {
      console.log(err)
      res.send(false)
    } else {
      delete req.session.chosen
      req.session.save()
      const now = new Date();
      let log_sql = 'insert into member_log (member_email, member_log_join) values (?, ?);'   // 로그인 로그 저장
      let log_params = [req.body.member_email, now]
      connection.query(log_sql, log_params, (err, rows, fields) => {
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
})

// 이메일 중복확인
// DB member table 에서 일치하는 이메일 검색 후 중복되는 값이 있을 경우 true,
// 중복이 아닐경우 false 반환
app.get('/member/check-email', (req, res) => {
  let param_email = req.query.member_email
  let sql = 'SELECT member_email FROM member WHERE member_email = "' + param_email + '";'
  connection.query(sql, (err, rows, fields) => {
    if (rows.length != 0) {
      let is_email = rows[0].member_email
      if (is_email === param_email) {
        console.log(is_email + ' == ' + param_email)
        res.send(true)
      } else {
        console.log(err)
      }
    } else {
      console.log(param_email + 'Not Found')
      res.send(false)
    }
  });
})

// 이메일 인증
// 이메일 중복확인 후, 이메일 인증 링크를 메일로 전송하여 회원가입 진행.
app.post('/member/pass-email', (req, res) => {
  const ranNum = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  let num = String(ranNum(111111, 999999))
  req.session.token = num
  setTimeout(() => delete req.session.token, 300000)  // 이메일 키 유효기간 설정(5분)

  let mailOptions = {
    from: "dmlqls2822@naver.com",
    to: email,
    subject: "[아이디어플랫폼]인증메일",
    html: "<p>아래의 인증번호를 입력해주세요.</p>" + num  // 인증번호 전송
  };
  smtpTransport.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      res.send(false);
    } else {
      res.send(true)
    }
  });
  smtpTransport.close();
});

//회원로그인
app.post('/member/signin', (req, res) => {
  const pw = req.body.password
  const pwCrypto = pw => {
    return crypto.createHash('sha512').update(pw).digest('base64')
  }
  let sql = 'SELECT member_email, member_pw FROM member WHERE member_email = "' + req.body.email + '";'
  connection.query(sql, (err, rows, fields) => {
    if (err) {
      console.log(err)
      res.send(false)
    } else {
      if (rows[0].member_email === req.body.email && rows[0].member_pw === pwCrypto(pw)) {
        req.session.member_email = req.body.email
        req.session.member_pw = pwCrypto(pw)
        console.log(req.session.member_email)
        console.log('email : ', rows[0].member_email, 'pw : ', rows[0].member_pw)
        const now = new Date();
        let log_sql = 'update member_log set member_login_lately = ? where member_email = ?;' + 'insert into member_login_log (member_email, member_login) values (? ,?);'
        let log_params = [now, req.body.email, req.body.email, now]
        connection.query(log_sql, log_params, (err, rows, fields) => {
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
  })
})

//회원 로그아웃
app.get('/member/logout', (req, res) => {
  req.session.destroy((err) => { })
  res.redirect('/')
})

// 회원정보 수정 전 비밀번호 재확인
app.post('/member/mypage/update', (req, res) => {
  const pw = req.body.member_pw
  const pwCrypto = pw => {
    return crypto.createHash('sha512').update(pw).digest('base64')
  }
  if (req.session.member_pw === pwCrypto(pw)) {
    console.log('sess : ', req.session.member_pw, 'pw : ', pwCrypto(pw))
    res.redirect('/')
  } else {
    res.send(false)
  }
})

//회원정보 수정
app.patch('/member/mypage/resetmypage', (req, res) => {
  const pw = req.body.member_pw
  const pwCrypto = pw => {
    return crypto.createHash('sha512').update(pw).digest('base64')
  }
  if (req.body.member_pw === req.body.member_repw) {
    let reset_sql = 'update member set member_name = ?, member_pw = ?, member_sex = ?, member_birth = ? , member_phone = ?, member_company = ?, member_state = ? where member_email = ?;'
    let reset_params = [req.body.member_name, pwCrypto(pw), req.body.member_sex, req.body.member_birth, req.body.member_phone, req.body.member_company, req.body.member_state, req.session.member_email]
    connection.query(reset_sql, reset_params, (err, rows, fields) => {
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
    res.send('not eaquals pw')
  }
})

// 비밀번호 찾기
app.post('/member/findpassword', (req, res) => {
  let sql = 'SELECT member_email FROM member WHERE member_email = "' + req.body.mail + '";'
  connection.query(sql, (err, rows, fields) => {
    if (err) {
      console.log(err)
    } else {
      if (rows[0].member_email === req.body.mail) {
        const now = new Date();
        const tomorrow = new Date(now.setDate(now.getDate() + 1));
        const token = crypto.randomBytes(20).toString('hex')
        let pw_sql = 'insert into pw_find (pw_key, pw_date, member_email) values (?, ?, ?);'
        let params = [token, tomorrow, req.body.mail]
        connection.query(pw_sql, params, (err, rows, fields) => {
          if (err) {
            console.log(err)
          } else {
            let mailOptions = {
              from: "dmlqls2822@naver.com",
              to: req.body.mail,
              subject: "[아이디어플랫폼] 비밀번호 재설정",
              // html: "<a href='localhost:3000/aaa'>aaaa</a>"
              html: `<p>아래의 링크를 클릭해주세요 </p> <a href=${process.env.DB_HOST}:3000/member/resetpassword/${token}/${req.body.mail}>인증하기</a>`
            };
            smtpTransport.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.log(err);
                res.send(false);
              } else {
                res.send(true)
              }
            });
            smtpTransport.close();
          }
        });
      }
    }
  })
})

// 비밀번호재설정페이지
// 이메일에서 LINK 클릭 시 token값을 비교하여 유효여부를 판단 후 반환
app.get(/resetpassword/, (req, res) => {
  const now = new Date();
  let variable = req.path.split("/")
  req.session.token = variable[3]
  req.session.us_mail = variable[4]
  let reset_sql = 'select pw_key, pw_dispose, pw_date from pw_find where pw_key = "' + req.session.token + '";'
  connection.query(reset_sql, (err, rows, field) => {
    if (err) {
      console.log(err)
      res.send(false)
    } else {
      if (rows[0].pw_dispose === 0 && rows[0].pw_date < now) {
        let date_sql = 'update pw_find set pw_dispose = 1 where pw_key = "' + req.session.token + '";'
        connection.query(date_sql, (err, rows, field) => {
          if (err) {
            console.log(err)
            res.send(false)
          } else {
            res.send(false)
          }
        })
      } else {
        res.send(true)
      }
    }
  })
})

// 비밀번호 재설정
app.patch('/member/repw', (req, res) => {
  if (req.body.pw === req.body.repw) {
    const pw = req.body.member_pw
    const pwCrypto = pw => {
      return crypto.createHash('sha512').update(pw).digest('base64')
    }
    let pw_sql = 'update member set member_pw = ? where member_email = "' + req.session.us_mail + '";'
    let pw_param = [pwCrypto(pw)]
    connection.query(pw_sql, pw_param, (err, rows, field) => {
      delete req.session.us_mail
      req.session.save(() => { })
      if (err) {
        console.log(err)
        res.send(false)
      } else {
        let log_sql = 'update pw_find set pw_edit = ?, pw_dispose = ? where pw_key = "' + req.session.token + '";'
        let log_params = [1, 1]
        connection.query(log_sql, log_params, (err, rows, field) => {
          if (err) {
            console.log(err)
          } else {
            req.session.destroy()
            res.redirect('/dddd')
          }
        })
      }
    })
  } else {
    res.send(false)
  }
})

//포인트 현황 조회
app.get('/member/mypage/point', (req, res) => {
  let email = req.session.member_email
  let point_sql = 'select member_point, save_point, use_point, member_rank from member where member_email = ' + email + ';'
  connection.query(point_sql, (err, rows, field) => {
    if (err) {
      console.log(err)
      res.send(false)
    } else {
      console.log('rows', rows)
      res.send(true)
    }
  })
})

app.get('/', (req, res) => {
  res.send('asdfsaf')
});

app.listen(port, () => {
  console.log(`listen ${port}`)
})