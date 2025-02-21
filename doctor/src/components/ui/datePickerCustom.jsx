"use client"
 
import * as React from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
 
export default function DatePickerWithRange({
  className,
  date: propDate,
  onSelect
}) {
  const [date, setDate] = React.useState(propDate || {
    from: new Date(),
    to: null
  })

  const handleSelect = (newDate) => {
    setDate(newDate);
    if (onSelect) {
      onSelect(newDate);
    }
  }

  React.useEffect(() => {
    if (propDate) {
      setDate(propDate);
    }
  }, [propDate]);

  // Get tomorrow's date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
 
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={tomorrow}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            fromDate={tomorrow} // This disables all dates before tomorrow
            disabled={(date) => date < tomorrow} // Additional safety check
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}