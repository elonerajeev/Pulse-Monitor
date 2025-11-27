import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart2 } from 'lucide-react';
import useApi from '../../hooks/useApi';
import TrafficCard from '../../components/ui/TrafficCard';

const Traffic = () => {
  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");
  const [favicon, setFavicon] = useState("");
  const [error, setError] = useState("");

  const ANALYTICS_URL = submittedUrl
    ? `/api/v1/traffic?site_id=${submittedUrl}`
    : null;

  const { data: trafficData, loading, error: apiError } = useApi(ANALYTICS_URL || "");

  const handleAnalyze = () => {
    setError("");
    setFavicon("");

    if (!url) {
      setError("Please enter a URL.");
      return;
    }

    try {
      const urlObj = new URL(url.startsWith("http") ? url : `http://${url}`);
      setFavicon(`https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`);
      setSubmittedUrl(url);
    } catch {
      setError("Please enter a valid URL.");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Traffic</h1>

      <Card>
        <CardHeader>
          <CardTitle>Website Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? 'Analyzing...' : <><BarChart2 className="mr-2 h-4 w-4" /> Analyze</>}
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {favicon && (
        <Card>
          <CardHeader>
            <CardTitle>Website Favicon</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={favicon}
              className="w-16 h-16 rounded-lg"
              alt="favicon"
            />
          </CardContent>
        </Card>
      )}

      {loading && <p>Loading traffic analysis...</p>}
      {apiError && <p className="text-red-500">An error occurred while fetching traffic data.</p>}

      {trafficData && trafficData.data && (
        <TrafficCard serviceName={submittedUrl} trafficData={trafficData.data} />
      )}
      
      {trafficData && !trafficData.data && (
        <Card>
          <CardHeader><CardTitle>No Data</CardTitle></CardHeader>
          <CardContent><p>No traffic data could be retrieved for the given URL.</p></CardContent>
        </Card>
      )}

    </div>
  );
};

export default Traffic;
