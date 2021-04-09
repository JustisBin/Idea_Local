const { rejects } = require('assert')
let crypto = require('crypto')
let moment = require('moment')
const { resolve } = require('path')
require('moment-timezone')
moment.tz.setDefault('Aisa/Seoul')
let getConnection = require('../common/db.js')

const etc = {
  /* 해시화 함수 */
  pwCrypto: (param) => {
    return crypto.createHash('sha512').update(param).digest('base64')
  },

  /* 랜덤 난수생성기 */
  ranNum: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  /* 현재 시간 반환기 */
  date: () => {
    let date = moment().format('YYYY-MM-DD HH:mm:ss')
    return date
  },

  /* 공고사항 게시물 count 반환기 */
  annoCnt: async () => {
    let count;
    let cnt_sql = 'select count(*) as count from anno'
    await new Promise((resolve, rejects) => {
      getConnection((conn) => {
        conn.query(cnt_sql, (err, rows, field) => {
          if (err) {
            console.log(err)
            rejects(err)
          } else {
            count = rows[0].count
            resolve(count)
          }
        })
        conn.release()
      })
    })
    return count;
  },

  /* 아이디어 게시물 count 반환기 */
  ideaCnt: async () => {
    let count;
    let cnt_sql = 'select count(*) as count from idea where idea_delete = 0'
    await new Promise((resolve, rejects) => {
      getConnection((conn) => {
        conn.query(cnt_sql, (err, rows, field) => {
          if (err) {
            console.log(err)
            rejects(err)
          } else {
            count = rows[0].count
            resolve(count)
          }
        })
        conn.release()
      })
    })
    return count;
  }
}

module.exports = etc;