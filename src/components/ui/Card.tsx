import { type ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, id, onClick, hover = false }: CardProps) {
  return (
    <div
      id={id}
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        {
          'cursor-pointer transition-shadow hover:shadow-md': hover || onClick,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
