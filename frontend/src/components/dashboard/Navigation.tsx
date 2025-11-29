
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Server, AreaChart, Network, User, Book } from 'lucide-react';

interface NavigationProps {
  isSidebarOpen: boolean;
}

const navLinks = [
    { to: '/dashboard', icon: Home, text: 'Home', end: true },
    { to: '/dashboard/overview', icon: Server, text: 'Overview' },
    { to: '/dashboard/monitoring', icon: AreaChart, text: 'Monitoring' },
    { to: '/dashboard/traffic', icon: BarChart2, text: 'Traffic' },
    { to: '/dashboard/services', icon: Server, text: 'Services' },
    { to: '/dashboard/dependency-map', icon: Network, text: 'Dependency Map' },
    // { to: '/dashboard/settings', icon: Settings, text: 'Settings' },
    { to: '/dashboard/api-and-report', icon: Book, text: 'API & Report' },
    { to: '/dashboard/profile', icon: User, text: 'Profile' },
];

const Navigation = ({ isSidebarOpen }: NavigationProps) => {
  return (
    <nav className="flex flex-col p-4 space-y-2">
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `flex items-center p-2 rounded-md transition-colors duration-200 ${
              isActive ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted'
            } ${
              isSidebarOpen ? 'justify-start' : 'justify-center'
            }`
          }
        >
          <link.icon className="w-5 h-5 flex-shrink-0" />
          {isSidebarOpen && <span className="ml-3 text-sm font-medium">{link.text}</span>}
          {!isSidebarOpen && (
            <span className="absolute left-full ml-4 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {link.text}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;
