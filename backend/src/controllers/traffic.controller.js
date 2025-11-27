
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Function to generate a random integer
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Function to generate a random float
const getRandomFloat = (min, max, decimals) => (Math.random() * (max - min) + min).toFixed(decimals);

// Function to generate varied mock data based on a seed (site_id)
const generateMockTrafficData = (siteId) => {
  // Use a simple hashing function to create a seed from the siteId for deterministic randomness
  // const seed = siteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0); // Not directly used in random functions now
  // const random = (min, max) => (Math.sin(seed * max) + 1) / 2 * (max - min) + min; // Removed this custom random function

  // 1. Rank Information
  const rank = {
    global_rank: getRandomInt(1000, 500000),
    country: ['USA', 'India', 'UK', 'Germany', 'Canada'][getRandomInt(0, 4)],
    country_rank: getRandomInt(100, 50000),
  };

  // 2. Engagement Metrics
  const engagement = {
    visits: `${(getRandomFloat(5, 150, 1) / 10).toFixed(1)}k`,
    time_on_site: `${getRandomInt(1, 10)}:${(getRandomInt(0, 59) < 10 ? '0' : '')}${getRandomInt(0, 59)}`,
    bounce_rate: getRandomFloat(20, 70, 2),
  };

  // 3. Traffic Sources
  const traffic_sources = {
    Search: getRandomFloat(40, 60, 2),
    Direct: getRandomFloat(20, 30, 2),
    Social: getRandomFloat(5, 15, 2),
    Referrals: getRandomFloat(5, 10, 2),
  };

  // 4. Historical Traffic (for the last 30 days)
  const historical_traffic = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    return {
      date: date.toISOString().split('T')[0],
      visits: getRandomInt(1500, 5000), // Using getRandomInt here
    };
  });

  // Calculate monthly visitors count from historical traffic
  const monthly_visitors_count = historical_traffic.reduce((sum, day) => sum + day.visits, 0);
  engagement.monthly_visitors_count = monthly_visitors_count;

  // 5. Traffic by Country
  const traffic_by_country = [
    { country: 'USA', visits: getRandomInt(5000, 15000) },
    { country: 'India', visits: getRandomInt(3000, 10000) },
    { country: 'UK', visits: getRandomInt(2000, 8000) },
    { country: 'Germany', visits: getRandomInt(1000, 5000) },
    { country: 'Canada', visits: getRandomInt(800, 4000) },
  ].sort((a, b) => b.visits - a.visits);

  // 6. Device Breakdown
  const desktop_percentage = getRandomFloat(40, 70, 2); // Using getRandomFloat
  const device_breakdown = {
    desktop: desktop_percentage,
    mobile: parseFloat((100 - desktop_percentage).toFixed(2)),
  };

  // 7. SEO Details (mock data)
  const seo_details = {
    seo_score: getRandomFloat(50, 95, 1),
    keywords_ranked: getRandomInt(500, 5000),
    top_keyword: ['analytics', 'traffic analysis', 'website performance', 'marketing tool'][getRandomInt(0, 3)], // Using getRandomInt for array index
    backlinks: getRandomInt(1000, 100000),
    domain_authority: getRandomInt(10, 90),
  };

  return {
    rank,
    engagement,
    traffic_sources,
    historical_traffic,
    traffic_by_country,
    device_breakdown,
    seo_details,
  };
};

const getTrafficData = asyncHandler(async (req, res) => {
  const { site_id } = req.query;

  if (!site_id) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "site_id query param is required"));
  }

  // Generate mock data instead of scraping
  const trafficData = generateMockTrafficData(site_id);

  return res
    .status(200)
    .json(new ApiResponse(200, { data: trafficData }, "Traffic data loaded successfully"));
});

export { getTrafficData };
