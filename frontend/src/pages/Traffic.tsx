import TrafficCard from '../../components/ui/TrafficCard';

const dummyTrafficData1 = {
  rank: {
    global_rank: 224762,
    country: 'Canada',
    country_rank: 47388,
  },
  engagement: {
    visits: '8.0k',
    time_on_site: '05:02',
    bounce_rate: 66.71,
    monthly_visitors_count: 103864,
  },
  traffic_sources: {
    Search: 50,
    Direct: 25,
    Social: 16,
    Referrals: 9,
  },
  historical_traffic: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    visits: Math.floor(Math.random() * 3000) + 1000,
  })),
  traffic_by_country: [
    { country: 'USA', visits: 500000 },
    { country: 'India', visits: 200000 },
    { country: 'UK', visits: 100000 },
    { country: 'Germany', visits: 50000 },
    { country: 'Canada', visits: 25000 },
  ],
  device_breakdown: {
    desktop: 64.59,
    mobile: 35.41,
  },
  seo_details: {
    seo_score: 93.1,
    keywords_ranked: 2781,
    top_keyword: 'marketing tool',
    backlinks: 13558,
    domain_authority: 41,
  },
};

const dummyTrafficData2 = {
  rank: {
    global_rank: 494182,
    country: 'UK',
    country_rank: 16529,
  },
  engagement: {
    visits: '4.7k',
    time_on_site: '10:25',
    bounce_rate: 65.13,
    monthly_visitors_count: 86498,
  },
  traffic_sources: {
    Search: 54,
    Direct: 28,
    Social: 11,
    Referrals: 7,
  },
  historical_traffic: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    visits: Math.floor(Math.random() * 3000) + 1000,
  })),
  traffic_by_country: [
    { country: 'USA', visits: 500000 },
    { country: 'India', visits: 200000 },
    { country: 'UK', visits: 100000 },
    { country: 'Germany', visits: 50000 },
    { country: 'Canada', visits: 25000 },
  ],
  device_breakdown: {
    desktop: 69.34,
    mobile: 30.66,
  },
  seo_details: {
    seo_score: 65.5,
    keywords_ranked: 2734,
    top_keyword: 'analytics',
    backlinks: 17257,
    domain_authority: 39,
  },
};

const Traffic = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Traffic</h1>

      <div className="grid gap-4">
        <TrafficCard serviceName="Elonerajeev1233" trafficData={dummyTrafficData1} />
        <TrafficCard serviceName="Google" trafficData={dummyTrafficData2} />
      </div>
    </div>
  );
};

export default Traffic;
