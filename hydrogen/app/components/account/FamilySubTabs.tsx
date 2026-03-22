'use client';

import type {ReactNode} from 'react';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '~/components/ui/tabs';
import {
  FAMILY_SUBCATEGORIES,
  getContactsBySubcategory,
} from '~/lib/address-book';
import type {AddressBook, FamilySubcategory} from '~/lib/address-book';

interface FamilySubTabsProps {
  book: AddressBook;
  children: (subcategory: FamilySubcategory) => ReactNode;
}

export function FamilySubTabs({book, children}: FamilySubTabsProps) {
  return (
    <Tabs defaultValue="parents">
      <TabsList variant="line" className="w-full justify-start">
        {FAMILY_SUBCATEGORIES.map(({value, label}) => {
          const count = getContactsBySubcategory(book, 'family', value).length;
          return (
            <TabsTrigger key={value} value={value} className="text-sm">
              {label}
              {count > 0 && (
                <span className="ml-1 rounded-full bg-surface px-1.5 py-0.5 text-xs font-medium text-text-muted">
                  {count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {FAMILY_SUBCATEGORIES.map(({value}) => (
        <TabsContent key={value} value={value} className="mt-4">
          {children(value)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
