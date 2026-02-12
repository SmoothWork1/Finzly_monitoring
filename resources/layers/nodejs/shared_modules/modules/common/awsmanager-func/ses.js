module.exports = async function (awsmanager) {
  awsmanager.prototype.sendEmail = function(smtpOptions,mailOptions) {
    that = this;
    return new Promise(function (resolve, reject) {
      that.nodeMailer.createTransport({
          host:smtpOptions.host,
          port:smtpOptions.port,
          auth:{
            user:smtpOptions.user,
            pass:smtpOptions.pass
          }
      }).sendMail(mailOptions, function (err, info) {
        if (err) {
            that.log.info("Couldn't send email");
            resolve(err);
        } else {
            that.log.info("Email sent successfully");
            resolve(info);
        }
      });
    });
  }
  awsmanager.prototype.sendEmailNative = function(mailOptions) {
    that = this;
    return new Promise(function (resolve, reject) {
      console.log(`SMT TRANSPORTER:${that.transporter}`);
      that.transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            that.log.info("Couldn't send email");
            resolve(err);
        } else {
            that.log.info("Email sent successfully");
            resolve(info);
        }
      });
    });
  }
}