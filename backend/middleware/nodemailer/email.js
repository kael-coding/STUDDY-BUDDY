import sendEmail from "./email.config.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./emailTemplate.js";
import {
    ONE_DAY_TEMPLATE,
    sendPastDueNotification_templates,
    ONE_HOUR_TEMPLATE
} from "./emailTemplate.js";


export const sendVerificationEmail = async (email, verificationToken) => {
    const user = { email }

    try {
        await sendEmail({
            email: user.email,
            subject: "Verify your email account",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email verification",
        });
        //console.log("sendVerificationEmail response", response);
    } catch (error) {
        console.log("sendVerificationEmail error", error.message);
        throw new Error("Internal server error");
    }
}

export const sendWelcomeEmail = async (email, userName) => {
    const user = { email, userName }

    try {
        await sendEmail({
            email: user.email,
            subject: "Verify success",
            html: WELCOME_EMAIL_TEMPLATE.replace("{userName}", user.userName),
            category: "Welcome email",
        })
        //console.log(response)
    } catch (error) {
        console.log("sendWelcomeEmail error", error.message);
        throw new Error("Internal server error");
    }
}

export const sendPasswordResetResetEmail = async (email, resetURL, userName) => {
    const user = { email, userName }
    try {
        await sendEmail({
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
        await sendEmail({
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

export const sendOneDayBefore = async (email, task) => {
    if (!email || !task) {
        console.error("Missing email or task for One Day Reminder.");
        return;
    }

    try {
        const emailContent = ONE_DAY_TEMPLATE
            .replace("{userName}", task.userName || "User")
            .replace("{taskTitle}", task.title)
            .replace("{taskDueDate}", task.dueDate || "Unknown Date")
            .replace("{taskTimeDue}", task.timeDue || "Unknown Time")
            .replace("{taskURL}", task.url || "#");

        await sendEmail({
            email: email,
            subject: "Task Reminder - Due Tomorrow",
            html: emailContent,
            category: "Task Reminder",
        });

        console.log(`One Day Reminder sent for task: ${task.title}`);
    } catch (error) {
        console.error("sendOneDayBefore error:", error.message);
    }
};

export const sendOneHourBefore = async (email, task) => {
    if (!email || !task) {
        console.error("Missing email or task for One Hour Reminder.");
        return;
    }

    try {
        const emailContent = ONE_HOUR_TEMPLATE
            .replace("{userName}", task.userName || "User")
            .replace("{taskTitle}", task.title)
            .replace("{taskDueDate}", task.dueDate || "Unknown Date")
            .replace("{taskTimeDue}", task.timeDue || "Unknown Time")
            .replace("{taskURL}", task.url || "#");

        await sendEmail({
            email: email,
            subject: "Task Reminder - Due in One Hour",
            html: emailContent,
            category: "Task Reminder",
        });

        console.log(`One Hour Reminder sent for task: ${task.title}`);
    } catch (error) {
        console.error("sendOneHourBefore error:", error.message);
    }
};

export const sendPastDueNotification = async (email, task) => {
    try {
        const emailContent = sendPastDueNotification_templates
            .replace("{userName}", task.userName || "User")
            .replace("{taskTitle}", task.title)
            .replace("{taskDueDate}", task.dueDate || "Unknown Date")
            .replace("{taskTimeDue}", task.timeDue || "Unknown Time")
            .replace("{taskURL}", task.url || "#");

        await sendEmail({
            email: email,
            subject: "Missed Deadline - Past Due Task",
            html: emailContent,
            category: "Past Due Task Notification",
        });

        console.log(`Past Due Notification sent for task: ${task.title}`);
    } catch (error) {
        console.error("sendPastDueNotification error:", error.message);
    }
};