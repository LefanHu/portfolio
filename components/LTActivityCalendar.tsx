"use client";
import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";
import type { ComponentPropsWithoutRef } from "react";

export default function LTActivityCalendar(
  props: ComponentPropsWithoutRef<"div"> & { calendarstring: string }
) {
  const leetcodeCalendarTheme = [
    "#2b2b2b",
    "#314d38",
    "#3d6a47",
    "#4f8a5b",
    "#67ad6d",
  ];

  // convert calendarString to list
  const calendarData: { [key: string]: number } = JSON.parse(
    props.calendarstring
  );
  const data = Object.entries(calendarData).map(([timestamp, count]) => {
    const level = Math.max(0, Math.min(4, Math.ceil(count / 4)));
    const date = new Date(parseInt(timestamp, 10) * 1000)
      .toISOString()
      .split("T")[0];
    return { count, date, level };
  });

  return (
    <div {...props}>
      <ActivityCalendar
        blockRadius={3}
        colorScheme="dark"
        data={data}
        theme={{
          dark: leetcodeCalendarTheme,
        }}
      />
    </div>
  );
}
