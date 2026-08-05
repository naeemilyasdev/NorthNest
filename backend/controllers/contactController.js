import nodemailer from 'nodemailer';
import { HTTP_STATUS } from '../config/constants.js';
import { successResponse } from '../utils/responseUtils.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const createTransporter = async () => {
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const emailPort = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 465);
  const emailSecure = process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : emailPort === 465;

  if (emailUser && emailPass) {
    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Email service is not configured. Please set EMAIL_USER/SMTP_USER and EMAIL_PASS/SMTP_PASS in production.');
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  const contactEmail = process.env.CONTACT_EMAIL || 'northnest.support@gmail.com';

  const transporter = await createTransporter();
  const fromAddress = (process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@northnest.com').trim();
  const replyToAddress = String(email || '').trim();

  const mailOptions = {
    from: `North Nest <${fromAddress}>`,
    to: contactEmail,
    replyTo: replyToAddress,
    subject: `New contact request from ${name || 'Visitor'}`,
    text: `Name: ${name || 'Visitor'}\nEmail: ${replyToAddress}\n\nMessage:\n${message}`,
    html: `
      <h2>New contact request</h2>
      <p><strong>Name:</strong> ${name || 'Visitor'}</p>
      <p><strong>Email:</strong> ${replyToAddress}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `,
  };

  // If SendGrid API key is provided, use it (recommended for production)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const sg = (await import('@sendgrid/mail')).default;
      sg.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: contactEmail,
        from: fromAddress,
        replyTo: replyToAddress || undefined,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
      };
      await sg.send(msg);
    } catch (err) {
      console.error('SendGrid send failed:', err);
      throw err;
    }
  } else {
    transporter.on('error', (err) => {
      console.error('SMTP transporter error:', err);
    });

    let info;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('Send mail failed:', err);
      if (err.code === 'EAUTH') {
        throw new Error(
          'Email authentication failed. Check your EMAIL_USER/SMTP_USER and EMAIL_PASS/SMTP_PASS values. For Gmail, enable 2-Step Verification and use a Google App Password.'
        );
      }
      throw err;
    }

    if (nodemailer.getTestMessageUrl(info)) {
      console.log('Contact email preview URL:', nodemailer.getTestMessageUrl(info));
    }
  }

  return successResponse(res, HTTP_STATUS.OK, 'Your message has been sent successfully. We will reply as soon as possible.');
});
