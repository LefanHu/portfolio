"use client";
import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";
import type { ComponentPropsWithoutRef } from "react";

export default function LTActivityCalendar(
  props: ComponentPropsWithoutRef<"div"> & { calendarstring: string }
) {
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
        data={data}
        theme={{
          // light: ["#454854", "#c4edde", "#7ac7c4", "#6e91fa", "#4e77f2"],
          dark: ["#7a7c82", "#becdf7", "#9fb5f5", "#6e5cf7", "#8735f2"],
        }}
      />
    </div>
  );
}
