let axios = require('axios')
let cheerio = require('cheerio')
let iconv2 = require('iconv-lite')
let getConnection = require('./db.js')
let cron = require('node-cron')

const getHtml = async (url) => {
  try {
    return await axios.get(url, { responseEncoding: 'binary', responseType: 'arraybuffer' })
  } catch (err) {
    console.error(err)
  }
}

function getList() {
  return getHtml("https://cse.kangwon.ac.kr/index.php?mp=5_1_1")
    .then(html => {
      let ulList = [];
      const $ = cheerio.load(iconv2.decode(html.data, 'euc-kr'))
      const $bodyList = $("#bbsWrap > table > tbody > tr")
      $bodyList.each((i, elem) => {
        let url = "https://cse.kangwon.ac.kr/" + $(elem).find('a').attr('href')
        let strurl = url.split('=')
        ulList[i] = {
          title: $(elem).find('a').text(),
          url: url,
          date: $(elem).find('td.dt').text(),
          num: strurl[9]
        }
      })
      return ulList

    }).catch((er) => {
      console.log(er)
    })
}

function getContents(url) {
  return getHtml(url)
    .then(html => {
      const $con = cheerio.load(iconv2.decode(html.data, 'euc-kr'))
      const urlCon = {
        contents: $con("#oxbbsPrintArea > div > div.note").html()
      }
      return urlCon
    }).catch((er) => {
      console.log(er)
    })
}

cron.schedule('0 */1 * * * *', async () => {
  let valText = ""
  let selText = ""
  await getList().then(data => {
    getConnection(async (conn) => {
      for (let i = 0; i < data.length - 1; i++) {
        selText = selText + "anno_spurl != " + conn.escape(data[i].num) + " OR "
      }
      selText = selText + "anno_spurl != " + conn.escape(data[data.length - 1].num) + ";"
      let findSql = "select anno_spurl from anno where " + selText
      await conn.query(findSql, async (err, rows, field) => {
        if (err) {
          console.log(err)
        } else {
          if (rows.length === 0) {
            for (let i = 0; i < data.length - 1; i++) {
              valText = valText + "(" + conn.escape(data[i].title) + ", " + conn.escape(data[i].date) + ", " + conn.escape(data[i].url) + ", ' ', '강원대학교 컴퓨터공학과', " + conn.escape(data[i].num) + "),"
            }
            valText = valText + "(" + conn.escape(data[data.length - 1].title) + ", " + conn.escape(data[data.length - 1].date) + ", " + conn.escape(data[data.length - 1].url) + ", ' ', '강원대학교 컴퓨터공학과', " + conn.escape(data[data.length - 1].num) + ");";
            let listSql = "insert into anno (anno_title, anno_date, anno_link, anno_contents, anno_ref, anno_spurl) values " + valText
            await conn.query(listSql, (err, rows, field) => {
              if (err) {
                console.log(err)
              } else {
                console.log('update')
              }
            })
          } else {
            console.log('no update')
          }
        }
      })
      conn.release()
    })
  }).catch((err) => {
    console.log(err)
  })

  await getConnection((conn) => {
    let findUrl_sql = "select anno_link from anno where anno_contents = " + conn.escape(" ")
    conn.query(findUrl_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
      } else {
        if (rows.length === 0) {
          console.log('not contents update')
        } else {
          for (let i = 0; i < rows.length; i++) {
            getContents(rows[i].anno_link).then(data => {
              let updContents_sql = "update anno set anno_contents = " + conn.escape(data.contents) + " where anno_link = " + conn.escape(rows[i].anno_link)
              conn.query(updContents_sql, (err, rows, field) => {
                if (err) {
                  console.log(err)
                } else {
                  console.log('contents update')
                }
              })
            }).catch((err) => {
              console.log(err)
            })
          }
          console.log('not contents update')
        }
      }
    })
    conn.release()
  })

  await getConnection((conn) => {
    let rank_sql = 'update member t1, (select @ROWNUM := @ROWNUM + 1 rownum, member_email from member, (select @ROWNUM := 0) rn where member_ban = 0 AND member_secede = 0 order by save_point desc) t2 set t1.member_rank = t2.rownum where t1.member_email = t2.member_email'
    conn.query(rank_sql, (err, rows, field) => {
      if (err) {
        console.log(err)
      } else {
        console.log('rank update')
      }
    })
    conn.release()
  })
})