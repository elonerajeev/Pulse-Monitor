
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./card";
import {
  BarChart2,
  Globe,
  TrendingUp,
  MousePointerClick,
  Clock,
  Eye,
  Users,
  MapPin,
  Smartphone,
  Monitor,
  Calendar, // For monthly visitors
  Sparkles, // For SEO Details
  Search, // For SEO details
  Link, // For SEO details
  Hash, // For SEO details
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Bar, Legend, CartesianGrid } from "recharts";

interface TrafficCardProps {
  serviceName: string;
  trafficData: {
    rank: {
        global_rank: number;
        country: string;
        country_rank: number;
    };
    engagement: {
        visits: string;
        time_on_site: string;
        bounce_rate: number;
        monthly_visitors_count: number; // Added
    };
    traffic_sources: {
        [source: string]: number;
    };
    historical_traffic: Array<{ date: string; visits: number }>;
    traffic_by_country: Array<{ country: string; visits: number }>;
    device_breakdown: {
        desktop: number;
        mobile: number;
    };
    seo_details: { // Added
        seo_score: number;
        keywords_ranked: number;
        top_keyword: string;
        backlinks: number;
        domain_authority: number;
    }
  };
}

// A generic chart component for DRYness
const ChartContainer = ({ title, icon, children }) => (
    <div className="border p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-3 flex items-center"><div className="mr-2 h-4 w-4 text-primary">{icon}</div>{title}</h3>
        {children}
    </div>
);

const EngagementMetric = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <div className="bg-muted p-2 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  </div>
);

const TrafficSourceChart = ({ data }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  if (!data || Object.keys(data).length === 0) return <p className='text-sm text-muted-foreground'>No data.</p>;
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value: Number(value) }));

  return (
    <ResponsiveContainer width="100%" height={150}>
        <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return <text x={x} y={y} fill="white" textAnchor='middle' dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>;
            }} >
                {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
        </PieChart>
    </ResponsiveContainer>
  );
};

const HistoricalTrafficChart = ({ data }) => {
    if (!data || data.length === 0) return <p className='text-sm text-muted-foreground'>No data.</p>;
    return (
        <ResponsiveContainer width="100%" height={150}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}

const TrafficByCountryChart = ({ data }) => {
    if (!data || data.length === 0) return <p className='text-sm text-muted-foreground'>No data.</p>;
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="country" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}

const DeviceBreakdownChart = ({ data }) => {
    if (!data || data.length === 0) return <p className='text-sm text-muted-foreground'>No data.</p>;
    const chartData = [
        { name: 'Desktop', value: data.desktop, icon: <Monitor className="h-4 w-4"/> },
        { name: 'Mobile', value: data.mobile, icon: <Smartphone className="h-4 w-4"/> }
    ];

    return (
        <div className="flex items-center justify-around">
            {chartData.map(item => (
                <div key={item.name} className="text-center">
                    <div className="text-4xl font-bold">{item.value}%</div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">{item.icon}{item.name}</div>
                </div>
            ))}
        </div>
    )
}

const TrafficCard: React.FC<TrafficCardProps> = ({ serviceName, trafficData }) => {
  if (!trafficData) {
      return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5" />{serviceName}</CardTitle>
                <CardDescription>No data available</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow grid place-content-center">
                <p className='text-sm text-muted-foreground'>Could not retrieve traffic data for this service.</p>
            </CardContent>
        </Card>
      )
  }

  const { rank, engagement, traffic_sources, historical_traffic, traffic_by_country, device_breakdown, seo_details } = trafficData;

  return (
    <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-2 border-primary/10 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">{serviceName}</CardTitle>
        <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow grid gap-y-6">
        
        {rank && (
          <div>
            <h3 className="text-md font-semibold mb-3 flex items-center"><Globe className="mr-2 h-4 w-4 text-primary"/>Global Rank</h3>
            <div className="flex items-baseline space-x-2">
                <p className='text-4xl font-bold'>{rank.global_rank?.toLocaleString() || 'N/A'}</p>
                <p className='text-sm text-muted-foreground'>in {rank.country || 'N/A'}: {rank.country_rank?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>
        )}

        {engagement && (
          <div>
            <h3 className="text-md font-semibold mb-4 flex items-center"><TrendingUp className="mr-2 h-4 w-4 text-primary"/>Engagement</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
              <EngagementMetric icon={<Eye className="h-5 w-5 text-primary"/>} label="Visits" value={engagement.visits || 'N/A'} />
              <EngagementMetric icon={<Calendar className="h-5 w-5 text-primary"/>} label="Monthly Visitors" value={engagement.monthly_visitors_count?.toLocaleString() || 'N/A'} />
              <EngagementMetric icon={<Clock className="h-5 w-5 text-primary"/>} label="Time on Site" value={engagement.time_on_site || 'N/A'} />
              <EngagementMetric icon={<MousePointerClick className="h-5 w-5 text-primary"/>} label="Bounce Rate" value={`${engagement.bounce_rate || 'N/A'}%`} />
            </div>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-4">
            <ChartContainer title="Historical Visits" icon={<BarChart2/>}>
                <HistoricalTrafficChart data={historical_traffic} />
            </ChartContainer>
            <ChartContainer title="Traffic Sources" icon={<Users/>}>
                <TrafficSourceChart data={traffic_sources} />
            </ChartContainer>
            <ChartContainer title="Traffic By Country" icon={<MapPin/>}>
                <TrafficByCountryChart data={traffic_by_country} />
            </ChartContainer>
            <ChartContainer title="Device Breakdown" icon={<Monitor/>}>
                <DeviceBreakdownChart data={device_breakdown} />
            </ChartContainer>
        </div>

        {seo_details && (
            <div>
                <h3 className="text-md font-semibold mb-4 flex items-center"><Sparkles className="mr-2 h-4 w-4 text-primary"/>SEO Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                    <EngagementMetric icon={<Search className="h-5 w-5 text-primary"/>} label="SEO Score" value={seo_details.seo_score || 'N/A'} />
                    <EngagementMetric icon={<Hash className="h-5 w-5 text-primary"/>} label="Keywords Ranked" value={seo_details.keywords_ranked?.toLocaleString() || 'N/A'} />
                    <EngagementMetric icon={<Link className="h-5 w-5 text-primary"/>} label="Top Keyword" value={seo_details.top_keyword || 'N/A'} />
                    <EngagementMetric icon={<Link className="h-5 w-5 text-primary"/>} label="Backlinks" value={seo_details.backlinks?.toLocaleString() || 'N/A'} />
                    <EngagementMetric icon={<Sparkles className="h-5 w-5 text-primary"/>} label="Domain Authority" value={seo_details.domain_authority || 'N/A'} />
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrafficCard;
