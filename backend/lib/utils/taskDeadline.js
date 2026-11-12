import moment from "moment-timezone";

export const taskDeadline = ({ dueDate, timeDue }) => {
    const calendarDate = moment.utc(dueDate).format("YYYY-MM-DD");
    return moment.tz(`${calendarDate} ${timeDue}`, "YYYY-MM-DD H:mm", true, "Asia/Manila");
};
