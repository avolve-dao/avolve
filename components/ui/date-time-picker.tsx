"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  date: Date
  setDate: (date: Date) => void
  className?: string
}

export function DateTimePicker({ date, setDate, className }: DateTimePickerProps) {
  const minutes = ["00", "15", "30", "45"]
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(new Date(newDate.setHours(date.getHours(), date.getMinutes())))}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex gap-2">
        <Select
          value={date.getHours().toString()}
          onValueChange={(value) => {
            const newDate = new Date(date)
            newDate.setHours(parseInt(value))
            setDate(newDate)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent>
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour.toString()}>
                {hour.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="flex items-center">:</span>
        <Select
          value={minutes[Math.floor(date.getMinutes() / 15)]}
          onValueChange={(value) => {
            const newDate = new Date(date)
            newDate.setMinutes(parseInt(value))
            setDate(newDate)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Minute" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
