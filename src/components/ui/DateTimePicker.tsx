import { useState } from 'react';
import Calendar, { type CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DateTimePicker.css';
import { useLanguage } from '../../contexts/LanguageContext';

interface DateTimePickerProps {
  label: string;
  selectedDate: string; // YYYY-MM-DD format
  selectedTime: string; // HH format (00-23)
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  minDate?: Date;
  blockedDates?: Date[]; // Array of dates that should be disabled
  required?: boolean;
}

export function DateTimePicker({
  label,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  minDate,
  blockedDates = [],
  required = false,
}: DateTimePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const { language } = useLanguage();

  // Map language codes to locale strings for react-calendar
  const localeMap: Record<string, string> = {
    lt: 'lt-LT',
    en: 'en-US',
    ru: 'ru-RU',
  };
  const locale = localeMap[language] || 'en-US';

  const handleDateSelect: CalendarProps['onChange'] = (value) => {
    if (!value || Array.isArray(value)) return;
    const date = value as Date;
    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    onDateChange(dateStr);
    setShowCalendar(false);
  };

  const isDateBlocked = (date: Date): boolean => {
    return blockedDates.some(
      (blocked) =>
        blocked.getFullYear() === date.getFullYear() &&
        blocked.getMonth() === date.getMonth() &&
        blocked.getDate() === date.getDate()
    );
  };

  const tileClassName = ({ date }: { date: Date }) => {
    if (isDateBlocked(date)) {
      return 'blocked-date';
    }
    return null;
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    return isDateBlocked(date);
  };

  const currentValue = selectedDate ? new Date(selectedDate + 'T12:00:00') : undefined;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {/* Date Picker */}
        <div className="relative">
          <input
            type="text"
            readOnly
            value={selectedDate || ''}
            onClick={() => setShowCalendar(true)}
            placeholder="YYYY-MM-DD"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            required={required}
          />
          {showCalendar && (
            <>
              <div
                className="fixed inset-0 z-[999]"
                onClick={() => setShowCalendar(false)}
              />
              <div className="absolute left-0 z-[1000] mt-1 bg-white rounded-lg shadow-2xl border border-gray-200 p-3">
                <Calendar
                  onChange={handleDateSelect}
                  value={currentValue}
                  minDate={minDate}
                  locale={locale}
                  tileClassName={tileClassName}
                  tileDisabled={tileDisabled}
                />
              </div>
            </>
          )}
        </div>

        {/* Time Picker */}
        <select
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
          required={required}
        >
          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
            <option key={hour} value={hour.toString().padStart(2, '0')}>
              {hour.toString().padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
