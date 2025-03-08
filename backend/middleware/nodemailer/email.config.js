import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: "Studdy Buddy <studyybuddy@gmail.com>",
            to: options.email,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export default sendEmail;
