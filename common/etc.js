let crypto = require('crypto')
let moment = require('moment')
require('moment-timezone')
moment.tz.setDefault('Aisa/Seoul')

const etc = {
  /* 해시화 함수 */
  pwCrypto: function (param) {
    return crypto.createHash('sha512').update(param).digest('base64')
  },

  /* 랜덤 난수생성기 */
  ranNum: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  /* 현재 시간 반환기 */
  date: function () {
    let date = moment().format('YYYY-MM-DD HH:mm:ss')
    return date
  }

}

module.exports = etc;