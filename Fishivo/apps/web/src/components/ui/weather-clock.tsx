"use client"

import { useEffect, useState } from "react"
// Simple placeholder function
const calculateLocalTime = (date: Date, timezone: number) => {
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
  return new Date(utcTime + (timezone * 1000))
}

interface WeatherClockProps {
  initial: Date
  timezone: number
  className?: string
}

export default function WeatherClock({ initial, timezone, className = "" }: WeatherClockProps) {
  const [time, setTime] = useState(calculateLocalTime(initial, timezone))

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculateLocalTime(new Date(), timezone))
    }, 1000)

    return () => clearInterval(timer)
  }, [timezone])

  return (
    <div className={`tabular-nums ${className}`}>
      {time.toLocaleTimeString("tr-TR", {
        timeZone: "UTC",
        hour12: false, // 24-hour format for Turkish locale
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </div>
  )
}