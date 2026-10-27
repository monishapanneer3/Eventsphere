const parseSessionDateTime = (date, time) => {
  if (!date || !time) return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  if (![year, month, day, hours, minutes].every(Number.isFinite)) return null;
  const parsed = new Date(year, month - 1, day, hours, minutes);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getSessionStart = (session) =>
  parseSessionDateTime(session.dayOfWeek, session.startTime);

export const getSessionEnd = (session) =>
  parseSessionDateTime(session.dayOfWeek, session.endTime) || getSessionStart(session);

export const getSessionStatus = (session, now = new Date()) => {
  const start = getSessionStart(session);
  const end = getSessionEnd(session);
  if (!start || !end || now < start) return "UPCOMING";
  if (now <= end) return "ONGOING";
  return "COMPLETED";
};

export const formatSessionDate = (session) => {
  const start = getSessionStart(session);
  return start
    ? start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "Date TBA";
};