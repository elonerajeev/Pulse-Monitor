// import { useEffect, useState, useCallback } from 'react';
// import { useToast } from '@/hooks/use-toast';
// import api from '@/utils/api';
// import ServiceCard from '@/components/ui/ServiceCard';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { RefreshCw } from 'lucide-react';

// interface MonitoringLog {
//   _id: string;
//   status: string;
//   responseTime: number;
//   createdAt: string;
//   ssl?: { daysUntilExpiry: number; };
// }

// interface MonitoringService {
//   _id: string;
//   name: string;
//   target: string;
//   serviceType: string;
//   interval: number;
//   location?: string;
//   latestLog?: MonitoringLog;
//   logs: MonitoringLog[];
// }

// const Services = () => {
//   const { toast } = useToast();
//   const [services, setServices] = useState<MonitoringService[]>([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const [autoRefresh, setAutoRefresh] = useState(true);
//   const [countdown, setCountdown] = useState(30);

//   const fetchServices = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await api.get('/monitoring');
//       if (response.status === 200) {
//         setServices(response.data.data);
//       } else {
//         toast({ title: 'Error', description: 'Failed to fetch monitoring services.', variant: 'destructive' });
//       }
//     } catch (error) {
//       toast({ title: 'Error', description: 'Failed to fetch monitoring services.', variant: 'destructive' });
//     }
//     setLoading(false);
//   }, [toast]);

//   useEffect(() => {
//     fetchServices();
//   }, [fetchServices]);

//   useEffect(() => {
//     let intervalId: NodeJS.Timeout;
//     if (autoRefresh) {
//         intervalId = setInterval(() => {
//             setCountdown(prevCountdown => {
//                 if (prevCountdown <= 1) {
//                     fetchServices();
//                     return 30;
//                 }
//                 return prevCountdown - 1;
//             });
//         }, 1000);
//     }
//     return () => clearInterval(intervalId);
// }, [autoRefresh, fetchServices]);

// const toggleAutoRefresh = () => {
//     setAutoRefresh(prev => !prev);
//     setCountdown(30);
// };

// const handleRefresh = () => {
//     fetchServices();
// };


//   const handleEdit = (serviceId: string) => {
//     // For now, we'll just log this. In a real app, you might open a modal or navigate to an edit page.
//     console.log(`Edit service: ${serviceId}`);
//   };

//   const handleDelete = async (serviceId: string) => {
//     try {
//       await api.delete(`/monitoring/${serviceId}`);
//       toast({
//         title: "Service Deleted",
//         description: "The monitoring service has been successfully deleted.",
//       });
//       fetchServices();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "There was an error deleting the service. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleCardClick = (serviceId: string) => {
//     navigate(`/monitoring/${serviceId}`);
//   };


//   return (
//     <div>
//         <div className="flex justify-between items-center mb-2">
//             <h1 className="text-3xl font-bold">Services</h1>
//             <div className="flex items-center space-x-4">
//                 <Button variant="outline" onClick={handleRefresh} disabled={loading}>
//                     <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
//                     Refresh
//                 </Button>
//                 <Button variant="outline" onClick={toggleAutoRefresh}>
//                     {autoRefresh ? `Auto Refresh: ${countdown}s` : 'Enable Auto Refresh'}
//                 </Button>
//             </div>
//       </div>
//       <p className="text-muted-foreground mb-8">
//         {services.length > 0
//           ? `You are monitoring ${services.length} service(s).`
//           : "No services are being monitored."}
//       </p>

//       {loading && services.length === 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {Array.from({ length: 3 }).map((_, index) => (
//             <div key={index} className="bg-card border border-border rounded-lg shadow-sm p-4 h-96 animate-pulse" />
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {services.map((service) => (
//               <ServiceCard
//                 key={service._id}
//                 _id={service._id}
//                 name={service.name}
//                 status={service.latestLog?.status || 'unknown'}
//                 target={service.target}
//                 serviceType={service.serviceType}
//                 logs={service.logs}
//                 lastChecked={service.latestLog?.createdAt}
//                 ssl={service.latestLog?.ssl}
//                 onEdit={() => handleEdit(service._id)}
//                 onDelete={() => handleDelete(service._id)}
//                 onRefresh={() => handleRefresh() // Changed this to global refresh
//                 }
//                 onClick={() => handleCardClick(service._id)}
//               />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Services;















import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';
import ServiceCard from '@/components/ui/ServiceCard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface MonitoringLog {
  _id: string;
  status: string;
  responseTime: number;
  createdAt: string;
  ssl?: { daysUntilExpiry: number; };
}

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
  serviceType: string;
  interval: number;
  location?: string;
  latestLog?: MonitoringLog;
  logs: MonitoringLog[];
}

const Services = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<MonitoringService[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/monitoring');
      if (response.status === 200) {
        setServices(response.data.data);
      } else {
        toast({ title: 'Error', description: 'Failed to fetch monitoring services.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch monitoring services.', variant: 'destructive' });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            fetchServices();
            return 30;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchServices]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
    setCountdown(30);
  };

  const handleRefresh = () => {
    fetchServices();
  };

  const handleEdit = (serviceId: string) => {
    console.log(`Edit service: ${serviceId}`);
  };

  const handleDelete = async (serviceId: string) => {
    try {
      await api.delete(`/monitoring/${serviceId}`);
      toast({
        title: "Service Deleted",
        description: "The monitoring service has been successfully deleted.",
      });
      fetchServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = (serviceId: string) => {
    navigate(`/monitoring/${serviceId}`);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4
                      bg-card/70 backdrop-blur border border-border rounded-xl p-5 shadow-sm">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground mt-1">
            {services.length > 0
              ? `You are monitoring ${services.length} service(s).`
              : "No services are being monitored."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="transition hover:border-primary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={toggleAutoRefresh}
            className={`transition ${
              autoRefresh
                ? "border-green-500/60 text-green-500 hover:bg-green-500/10"
                : "border-border"
            }`}
          >
            {autoRefresh ? `Auto Refresh: ${countdown}s` : 'Enable Auto Refresh'}
          </Button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && services.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-card/80 backdrop-blur border border-border rounded-xl
                         shadow-sm h-96 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {services.map(service => (

            <div
              key={service._id}
              className="group transition-all duration-200 hover:scale-[1.02]"
            >
              <ServiceCard
                _id={service._id}
                name={service.name}
                status={service.latestLog?.status || 'unknown'}
                target={service.target}
                serviceType={service.serviceType}
                logs={service.logs}
                lastChecked={service.latestLog?.createdAt}
                ssl={service.latestLog?.ssl}
                onEdit={() => handleEdit(service._id)}
                onDelete={() => handleDelete(service._id)}
                onRefresh={() => handleRefresh()}
                onClick={() => handleCardClick(service._id)}
              />
            </div>

          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
