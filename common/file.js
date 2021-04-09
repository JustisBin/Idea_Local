let multer = require('multer')

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/Users/jeong-uibin/Documents/Idle_1st/public/images')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

let upload = multer({ storage: storage })

module.exports = upload;