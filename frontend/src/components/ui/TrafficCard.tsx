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
    Calendar,
    Sparkles,
    Search,
    Link,
    Hash,
  } from "lucide-react";
  import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Bar,
    BarChart,
  } from "recharts";
  
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
        monthly_visitors_count: number;
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
      seo_details: {
        seo_score: number;
        keywords_ranked: number;
        top_keyword: string;
        backlinks: number;
        domain_authority: number;
      };
    };
  }
  
  const ChartContainer = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="border p-4 rounded-lg">
      <h3 className="text-md font-semibold mb-3 flex items-center">
        <div className="mr-2 h-4 w-4 text-primary">{icon}</div>
        {title}
      </h3>
      {children}
    </div>
  );
  
  const Metric = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }) => (
    <div className="flex flex-col">
      <p className="text-sm text-muted-foreground flex items-center">
        {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
        {label}
      </p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
  
  const TrafficSourceChart = ({ data }: { data: { [key: string]: number } }) => {
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
    if (!data || Object.keys(data).length === 0)
      return <p className="text-sm text-muted-foreground">No data.</p>;
  
    const chartData = Object.entries(data).map(([name, value]) => ({
      name,
      value: Number(value),
    }));
  
    return (
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={50}
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
              return (
                <text
                  x={x}
                  y={y}
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  const HistoricalTrafficChart = ({
    data,
  }: {
    data: Array<{ date: string; visits: number }>;
  }) => {
    if (!data || data.length === 0)
      return <p className="text-sm text-muted-foreground">No data.</p>;
  
    return (
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <XAxis dataKey="date" fontSize={10} hide />
          <YAxis fontSize={10} hide />
          <Tooltip />
          <Line type="monotone" dataKey="visits" stroke="#3b82f6" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  const TrafficByCountryChart = ({
    data,
  }: {
    data: Array<{ country: string; visits: number }>;
  }) => {
    if (!data || data.length === 0)
      return <p className="text-sm text-muted-foreground">No data.</p>;
  
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="country" fontSize={10} hide />
          <Tooltip />
          <Bar dataKey="visits" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  const DeviceBreakdownChart = ({
    data,
  }: {
    data: { desktop: number; mobile: number };
  }) => {
    if (!data || !data.desktop || !data.mobile)
      return <p className="text-sm text-muted-foreground">No data.</p>;
  
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold">{data.desktop}%</span>
          <Monitor className="ml-2 h-6 w-6" />
        </div>
        <div className="flex items-baseline">
          <span className="text-4xl font-bold">{data.mobile}%</span>
          <Smartphone className="ml-2 h-6 w-6" />
        </div>
      </div>
    );
  };
  
  const TrafficCard: React.FC<TrafficCardProps> = ({
    serviceName,
    trafficData,
  }) => {
    if (!trafficData) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{serviceName}</CardTitle>
            <CardDescription>No data available</CardDescription>
          </CardHeader>
          <CardContent>Could not retrieve traffic data.</CardContent>
        </Card>
      );
    }
  
    const {
      rank,
      engagement,
      traffic_sources,
      historical_traffic,
      traffic_by_country,
      device_breakdown,
      seo_details,
    } = trafficData;
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{serviceName}</CardTitle>
          <CardDescription>
            Last updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
  
        <CardContent className="space-y-6">
  
          {rank && (
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold flex items-center">
                <Globe className="mr-2 h-4 w-4" /> Global Rank
              </h3>
              <p className="text-3xl font-bold">{rank.global_rank}</p>
              <p className="text-sm">
                {rank.country}: {rank.country_rank}
              </p>
            </div>
          )}
  
          {engagement && (
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold flex items-center mb-4">
                <TrendingUp className="mr-2 h-4 w-4" /> Engagement
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Metric label="Visits" value={engagement.visits} icon={<Eye />} />
                <Metric
                  label="Monthly"
                  value={engagement.monthly_visitors_count}
                  icon={<Calendar />}
                />
                <Metric
                  label="Time"
                  value={engagement.time_on_site}
                  icon={<Clock />}
                />
                <Metric
                  label="Bounce"
                  value={`${engagement.bounce_rate}%`}
                  icon={<MousePointerClick />}
                />
              </div>
            </div>
          )}
  
          {/* ✅ FIXED: ALWAYS VERTICAL */}
          <div className="grid grid-cols-1 gap-4">
            <ChartContainer title="Historical Visits" icon={<BarChart2 />}>
              <HistoricalTrafficChart data={historical_traffic} />
            </ChartContainer>
  
            <ChartContainer title="Traffic Sources" icon={<Users />}>
              <TrafficSourceChart data={traffic_sources} />
            </ChartContainer>
  
            <ChartContainer title="Traffic by Country" icon={<MapPin />}>
              <TrafficByCountryChart data={traffic_by_country} />
            </ChartContainer>
  
            <ChartContainer title="Device Breakdown" icon={<Monitor />}>
              <DeviceBreakdownChart data={device_breakdown} />
            </ChartContainer>
          </div>
  
          {seo_details && (
            <div className="border p-4 rounded-lg">
              <h3 className="font-semibold flex items-center mb-4">
                <Sparkles className="mr-2 h-4 w-4" /> SEO Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Metric label="SEO Score" value={seo_details.seo_score} />
                <Metric label="Keywords" value={seo_details.keywords_ranked} />
                <Metric label="Top Keyword" value={seo_details.top_keyword} />
                <Metric label="Backlinks" value={seo_details.backlinks} />
                <Metric label="Authority" value={seo_details.domain_authority} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  export default TrafficCard;
  