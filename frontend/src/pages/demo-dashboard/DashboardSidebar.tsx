import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Server, AreaChart, Network, Settings, User, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const navItems = [
  {
    name: 'Home',
    href: '/demo-dashboard',
    icon: Home,
  },
  {
    name: 'Traffic(Working)',
    href: '/demo-dashboard/traffic',
    icon: BarChart2,
  },
  {
    name: 'Services',
    href: '/demo-dashboard/services',
    icon: Server,
  },
  {
      name: 'Monitoring',
      href: '/demo-dashboard/monitoring',
      icon: AreaChart,
  },
  {
      name: 'Dependency Map',
      href: '/demo-dashboard/dependency-map',
      icon: Network,
  },
  {
      name: 'Settings',
      href: '/demo-dashboard/settings',
      icon: Settings,
  },
  {
      name: 'Profile',
      href: '/demo-dashboard/profile',
      icon: User,
  },
  {
      name: 'API & Report',
      href: '/demo-dashboard/api-and-report',
      icon: Book,
  },
];

const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Dashboard</h2>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                location.pathname === item.href
                  ? 'bg-muted hover:bg-muted'
                  : 'hover:bg-transparent hover:underline',
                'justify-start'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
