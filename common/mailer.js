const nodemailer = require('nodemailer');
const senderInfo = require('./mailer_info.json')

const mailSender = {
  sendMail: function (param) {
    let smtpTransport = nodemailer.createTransport({
      service: "NAVER",
      auth: {
        user: senderInfo.user,
        pass: senderInfo.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    let mailOptions = {
      from: senderInfo.user,
      to: param.toEmail,
      subject: param.subject,
      html: param.html
    }

    smtpTransport.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent : ' + info.response);
      }
    })
  }

}

module.exports = mailSender;