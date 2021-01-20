const nodemailer = require('nodemailer');

type Options = {
  email: string;
  subject: string;
  text: string;
};

export const sendEmail = async (options: Options) => {
  // For Gmail:
  // const transporter = nodemailer.createTransport({
  //   service: 'Gmail',
  //   auth: {
  //     --//--
  //   },
  // Inside gmail acc activate "less secure app" option
  // });

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Alexander Shevtsov <alex@shevpai.io>',
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  await transport.sendMail(mailOptions);
};
