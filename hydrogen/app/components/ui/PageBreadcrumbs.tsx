import React from 'react';
import {Link} from 'react-router';
import {ChevronRight} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {cn} from '~/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';

interface Crumb {
  title: string;
  url: string;
}

interface PageBreadcrumbsProps {
  /** Clickable ancestor links rendered between Home and current page */
  crumbs?: Crumb[];
  /** Non-clickable label for the current page */
  current?: string;
  className?: string;
}

export function PageBreadcrumbs({
  crumbs = [],
  current,
  className,
}: PageBreadcrumbsProps) {
  const {t} = useTranslation();
  const hasItems = crumbs.length > 0 || !!current;

  return (
    <Breadcrumb
      className={cn(
        'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4',
        className,
      )}
    >
      <BreadcrumbList className="text-[14px] font-medium text-[#4b5563]">
        <BreadcrumbItem>
          {hasItems ? (
            <BreadcrumbLink
              asChild
              className="h-10 px-4 rounded-xl hover:bg-accent inline-flex items-center"
            >
              <Link to="/">{t('breadcrumb.home')}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="text-[#111827] font-medium h-10 px-4 inline-flex items-center">
              {t('breadcrumb.home')}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {crumbs.map((crumb) => (
          <React.Fragment key={crumb.url}>
            <BreadcrumbSeparator>
              <ChevronRight size={12} className="text-[#9ca3af]" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="h-10 px-4 rounded-xl hover:bg-accent inline-flex items-center"
              >
                <Link to={crumb.url}>{crumb.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}

        {current && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight size={12} className="text-[#9ca3af]" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#111827] font-medium h-10 px-4 inline-flex items-center">
                {current}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
