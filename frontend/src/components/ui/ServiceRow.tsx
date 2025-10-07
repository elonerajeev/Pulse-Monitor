import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreVertical, CheckCircle, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Button } from './button';
import { Badge } from './badge';
import { useNavigate } from 'react-router-dom';

interface MonitoringLog {
  _id: string;
  status: string;
  responseTime: number;
  createdAt: string;
}

interface ServiceRowProps {
  _id: string;
  name: string;
  status: string;
  target: string;
  logs: MonitoringLog[];
  onEdit: () => void;
  onDelete: () => void;
}

const ServiceRow: React.FC<ServiceRowProps> = ({ _id, name, status, target, logs = [], onEdit, onDelete }) => {
  const navigate = useNavigate();
  const isOnline = status === 'online';
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  const chartData = logs.map(log => ({
    time: new Date(log.createdAt).getTime(),
    responseTime: log.responseTime,
  }));

  const uptimePercentage = logs.length > 0 ? (logs.filter(l => l.status === 'online').length / logs.length) * 100 : 100;

  const handleRowClick = () => {
    navigate(`/monitoring/${_id}`);
  };

  return (
    <div className="grid grid-cols-12 items-center p-4 border-b border-border hover:bg-muted/40 transition-colors cursor-pointer" onClick={handleRowClick}>
      <div className="col-span-3 flex items-center">
        {isOnline ? (
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
        )}
        <div>
          <p className="font-semibold text-card-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{target}</p>
        </div>
      </div>

      <div className="col-span-3">
        <div className="h-10 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  fontSize: '12px',
                  padding: '4px 8px'
                }}
                labelFormatter={() => ''}
                formatter={(value: number) => [`${value.toFixed(0)}ms`, 'Response Time']}
              />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke={isOnline ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-2 text-center">
        <Badge variant={isOnline ? 'default' : 'destructive'}>{status}</Badge>
      </div>

      <div className="col-span-2 text-center">
        <p className="font-semibold">{uptimePercentage.toFixed(2)}%</p>
        <p className="text-xs text-muted-foreground">24h Uptime</p>
      </div>

      <div className="col-span-1 text-center">
        <p className="font-semibold">{latestLog?.responseTime.toFixed(0) || 'N/A'}ms</p>
        <p className="text-xs text-muted-foreground">Response</p>
      </div>

      <div className="col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-500">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ServiceRow;
