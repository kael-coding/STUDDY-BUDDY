import sendEmail from "./email.config.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./emailTemplate.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const user = { email }

    try {
        const response = await sendEmail({
            email: user.email,
            subject: "Verify your email account",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email verification",
        });
        //console.log("sendVerificationEmail response", response);
    } catch (error) {
        console.log("sendVerificationEmail error", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const sendWelcomeEmail = async (email, userName) => {
    const user = { email, userName }

    try {
        const response = await sendEmail({
            email: user.email,
            subject: "Verify success",
            html: WELCOME_EMAIL_TEMPLATE.replace("{userName}", user.userName),
            category: "Welcome email",
        })
        //console.log(response)
    } catch (error) {
        console.log("sendWelcomeEmail error", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const sendPasswordResetResetEmail = async (email, resetURL, userName) => {
    const user = { email, userName }
    try {
        const response = await sendEmail({
            email: user.email,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL).replace("{userName}", user.userName),
            category: "Reset Password",
        })
        //console.log(response)
    } catch (error) {
        console.log("sendPasswordResetResetEmail error", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const sendResetSuccessEmail = async (email) => {
    const user = { email }
    try {
        const response = await sendEmail({
            email: user.email,
            subject: "Reset your password succesfully",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset",
        })
        //console.log(response)
    } catch (error) {
        console.log("sendResetSuccessEmail error", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}