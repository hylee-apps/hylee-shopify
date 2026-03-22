'use client';

import type {ReactNode, ComponentType} from 'react';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '~/components/ui/tabs';
import {Home, Users, Heart, Briefcase, MoreHorizontal} from 'lucide-react';
import type {AddressBook, AddressCategory} from '~/lib/address-book';
import {getContactsByCategory} from '~/lib/address-book';
import type {LucideProps} from 'lucide-react';

const CATEGORY_TABS: {
  value: AddressCategory;
  label: string;
  icon: ComponentType<LucideProps>;
}[] = [
  {value: 'home', label: 'Home', icon: Home},
  {value: 'family', label: 'Family', icon: Users},
  {value: 'friends', label: 'Friends', icon: Heart},
  {value: 'work', label: 'Work', icon: Briefcase},
  {value: 'other', label: 'Other', icon: MoreHorizontal},
];

interface CategoryTabsProps {
  book: AddressBook;
  children: (category: AddressCategory) => ReactNode;
}

export function CategoryTabs({book, children}: CategoryTabsProps) {
  return (
    <Tabs defaultValue="home">
      <TabsList variant="line" className="w-full justify-start">
        {CATEGORY_TABS.map(({value, label, icon: Icon}) => {
          const count = getContactsByCategory(book, value).length;
          return (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon size={16} />
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

      {CATEGORY_TABS.map(({value}) => (
        <TabsContent key={value} value={value} className="mt-6">
          {children(value)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
