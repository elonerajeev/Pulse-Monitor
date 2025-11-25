import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { formatDistanceToNow } from 'date-fns';
import { Link } from "react-router-dom";

interface MonitoringLog {
  _id: string;
  status: 'online' | 'offline' | 'degraded';
  message: string;
  createdAt: string;
  monitor: {
    _id: string;
    name: string;
  };
}

const fetchRecentLogs = async (): Promise<MonitoringLog[]> => {
  const response = await api.get("/monitoring/logs/recent?limit=5");
  return response.data.data;
};

const RecentEvents = () => {
    const { data: logs, isLoading, isError } = useQuery<MonitoringLog[]>({
        queryKey: ["recentLogs"],
        queryFn: fetchRecentLogs,
        refetchInterval: 10000, // Refetch every 10 seconds
    });

    const getStatusVariant = (status: string): "success" | "destructive" | "warning" | "secondary" => {
        switch (status) {
            case 'online':
                return 'success';
            case 'offline':
                return 'destructive';
            case 'degraded':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    return (
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Events (Including Other Services Also)</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && <p className="text-muted-foreground">Loading recent events...</p>}
                {isError && <p className="text-destructive">Error loading events. Please try again later.</p>}
                {logs && logs.length > 0 ? (
                    <ul className="space-y-4">
                        {logs.map((log) => (
                            <li key={log._id} className="flex items-center justify-between space-x-4">
                                <div className="flex items-center min-w-0">
                                    <Badge variant={getStatusVariant(log.status)} className="mr-3 capitalize h-6 w-20 flex-shrink-0 justify-center">
                                        {log.status}
                                    </Badge>
                                    <p className="text-sm truncate">
                                        <Link to={`/monitoring/${log.monitor._id}`} className="font-semibold hover:underline">{log.monitor.name}</Link>
                                        <span className="text-muted-foreground hidden md:inline"> - {log.message}</span>
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground text-right flex-shrink-0">
                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !isLoading && <p className="text-muted-foreground text-center py-4">No recent events to display.</p>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentEvents;
