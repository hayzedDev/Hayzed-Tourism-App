const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const { async } = require('regenerator-runtime');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ').at(0);
    this.url = url;
    this.from = `Azeez Natours Page <${process.env.EMAIL_FROM}>`;
  }

  newCreateTransport() {
    if (process.env.NODE_ENV === 'production') {
      // use sendgrid to send the email

      return nodemailer.createTransport({
        // service: 'SendinBlue',
        service: 'Gmail',
        auth: {
          user: process.env.SENDINBLUE_EMAIL,
          pass: process.env.SENDINBLUE_PASS,
        },
      });
    }

    // else we use mailtrap in development mode
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on the pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newCreateTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (Valid for only 10 minutes)'
    );
  }

  async sendPasswordResetNotification() {
    await this.send(
      'notifyPasswordChange',
      'Your Password Has Been Changed!!!'
    );
  }
  // return await transporter.sendMail(mailOptions);
}

module.exports = Email;
