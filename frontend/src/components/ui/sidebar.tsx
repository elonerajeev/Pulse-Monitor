import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Server } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard" className="flex items-center p-2 rounded hover:bg-gray-700">
              <Home className="w-5 h-5 mr-2" />
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/traffic" className="flex items-center p-2 rounded hover:bg-gray-700">
              <BarChart2 className="w-5 h-5 mr-2" />
              Traffic
            </NavLink>
          </li>
          <li>
            <NavLink to="/services" className="flex items-center p-2 rounded hover:bg-gray-700">
              <Server className="w-5 h-5 mr-2" />
              Services
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;