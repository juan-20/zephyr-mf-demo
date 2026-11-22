import type { ReactNode } from 'react';

export function Panel({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`ui-panel ${className}`.trim()}>
      {title && <h2 className="ui-panel__title">{title}</h2>}
      {children}
    </section>
  );
}
