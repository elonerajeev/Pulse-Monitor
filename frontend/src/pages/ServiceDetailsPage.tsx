
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/ui/navbar';
import { useToast } from '@/hooks/use-toast';
import IncidentsTable from '@/components/dashboard/IncidentsTable';
import api from '@/utils/api';

interface MonitoringLog {
    _id: string;
    status: string;
    statusCode?: number;
    responseTime: number;
    createdAt: string;
    message: string;
}

interface MonitoringService {
    _id: string;
    name: string;
    target: string;
    serviceType: string;
    interval: number;
    location?: string;
    latestLog?: MonitoringLog & { monitor: { _id: string; name: string; } };
    logs: (MonitoringLog & { monitor?: { _id: string; name: string; } })[];
}

const fetchServices = async (): Promise<MonitoringService[]> => {
    const { data } = await api.get(`/monitoring`);
    return data.data;
};

const ServiceDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const { data: services, isLoading, error } = useQuery<MonitoringService[]>({
        queryKey: ['services'],
        queryFn: fetchServices,
    });

    const service = useMemo(() => services?.find(s => s._id === id), [services, id]);

    useEffect(() => {
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(authStatus);
        if (!authStatus) {
            toast({ title: 'Error', description: 'You must be logged in to view this page.', variant: 'destructive' });
            navigate('/login');
        }
    }, [navigate, toast]);

    const chartData = useMemo(() => {
        if (!service) return [];
        return service.logs.map(log => ({
            time: new Date(log.createdAt).toLocaleString(),
            'Response Time (ms)': log.responseTime,
            status: log.status,
        })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }, [service]);

    const uptimePercentage = useMemo(() => {
        if (!service || service.logs.length === 0) return 0;
        const onlineCount = service.logs.filter(l => l.status === 'online').length;
        return (onlineCount / service.logs.length) * 100;
    }, [service]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen"><p>Error loading service details.</p></div>;
    }

    if (!service) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="mb-4">Service not found.</p>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar isAuthenticated={isAuthenticated} />
            <div className="container mx-auto px-4 py-8">
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>

                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-bold">{service.name}</CardTitle>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${service.latestLog?.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {service.latestLog?.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        <p className="text-muted-foreground">{service.target}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><span className="font-semibold">Service Type:</span> {service.serviceType}</div>
                            <div><span className="font-semibold">Monitoring Interval:</span> {service.interval} seconds</div>
                            <div><span className="font-semibold">Location:</span> {service.location || 'N/A'}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="ms" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="Response Time (ms)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-4 text-muted-foreground">
                            Overall uptime (last 90 days): {uptimePercentage.toFixed(2)}%
                        </div>
                    </CardContent>
                </Card>

                <IncidentsTable logs={service.logs} showServiceColumn={false} />
            </div>
        </div>
    );
};

export default ServiceDetailsPage;
