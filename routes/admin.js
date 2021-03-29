let express = require('express');
let router = express.Router();
let getConnection = require('../common/db.js')
let mailer = require('../common/mailer.js');
let etc = require('../common/etc.js')

// 관리자 등록 
router.post('/signup', (req, res) => {
  const pw = req.body.admin_pw
  const now = new Date();
  let sql = 'insert into admin (admin_email, admin_name, admin_sex, admin_birth, admin_state, admin_pw, admin_phone) values (?, ?, ?, ?, ?, ?, ?);' + 'insert into admin_log (admin_email, admin_log_join) values (?, ?);'
  let params = [req.body.admin_email, req.body.admin_name, req.body.admin_sex, req.body.admin_birth, req.body.admin_state, etc.pwCrypto(pw), req.body.admin_phone, req.body.admin_email, now]
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
            console.log(req.session.admin_email)
            console.log('email : ', rows[0].admin_email, 'pw : ', rows[0].admin_pw)
            const now = new Date();
            let log_sql = 'update admin_log set admin_login_lately = ? where admin_email = ?;'
            let log_params = [now, req.body.admin_email]
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



module.exports = router;
