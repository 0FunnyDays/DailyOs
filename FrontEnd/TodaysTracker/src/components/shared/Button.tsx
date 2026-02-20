import type React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  type?: 'button' | 'submit';
  title?: string;
};

const variantClass: Record<Variant, string> = {
  primary:   'btn--primary',
  secondary: 'btn--secondary',
  danger:    'btn--danger',
  ghost:     'btn--ghost',
};

export function Button({ children, onClick, variant = 'secondary', type = 'button', title }: ButtonProps) {
  return (
    <button type={type} onClick={onClick} title={title} className={`btn ${variantClass[variant]}`}>
      {children}
    </button>
  );
}
