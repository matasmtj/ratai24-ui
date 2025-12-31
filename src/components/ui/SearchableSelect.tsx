import { useState, useMemo } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: Option[] | string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  required = false,
  disabled = false,
  multiple = false,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');

  // Normalize options to always be Option[]
  const normalizedOptions: Option[] = useMemo(() => {
    return options.map(opt => 
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    );
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (query === '') {
      return normalizedOptions;
    }
    return normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [normalizedOptions, query]);

  const handleChange = (newValue: string | string[] | null) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  const getDisplayValue = (val: string | string[]) => {
    if (multiple && Array.isArray(val)) {
      if (val.length === 0) return '';
      const labels = val.map(v => 
        normalizedOptions.find(opt => opt.value === v)?.label || v
      );
      return labels.join(', ');
    }
    return normalizedOptions.find(opt => opt.value === val)?.label || val;
  };

  return (
    <div>
      <Combobox value={value} onChange={handleChange} disabled={disabled} multiple={multiple}>
        <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Combobox.Label>
        <div className="relative">
          <Combobox.Input
            className={clsx(
              'w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm',
              'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              'sm:text-sm'
            )}
            onChange={(event) => setQuery(event.target.value)}
            displayValue={getDisplayValue}
            placeholder={placeholder}
            required={required}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>

          {filteredOptions.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    clsx(
                      'relative cursor-pointer select-none py-2 pl-3 pr-9',
                      active ? 'bg-primary-600 text-white' : 'text-gray-900'
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <span className={clsx('block truncate', selected && 'font-semibold')}>
                        {option.label}
                      </span>

                      {selected && (
                        <span
                          className={clsx(
                            'absolute inset-y-0 right-0 flex items-center pr-4',
                            active ? 'text-white' : 'text-primary-600'
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}
