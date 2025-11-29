import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';
import TrafficCard from '@/components/ui/TrafficCard';
import {
  BarChart3,
  Activity,
  Rocket,
  ShieldCheck,
  Bell,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

interface MonitoringService {
  _id: string;
  name: string;
  target: string;
}

interface TrafficData {
  name: string;
  traffic: any;
}

// ✅ CONTROL FEATURE STATUS
const ENABLE_TRAFFIC_FEATURE = false;

const Traffic = () => {
  const { toast } = useToast();
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrafficData = useCallback(async (services: MonitoringService[]) => {
    setLoading(true);
    try {
      const trafficPromises = services.map(service =>
        api.get(`/traffic?site_id=${service.target}`).then(response => ({
          name: service.name,
          traffic: response.data.data,
        }))
      );

      const results = await Promise.all(trafficPromises);
      setTrafficData(results);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch traffic data.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!ENABLE_TRAFFIC_FEATURE) return;

    const loadServices = async () => {
      const response = await api.get('/monitoring');
      if (response.status === 200) fetchTrafficData(response.data.data);
    };

    loadServices();
  }, [fetchTrafficData]);

  // ✅ LONG PREMIUM PAGE (UNDER DEVELOPMENT)
  if (!ENABLE_TRAFFIC_FEATURE) {
    return (
      <div className="bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white py-16 px-6 min-h-screen">

        {/* HERO SECTION */}
        <section className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-1 rounded-full mb-4 text-sm">
            <Wrench size={15} /> Under Active Development
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Traffic Monitoring Dashboard
          </h1>

          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Our engineering team is currently building this feature with
            enterprise-level reliability, performance optimization, and
            advanced insights so you can monitor real traffic activity with
            confidence.
          </p>

          <button className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-sm">
            Notify Me When It's Ready
          </button>
        </section>

        {/* FEATURE GRID */}
        <section className="max-w-6xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <FeatureCard icon={<Activity />} title="Real-Time Visitors"
            desc="Live monitoring of visitors across your website with real-time analysis." />

          <FeatureCard icon={<BarChart3 />} title="Traffic Trends"
            desc="Daily, weekly and monthly traffic reports with visual dashboards." />

          <FeatureCard icon={<Bell />} title="Smart Alerts"
            desc="Automatic alerts if traffic drops suddenly or anomaly happens." />

          <FeatureCard icon={<Rocket />} title="High Performance Engine"
            desc="Optimized data pipeline for fast loading and real-time updates." />

          <FeatureCard icon={<ShieldCheck />} title="Secure Tracking"
            desc="We ensure privacy-first monitoring with enterprise-grade security." />

          <FeatureCard icon={<CheckCircle2 />} title="Accurate Reporting"
            desc="Advanced filtering and de-duplication of traffic sources." />

        </section>

        {/* ROADMAP SECTION */}
        <section className="max-w-4xl mx-auto mt-20 bg-[#020617] border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">Development Roadmap</h2>

          <ul className="space-y-3 text-gray-400 text-sm">
            <li>✅ Backend Traffic Collection System</li>
            <li>✅ API Performance Optimization</li>
            <li>⏳ Real-time Socket Integration</li>
            <li>⏳ UI Dashboard Enhancements</li>
            <li>⏳ Country & Device Analytics</li>
            <li>⏳ Data Accuracy Optimization</li>
          </ul>
        </section>

        {/* DEVELOPER MESSAGE */}
        <section className="max-w-4xl mx-auto mt-16 text-gray-500 text-center text-sm">
          <p>
            We are not releasing this feature until it meets production-grade
            quality. Every line of code is tested for performance, accuracy,
            and reliability.
          </p>
          <p className="mt-2">
            Thank you for trusting our platform 💙
          </p>
        </section>

        {/* FOOTER CTA */}
        <section className="mt-16 text-center">
          <p className="text-xs text-gray-600">
            Estimated Release: <span className="text-gray-400">Next Stable Update</span>
          </p>
        </section>

      </div>
    );
  }

  // ✅ REAL PAGE (API WORKING)
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Live Traffic</h1>

      {loading ? (
        <p>Loading traffic data...</p>
      ) : trafficData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trafficData.map((data, index) => (
            <TrafficCard
              key={index}
              serviceName={data.name}
              trafficData={data.traffic}
            />
          ))}
        </div>
      ) : (
        <p>No traffic data available yet.</p>
      )}
    </div>
  );
};

// ✅ INLINE FEATURE CARD COMPONENT
const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-[#020617] border border-gray-800 rounded-xl p-5 hover:border-blue-600 transition">
    <div className="text-blue-400 mb-3">{icon}</div>
    <h3 className="font-medium">{title}</h3>
    <p className="text-sm text-gray-400 mt-2">{desc}</p>
  </div>
);

export default Traffic;
