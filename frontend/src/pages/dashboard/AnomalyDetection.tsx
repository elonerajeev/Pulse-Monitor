import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function AnomalyDetection() {
  const chartData = [
    { time: '00:00', actual: 100, baseline: 95, upper: 120, lower: 70 },
    { time: '04:00', actual: 98, baseline: 92, upper: 115, lower: 70 },
    { time: '08:00', actual: 245, baseline: 100, upper: 120, lower: 70 },
    { time: '12:00', actual: 105, baseline: 105, upper: 125, lower: 80 },
    { time: '16:00', actual: 110, baseline: 100, upper: 120, lower: 80 },
    { time: '20:00', actual: 98, baseline: 95, upper: 115, lower: 75 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Anomaly Detection</h1>
        <p className="text-gray-500 mt-2">ML-powered anomaly detection with forecasting</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Anomalies (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">ML Ensemble</div>
            <p className="text-xs text-gray-500">Multiple models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Anomalies</CardTitle>
          <CardDescription>Actual vs baseline with anomaly detection</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <ReferenceLine y={95} stroke="#888" strokeDasharray="5 5" label="Baseline" />
              <Line type="monotone" dataKey="baseline" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="upper" stroke="#ff7300" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="lower" stroke="#ff7300" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detected Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Anomalies</CardTitle>
          <CardDescription>Detected in the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'Spike', severity: 'high', time: '8:15 AM', value: 245, baseline: 100 },
              { type: 'Trend Change', severity: 'medium', time: '2:30 PM', value: 115, baseline: 100 },
              { type: 'Dip', severity: 'low', time: '11:45 PM', value: 45, baseline: 100 },
            ].map((anomaly, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle className="w-5 h-5 mt-1 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{anomaly.type}</p>
                  <p className="text-sm text-gray-500">
                    Value: {anomaly.value}ms (baseline: {anomaly.baseline}ms)
                  </p>
                  <p className="text-xs text-gray-400">{anomaly.time}</p>
                </div>
                <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'default'}>
                  {anomaly.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Forecast</CardTitle>
          <CardDescription>Predicted values with confidence intervals</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Based on historical patterns and seasonal trends, we forecast the response time to average
            <span className="font-semibold"> 102ms ± 15ms</span> in the next 24 hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
