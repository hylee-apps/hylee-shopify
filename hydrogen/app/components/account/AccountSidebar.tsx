import {Link, Form, useLocation} from 'react-router';
import {useState} from 'react';
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import type {LucideProps} from 'lucide-react';
import type {ComponentType} from 'react';
import {getInitials, isNavActive} from '~/lib/account-helpers';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';

interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<LucideProps>;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {label: 'Dashboard', to: '/account', icon: LayoutDashboard},
  {label: 'My Orders', to: '/account/orders', icon: Package},
  {label: 'Wishlist', to: '#', icon: Heart, disabled: true},
  {label: 'Addresses', to: '/account/addresses', icon: MapPin},
  {label: 'Payment Methods', to: '#', icon: CreditCard, disabled: true},
  {label: 'Notifications', to: '#', icon: Bell, disabled: true},
  {label: 'Settings', to: '/account/settings', icon: Settings},
];

interface AccountSidebarProps {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export function AccountSidebar({
  firstName,
  lastName,
  email,
}: AccountSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-25 hidden h-fit max-h-[calc(100vh-120px)] w-70 shrink-0 flex-col gap-6 self-start overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-sm lg:flex">
        <SidebarContent
          firstName={firstName}
          lastName={lastName}
          email={email}
        />
      </aside>

      {/* Mobile menu button + sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm"
            >
              <Menu size={18} />
              Account Menu
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-6">
            <SheetTitle className="sr-only">Account Navigation</SheetTitle>
            <SidebarContent
              firstName={firstName}
              lastName={lastName}
              email={email}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function SidebarContent({
  firstName,
  lastName,
  email,
  onNavigate,
}: AccountSidebarProps & {onNavigate?: () => void}) {
  const location = useLocation();
  const initials = getInitials(firstName, lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Account';

  return (
    <>
      {/* Profile Section */}
      <div className="flex flex-col items-center border-b border-border pb-6">
        <div
          className="flex size-20 items-center justify-center rounded-full text-[32px] font-medium text-white"
          style={{
            backgroundImage:
              'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-brand-accent) 100%)',
          }}
        >
          {initials}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-gray-800">{fullName}</h3>
        <p className="text-sm text-text-muted">{email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavActive(item.to, location.pathname);
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-gray-400"
              >
                <Icon size={20} />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium transition-colors ${
                isActive
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}

        {/* Sign Out */}
        <div className="mt-2 border-t border-border pt-4">
          <Form method="post" action="/account/logout">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </Form>
        </div>
      </nav>
    </>
  );
}

// getInitials and isNavActive imported from shared helpers
