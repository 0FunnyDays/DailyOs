import { useState, type ChangeEvent } from 'react';

type TimeInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function isValidTime(s: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(s)) return false;
  const [h, m] = s.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export function TimeInput({ label, value, onChange }: TimeInputProps) {
  const [raw, setRaw] = useState(value);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');

    let v: string;
    if (digits.length <= 2) {
      v = digits;
    } else {
      v = digits.slice(0, 2) + ':' + digits.slice(2, 4);
    }

    setRaw(v);

    if (isValidTime(v)) {
      onChange(v);
    }
  }

  function handleBlur() {
    if (raw !== '' && !isValidTime(raw)) {
      setRaw('');
      onChange('');
    }
  }

  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        type="text"
        value={raw}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="HH:MM"
        maxLength={5}
        className="field__input field__input--time"
      />
    </label>
  );
}
