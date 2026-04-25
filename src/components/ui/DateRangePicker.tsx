import { useMemo, useState } from 'react';
import Calendar, { type CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DateTimePicker.css';
import { useLanguage } from '../../contexts/useLanguage';

interface DateRangePickerProps {
  label: string;
  startDate?: string;
  endDate?: string;
  onChange: (startDate: string, endDate: string) => void;
  required?: boolean;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateRangePicker({
  label,
  startDate = '',
  endDate = '',
  onChange,
  required = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, t } = useLanguage();

  const locale = useMemo(() => {
    if (language === 'lt') return 'lt-LT';
    if (language === 'ru') return 'ru-RU';
    return 'en-US';
  }, [language]);

  const calendarValue: [Date, Date] | [Date, null] | undefined = useMemo(() => {
    if (!startDate) return undefined;
    const start = new Date(`${startDate}T12:00:00`);
    if (!endDate) return [start, null];
    return [start, new Date(`${endDate}T12:00:00`)];
  }, [startDate, endDate]);

  const rangeDisplay = useMemo(() => {
    if (startDate && endDate) return `${startDate} – ${endDate}`;
    if (startDate) return `${startDate} – …`;
    return t('common.selectDateRange');
  }, [startDate, endDate, t]);

  const handleSelect: CalendarProps['onChange'] = (value) => {
    if (!value || !Array.isArray(value)) return;
    const [start, end] = value;
    if (!start) return;
    const startIso = toIsoDate(start);
    const endIso = end ? toIsoDate(end) : '';
    onChange(startIso, endIso);
    if (end) setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="block w-full text-left rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer bg-white"
      >
        {rangeDisplay}
      </button>
      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs text-gray-600 hover:text-gray-900"
          onClick={() => onChange('', '')}
        >
          {t('common.clear')}
        </button>
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setIsOpen(false)} />
          <div className="relative z-[1000]">
            <div className="absolute mt-1 bg-white rounded-lg shadow-2xl border border-gray-200 p-3">
              <Calendar
                locale={locale}
                selectRange
                allowPartialRange
                onChange={handleSelect}
                value={calendarValue}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
