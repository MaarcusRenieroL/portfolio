"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "./icons";

interface ShadcnDatePickerProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDate(str?: string): Date | null {
  if (!str) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!match) return null;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10) - 1;
  const d = parseInt(match[3], 10);
  const date = new Date(y, m, d);
  if (isNaN(date.getTime())) return null;
  return date;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function ShadcnDatePicker({
  id = "f-date",
  value = "",
  onChange,
  placeholder = "YYYY-MM-DD",
  disabled = false,
}: ShadcnDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedDate = useMemo(() => parseDate(value), [value]);

  // Current viewed month and year in calendar
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate ?? new Date());

  // Update view when value changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const prevMonth = useCallback(() => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const handleSelectDay = (day: number) => {
    const next = new Date(viewYear, viewMonth, day);
    onChange(formatDate(next));
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(formatDate(today));
    setViewDate(today);
    setOpen(false);
  };

  // Build calendar matrix (42 cells)
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarCells: Array<{
    day: number;
    isCurrentMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
  }> = [];

  const today = new Date();
  const isTodayYearMonth =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  // Previous month's trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isSelected: false,
      isToday: false,
    });
  }

  // Current month's days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const isSelected =
      Boolean(selectedDate) &&
      selectedDate!.getFullYear() === viewYear &&
      selectedDate!.getMonth() === viewMonth &&
      selectedDate!.getDate() === d;

    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      isSelected,
      isToday: isTodayYearMonth && today.getDate() === d,
    });
  }

  // Next month's leading days
  const totalRendered = calendarCells.length;
  const remaining = totalRendered > 35 ? 42 - totalRendered : 35 - totalRendered;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      isSelected: false,
      isToday: false,
    });
  }

  return (
    <div ref={containerRef} className="shadcn-date-picker-wrap">
      {/* Input container */}
      <div className="shadcn-date-input-box">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          className="shadcn-date-input"
          onChange={(e) => onChange(e.target.value)}
          onClick={() => !disabled && setOpen(true)}
        />
        <div className="shadcn-date-input-actions">
          {value && !disabled && (
            <button
              type="button"
              className="shadcn-date-clear-btn"
              onClick={handleClear}
              title="Clear date"
              aria-label="Clear date"
            >
              <XIcon width={12} height={12} />
            </button>
          )}
          <button
            type="button"
            className="shadcn-date-trigger-btn"
            onClick={() => !disabled && setOpen((o) => !o)}
            disabled={disabled}
            title="Open calendar"
            aria-label="Open calendar"
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <CalendarIcon width={14} height={14} />
          </button>
        </div>
      </div>

      {/* Floating Shadcn Calendar Popover */}
      {open && (
        <div className="shadcn-calendar-popover" role="dialog" aria-modal="true" aria-label="Choose date">
          {/* Calendar Header */}
          <div className="shadcn-calendar-header">
            <span className="shadcn-calendar-title">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <div className="shadcn-calendar-nav">
              <button
                type="button"
                className="shadcn-calendar-nav-btn"
                onClick={prevMonth}
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeftIcon width={14} height={14} />
              </button>
              <button
                type="button"
                className="shadcn-calendar-nav-btn"
                onClick={nextMonth}
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRightIcon width={14} height={14} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="shadcn-calendar-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w} className="shadcn-calendar-weekday">
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="shadcn-calendar-grid">
            {calendarCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <span key={idx} className="shadcn-calendar-day out">
                    {cell.day}
                  </span>
                );
              }
              return (
                <button
                  key={idx}
                  type="button"
                  className={`shadcn-calendar-day ${cell.isSelected ? "selected" : ""} ${
                    cell.isToday ? "today" : ""
                  }`}
                  onClick={() => handleSelectDay(cell.day)}
                  aria-pressed={cell.isSelected}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Popover Footer Actions */}
          <div className="shadcn-calendar-footer">
            <button
              type="button"
              className="shadcn-calendar-footer-btn"
              onClick={handleToday}
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                className="shadcn-calendar-footer-btn clear"
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
