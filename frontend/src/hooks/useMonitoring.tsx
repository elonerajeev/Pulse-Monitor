import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface MonitoringLog {
  _id: string;
  status: string;
  responseTime: number;
  createdAt: string;
  ssl?: { daysUntilExpiry: number };
  message: string;
  monitor: {
    _id: string;
    name: string;
  };
  requests: number;
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

interface TrafficData {
  time: string;
  value: number;
}

interface MonitoringContextType {
  services: MonitoringService[];
  trafficData: TrafficData[];
  loading: boolean;
  fetchServices: () => void;
  fetchTrafficData: () => void;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(
  undefined
);

export const MonitoringProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<MonitoringService[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/monitoring");
      if (response.status === 200) {
        setServices(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch monitoring services.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch monitoring services.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [toast]);

  const fetchTrafficData = useCallback(async () => {
    try {
      const response = await api.get(
        "/traffic?site_id=pulse-monitor-pro.vercel.app"
      );
      if (response.status === 200) {
        const results = response.data.data?.results;
        if (Array.isArray(results)) {
          const formattedTraffic = results.map(
            (item: { pageviews: number; date: string }) => ({
              value: item.pageviews,
              time: new Date(item.date).toLocaleDateString(),
            })
          );
          setTrafficData(formattedTraffic);
        } else {
          setTrafficData([]);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch traffic data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Traffic fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch traffic data.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
    fetchTrafficData();
  }, [fetchServices, fetchTrafficData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchServices();
      fetchTrafficData();
    }, 30000); // 30 seconds refresh interval

    return () => clearInterval(intervalId);
  }, [fetchServices, fetchTrafficData]);

  return (
    <MonitoringContext.Provider
      value={{ services, trafficData, loading, fetchServices, fetchTrafficData }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (context === undefined) {
    throw new Error("useMonitoring must be used within a MonitoringProvider");
  }
  return context;
};
