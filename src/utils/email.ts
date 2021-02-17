import { IUser } from '../models/user.model';

const pug = require('pug');
const path = require('path');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

type Templates = 'welcome' | 'password-reset';

export class Email {
  private to: string;
  private firstname: string;
  private from: string;

  constructor(private user: IUser, private url: string) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.from = `Alexander Shevtsov <${process.env.EMAIL_FROM}>`;
  }

  private createNewTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  private async send(template: Templates, subject: string) {
    // Render HTML based on a pug template
    const html = pug.renderFile(
      path.join(__dirname, '..', 'views', 'email', `${template}.pug`),
      {
        firstName: this.firstname,
        url: this.url,
        subject,
      }
    );

    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.createNewTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'password-reset',
      'Your password reset token (valid for 10 minutes)'
    );
  }
}

// Legacy
// export const sendEmail = async (options: Options) => {
// For Gmail:
// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     --//--
//   },
// Inside gmail acc activate "less secure app" option
// });

//   const mailOptions = {
//     from: 'Alexander Shevtsov <alex@shevpai.io>',
//     to: options.email,
//     subject: options.subject,
//     text: options.text,
//   };
// };
