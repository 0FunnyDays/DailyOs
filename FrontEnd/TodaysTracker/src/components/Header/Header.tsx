import { formatDateDisplay } from '../../utils/dateUtils';

type HeaderProps = {
  currentDate: string;
};

export function Header({ currentDate }: HeaderProps) {
  const parts = formatDateDisplay(currentDate).split(', ');
  const weekday = parts[0];
  const rest = parts.slice(1).join(', ');

  return (
    <header className="page-header">
      <h1 className="page-header__weekday">{weekday}</h1>
      <p className="page-header__date">{rest}</p>
    </header>
  );
}
