import React from 'react';

interface ServiceCardProps {
  name: string;
  status: string;
  target: string;
  serviceType: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ name, status, target, serviceType }) => {
  const statusColor = status === 'online' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{name}</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-white ${statusColor}`}>
          <span className="font-semibold text-sm">{status}</span>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-2">Target: {target}</p>
      <p className="text-gray-600 dark:text-gray-400">Type: {serviceType}</p>
    </div>
  );
};

export default ServiceCard;
