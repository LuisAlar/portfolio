import type { Experience } from "../../content/types";

/** "2024-11" -> "November 2024" */
export const formatMonth = (yyyyMm: string) => {
  const [year, month] = yyyyMm.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/** "November 2024 - Present" */
export const formatRange = (exp: Pick<Experience, "startDate" | "endDate" | "isCurrent">) =>
  `${formatMonth(exp.startDate)} - ${exp.isCurrent || !exp.endDate ? "Present" : formatMonth(exp.endDate)}`;
