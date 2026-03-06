import nodemailer from 'nodemailer';

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpUser || !smtpPass) {
    console.warn('⚠️ SMTP_USER or SMTP_PASS not set in environment variables. Email sending will fail.');
}

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: smtpUser,
        pass: smtpPass,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!smtpUser || !smtpPass) {
        console.error('❌ Cannot send email: Missing SMTP configuration.');
        return false;
    }

    try {
        await transporter.sendMail({
            from: `"Studio Support" <${smtpUser}>`,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
};
