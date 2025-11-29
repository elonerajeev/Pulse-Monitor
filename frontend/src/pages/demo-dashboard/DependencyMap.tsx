import { useMemo, useState, useEffect } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// --- Types ---
interface MonitoringLog {
    _id: string;
    status: string;
    responseTime: number;
    createdAt: string;
    message: string;
}

interface MonitoringService {
    _id: string;
    name: string;
    logs: MonitoringLog[];
    dependencies?: string[];
}

// --- Dummy Data ---
const dummyServices: MonitoringService[] = [
    {
        _id: '1',
        name: 'Main Website',
        dependencies: ['2'],
        logs: Array.from({ length: 24 }, (_, i) => ({
            _id: `log_web_${i}`,
            status: Math.random() > 0.1 ? 'online' : 'offline',
            createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
            responseTime: 100 + Math.random() * 50,
            message: 'OK',
        })),
    },
    {
        _id: '2',
        name: 'API Server',
        dependencies: ['3'],
        logs: Array.from({ length: 24 }, (_, i) => ({
            _id: `log_api_${i}`,
            status: 'online',
            createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
            responseTime: 70 + Math.random() * 30,
            message: 'OK',
        })),
    },
    {
        _id: '3',
        name: 'Database Service',
        dependencies: [],
        logs: Array.from({ length: 24 }, (_, i) => ({
            _id: `log_db_${i}`,
            status: i < 3 ? 'offline' : 'online',
            createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
            responseTime: i < 3 ? 0 : 50 + Math.random() * 20,
            message: i < 3 ? 'Connection Timeout' : 'OK',
        })),
    },
];

// --- Helper Functions ---
const getStatusColor = (status: string) => {
    switch (status) {
        case 'online': return '#22c55e'; // Green
        case 'degraded': return '#f97316'; // Orange
        case 'offline': return '#ef4444'; // Red
        default: return '#6b7280'; // Gray
    }
};

const CustomNode = ({ data }: { data: any }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
    >
        <Popover>
            <PopoverTrigger asChild>
                <div
                    style={{
                        background: getStatusColor(data.status),
                        padding: '10px 20px',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    }}
                >
                    {data.label}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{data.label}</h4>
                        <p className="text-sm text-muted-foreground">
                            Real-time service status and performance metrics.
                        </p>
                    </div>
                    <div className="grid gap-2 text-sm">
                        <div className="grid grid-cols-2 items-center gap-2">
                            <span className="font-semibold">Status:</span> 
                            <span style={{ color: getStatusColor(data.status), textTransform: 'capitalize'}}>{data.status}</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-2">
                            <span className="font-semibold">Avg. Response Time:</span> 
                            <span>{data.avgResponseTime}ms</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-2">
                            <span className="font-semibold">Uptime (24h):</span> 
                            <span>{data.uptimePercentage.toFixed(2)}%</span>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-2">
                            <span className="font-semibold">Incidents (24h):</span> 
                            <span>{data.totalIncidents}</span>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    </motion.div>
);

const nodeTypes = { custom: CustomNode };

// --- DependencyMap Page ---
const DemoDependencyMap = () => {
    const [services] = useState<MonitoringService[]>(dummyServices);
    const [loading] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [countdown] = useState(30);

    const toggleAutoRefresh = () => {
        setAutoRefresh(prev => !prev);
    };

    const processedData = useMemo(() => {
        return services.map(service => {
            const sortedLogs = [...service.logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const latestLog = sortedLogs[0];
            const status = latestLog?.status || 'unknown';
            
            const avgResponseTime = service.logs.length > 0 ? Math.round(service.logs.reduce((acc, log) => acc + log.responseTime, 0) / service.logs.length) : 0;
            const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
            const recentLogs = service.logs.filter(log => new Date(log.createdAt).getTime() > twentyFourHoursAgo);
            const onlineLogs = recentLogs.filter(log => log.status === 'online');
            const uptimePercentage = recentLogs.length > 0 ? (onlineLogs.length / recentLogs.length) * 100 : 100;
            const totalIncidents = recentLogs.filter(log => log.status !== 'online').length;

            return {
                id: service._id,
                label: service.name,
                status,
                avgResponseTime,
                uptimePercentage,
                totalIncidents,
                dependencies: service.dependencies || [],
            };
        });
    }, [services]);

    useEffect(() => {
        if (processedData.length > 0) {
            const nodeUpdates = processedData.map(service => ({
                id: service.id,
                data: service,
            }));

            setNodes(currentNodes => {
                if (currentNodes.length === 0) {
                    return processedData.map((service, index) => ({
                        id: service.id,
                        type: 'custom',
                        data: service,
                        position: { x: (index % 5) * 200, y: Math.floor(index / 5) * 150 },
                        sourcePosition: Position.Right,
                        targetPosition: Position.Left,
                    }));
                }
                return currentNodes.map(node => {
                    const update = nodeUpdates.find(n => n.id === node.id);
                    return update ? { ...node, data: { ...node.data, ...update.data } } : node;
                });
            });

            const initialEdges = processedData.flatMap(service =>
                service.dependencies.map(depId => ({
                    id: `${service.id}-${depId}`,
                    source: service.id,
                    target: depId,
                    animated: true,
                    style: { stroke: '#9ca3af' },
                }))
            );
            setEdges(initialEdges);
        }
    }, [processedData, setNodes, setEdges]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dependency Map (Demo)</h1>
                <div className="flex items-center space-x-4">
                    <Button variant="outline" disabled>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={toggleAutoRefresh}>
                        {autoRefresh ? `Auto Refresh: ${countdown}s` : 'Enable Auto Refresh'}
                    </Button>
                </div>
            </div>
            <Card className="h-[600px] w-full">
                <CardContent className="h-full p-0">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Controls />
                        <MiniMap />
                        <Background gap={12} size={1} />
                    </ReactFlow>
                </CardContent>
            </Card>
        </div>
    );
};

export default DemoDependencyMap;
