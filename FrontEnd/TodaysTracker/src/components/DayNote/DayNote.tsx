import { useState, useEffect, useRef, type ChangeEvent } from 'react';

type DayNoteProps = {
  note: string;
  onUpdate: (note: string) => void;
};

export function DayNote({ note, onUpdate }: DayNoteProps) {
  const [local, setLocal] = useState(note);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when the parent switches to a different day
  useEffect(() => {
    setLocal(note);
  }, [note]);

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setLocal(value);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onUpdate(value);
    }, 300);
  }

  return (
    <section className="day-note">
      <textarea
        className="day-note__textarea"
        value={local}
        onChange={handleChange}
        placeholder="Notes for today..."
        rows={3}
      />
    </section>
  );
}
