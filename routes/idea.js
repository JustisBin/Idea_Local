let express = require('express');
let router = express.Router();
let getConnection = require('../common/db.js')
let mailer = require('../common/mailer.js');
let etc = require('../common/etc.js')

// 아이디어 등록
router.post('/newidea', (req, res) => {
	let email = req.session.member_email
	let now = new Date()
	let newIdea_sql = 'insert into idea (idea_title, idea_contents, idea_date, member_email) values (?, ?, ?, ?);'
	let newIdea_params = [req.body.title, req.body.contents, now, email]
	getConnection((conn) => {
		conn.query(newIdea_sql, newIdea_params, (err, rows, field) => {
			if (err) {
				console.log(err)
				res.send(false)
			} else {
				let logIdea_sql = 'insert into idea_log(idea_id) select idea_id from idea where idea_id is not null;'
				conn.query(logIdea_sql, (err, rows, field) => {
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

// 아이디어 수정
router.patch('/patchidea', (req, res) => {
	let email = req.session.member_email
	let key = req.body.key
	let now = new Date()
	let patch_sql = 'select idea_contents from idea where member_email = ? AND idea_id = ?'
	let patch_params = [email, key]
	getConnection((conn) => {
		conn.query(patch_sql, patch_params, (err, rows, field) => {
			if (err) {
				console.log(err)
				res.send(false)
			} else {
				let oldContents = rows[0].idea_contents
				let update_sql = 'update idea set idea_contents = ? where idea_id = ?;' + 'update idea_log set idea_id = ?, idea_contents = ?, idea_edit_date = ?;'
				let update_patch = [req.body.contents, key, key, oldContents, now]
				conn.query(update_sql, update_patch, (err, rows, field) => {
					if (err) {
						console.log(err)
						res.send(false)
					} else {
						res.send(true)
					}
				})
			}
		})
		conn.release()
	})

})

// 아이디어 게시물 조회
router.get('/listidea', (req, res) => {
	let listIdea_sql = 'select idea_title, idea_date from idea where idea_delete = 0'
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

module.exports = router;
