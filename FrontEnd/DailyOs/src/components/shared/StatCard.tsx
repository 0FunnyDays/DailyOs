import type { ReactNode } from 'react';

type StatCardVariant = 'blue' | 'green' | 'amber' | 'red' | 'accent' | 'purple';

type StatCardProps = {
  icon?: ReactNode;
  label: string;
  value: string;
  variant?: StatCardVariant;
};

export function StatCard({ icon, label, value, variant = 'accent' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      {icon && <div className="stat-card__icon">{icon}</div>}
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
