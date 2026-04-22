import { Fragment } from "react";
import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex flex-wrap gap-1.5 pb-4 text-[13px] text-[var(--text-muted)]" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {item.to ? (
            <Link to={item.to} className="text-[var(--primary)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--text)]">{item.label}</span>
          )}
          {index < items.length - 1 && <span>›</span>}
        </Fragment>
      ))}
    </nav>
  );
};
