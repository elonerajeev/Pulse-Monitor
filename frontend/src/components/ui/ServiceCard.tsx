
import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { MoreVertical, CheckCircle, AlertTriangle, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Button } from './button';

interface MonitoringLog {
  _id: string;
  status: string;
  statusCode?: number;
  responseTime: number;
  timings: {
    dns: number;
    tcp: number;
    tls: number;
    firstByte: number;
    contentTransfer: number;
    total: number;
  }
  createdAt: string;
  ssl?: { daysUntilExpiry: number; };
}

interface ServiceCardProps {
  _id: string;
  name: string;
  status: string;
  target: string;
  serviceType: string;
  logs: MonitoringLog[];
  lastChecked?: string;
  ssl?: { daysUntilExpiry: number; };
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ _id, name, status, target, serviceType, logs = [], lastChecked, ssl, onEdit, onDelete, onRefresh }) => {
  const statusColor = status === 'online' ? 'text-green-500' : 'text-red-500';
  const statusBgColor = status === 'online' ? 'bg-green-500/10' : 'bg-red-500/10';
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  const chartData = logs.map(log => ({
    time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    responseTime: log.responseTime,
  }));

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  const sslDaysUntilExpiry = ssl?.daysUntilExpiry;
  const sslColor = sslDaysUntilExpiry === undefined
    ? 'text-muted-foreground'
    : sslDaysUntilExpiry > 14
      ? 'text-green-500'
      : sslDaysUntilExpiry > 0
        ? 'text-yellow-500'
        : 'text-red-500';


  return (
    <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
      <Link to={`/monitoring/${_id}`} className="flex-grow flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground truncate pr-2" title={name}>{name}</h3>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={(e) => {e.preventDefault(); onRefresh();}}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={(e) => e.preventDefault()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {e.preventDefault(); onEdit();}}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {e.preventDefault(); onDelete();}} className="text-red-500">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-sm text-muted-foreground truncate mt-1" title={target}>{target}</p>
        </div>

        <div className="p-4 flex-grow">
          <div className="h-24 -mx-4 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}ms`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    fontSize: '12px',
                    padding: '4px 8px'
                  }}
                  labelStyle={{ fontWeight: 'bold' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Legend verticalAlign="top" height={30} iconSize={10} wrapperStyle={{fontSize: "12px"}}/>
                <Line
                  name="Response Time (ms)"
                  type="monotone"
                  dataKey="responseTime"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center">
                {status === 'online' ? <CheckCircle className="h-4 w-4 mr-2 text-green-500"/> : <AlertTriangle className="h-4 w-4 mr-2 text-red-500"/>} 
                Status
              </span>
              <span className={`font-semibold ${statusColor}`}>{status.charAt(0).toUpperCase() + status.slice(1)} {latestLog?.statusCode && `(${latestLog.statusCode})`}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center"><Clock className="h-4 w-4 mr-2"/>Last Checked</span>
              <span className="font-semibold">{formatTime(lastChecked || new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center">
                <ShieldCheck className={`h-4 w-4 mr-2 ${sslColor}`} />
                SSL
              </span>
              <span className={`font-semibold ${sslColor}`}>
                {sslDaysUntilExpiry === undefined
                  ? 'N/A'
                  : sslDaysUntilExpiry > 0
                    ? `${sslDaysUntilExpiry} days left`
                    : 'Expired'}
              </span>
            </div>
          </div>
        </div>

        {latestLog?.timings && (
          <div className="p-4 border-t border-border text-xs text-muted-foreground">
            <h4 className="font-semibold mb-2 text-card-foreground">Response Breakdown</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex justify-between"><span>DNS</span> <span>{latestLog.timings.dns.toFixed(0)}ms</span></div>
                <div className="flex justify-between"><span>TCP</span> <span>{latestLog.timings.tcp.toFixed(0)}ms</span></div>
                <div className="flex justify-between"><span>TLS</span> <span>{latestLog.timings.tls.toFixed(0)}ms</span></div>
                <div className="flex justify-between"><span>First Byte</span> <span>{latestLog.timings.firstByte.toFixed(0)}ms</span></div>
                <div className="flex justify-between"><span>Content</span> <span>{latestLog.timings.contentTransfer.toFixed(0)}ms</span></div>
                <div className="flex justify-between font-bold"><span>Total</span> <span>{latestLog.timings.total.toFixed(0)}ms</span></div>
            </div>
          </div>
        )}
      </Link>
    </div>
  );
};

export default ServiceCard;
