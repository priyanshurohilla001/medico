"use client"
import * as React from "react"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export default function CalendarDemo() {
  const [date, setDate] = useState(new Date())

  console.log(date)

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  )
}
