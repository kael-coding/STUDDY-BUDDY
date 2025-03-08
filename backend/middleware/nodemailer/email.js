import sendEmail from "./email.config.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./emailTemplate.js";
import {
    ONE_HOUR_TEMPLATE,
    ONE_DAY_TEMPLATE,
    TEN_AM_TEMPLATE,
    sendPastDueNotification_templates,
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


export const sendTaskStartingSoonReminder = async (email, task) => {
    if (!email || !task || !task.startTime) {
        console.error("Missing email, task, or task start time for starting soon reminder.");
        return;
    }

    const currentTime = new Date();
    const taskStartTime = new Date(task.startTime);

    const timeDifference = taskStartTime - currentTime;

    if (timeDifference > 0 && timeDifference <= 3600000) {
        try {
            const emailContent = ONE_HOUR_TEMPLATE
                .replace("{userName}", task.userName || "User")
                .replace("{taskTitle}", task.name)
                .replace("{taskDueDate}", task.dueDate || "Unknown Date")
                .replace("{taskTimeDue}", task.timeDue || "Unknown Time")
                .replace("{taskURL}", task.url || "#");

            await sendEmail({
                to: email,
                subject: `Task Reminder - Starting Soon: ${task.name}`,
                html: emailContent,
                category: "Task Reminder",
            });

            console.log(`Reminder sent for task: ${task.name}`);
        } catch (error) {
            console.error("sendTaskStartingSoonReminder error:", error.message);
        }
    } else {
        console.log(`No reminder sent. Task "${task.name}" is not starting within the next hour.`);
    }
};

export const sendTenAMOnDeadline = async (email, task) => {
    if (!email || !task) {
        console.error("Missing email or task for 10 AM reminder.");
        return;
    }

    try {
        const emailContent = TEN_AM_TEMPLATE
            .replace("{userName}", task.userName || "User")
            .replace("{taskTitle}", task.name)
            .replace("{taskDueDate}", task.dueDate || "Unknown Date")
            .replace("{taskTimeDue}", task.timeDue || "Unknown Time")
            .replace("{taskURL}", task.url || "#");

        await sendEmail({
            to: email,
            subject: "Task Reminder - Today at 10 AM",
            html: emailContent,
            category: "Task Reminder",
        });

        console.log(`10 AM Reminder sent for task: ${task.name}`);
    } catch (error) {
        console.error("sendTenAMOnDeadline error:", error.message);
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
            .replace("{taskTitle}", task.name)
            .replace("{taskDueDate}", task.dueDate || "Unknown Date")
            .replace("{taskTimeDue}", task.timeDue || "Unknown Time")
            .replace("{taskURL}", task.url || "#");

        await sendEmail({
            to: email,
            subject: "Task Reminder - One Hour Left!",
            html: emailContent,
            category: "Task Reminder",
        });

        console.log(`One Hour Reminder sent for task: ${task.name}`);
    } catch (error) {
        console.error("sendOneHourBefore error:", error.message);
    }
};

export const sendOneDayBefore = async (email, task) => {
    if (!email || !task) {
        console.error("Missing email or task for One Day Reminder.");
        return;
    }

    try {
        const emailContent = ONE_DAY_TEMPLATE
            .replace("{userName}", task.userName || "User")
            .replace("{taskTitle}", task.name)
            .replace("{taskDueDate}", task.dueDate || "Unknown Date")
            .replace("{taskTimeDue}", task.timeDue || "Unknown Time")
            .replace("{taskURL}", task.url || "#");

        await sendEmail({
            to: email,
            subject: "Task Reminder - Due Tomorrow",
            html: emailContent,
            category: "Task Reminder",
        });

        console.log(`One Day Reminder sent for task: ${task.name}`);
    } catch (error) {
        console.error("sendOneDayBefore error:", error.message);
    }
};

export const sendPastDueNotification = async (email, task, userName) => {

    try {
        const user = { email, userName }
        const emailContent = sendPastDueNotification_templates
            .replace("{userName}", user.userName || "User")
            .replace("{taskTitle}", task.title)
            .replace("{taskDueDate}", task.dueDate || "Unknown Date")
            .replace("{taskTimeDue}", task.timeDue || "Unknown Time")
            .replace("{taskURL}", task.url || "#");

        await sendEmail({
            email: user.email,
            subject: "Missed Deadline - Past Due Task",
            html: emailContent,
            category: "Past Due Task Notification",
        });

        console.log(`Past Due Notification sent for task: ${task.title}`);
    } catch (error) {
        console.error("sendPastDueNotification error:", error.message);
    }
};