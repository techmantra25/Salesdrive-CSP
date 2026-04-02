import moment from "moment-timezone";

export const checkDateForPrice = (date, timezone = "Asia/Kolkata") => {
  const effectiveDate = moment.tz(date, timezone);
  const today = moment.tz(timezone).startOf("day");
  const isTodayOrPast = !effectiveDate.isAfter(today);

  return {
    isTodayOrPast,
    remainingDays: effectiveDate.startOf("day").diff(today, "days"),
  };
};
