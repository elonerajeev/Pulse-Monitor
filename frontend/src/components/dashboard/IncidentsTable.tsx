
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MonitoringLog {
  _id: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  message: string;
  createdAt: string;
  monitor?: {
    _id: string;
    name: string;
  };
}

interface IncidentsTableProps {
  logs: MonitoringLog[];
  showServiceColumn?: boolean;
}

const IncidentsTable: React.FC<IncidentsTableProps> = ({ logs, showServiceColumn = true }) => {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'createdAt', order: 'desc' });
  const rowsPerPage = 10;

  const getStatusVariant = (status: string): "success" | "destructive" | "warning" | "secondary" => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'destructive';
      case 'degraded': return 'warning';
      default: return 'secondary';
    }
  };

  const filteredLogs = useMemo(() => {
    let sortedLogs = [...logs].sort((a, b) => {
      const valA = a[sort.key as keyof MonitoringLog] || '';
      const valB = b[sort.key as keyof MonitoringLog] || '';

      if (sort.order === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    if (filter !== 'all') {
      return sortedLogs.filter(log => log.status === filter);
    }
    return sortedLogs;
  }, [logs, sort, filter]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredLogs.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLogs, page, rowsPerPage]);

  const handleSort = (key: string) => {
    setSort(prev => ({
      key,
      order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Incidents</CardTitle>
        <Select onValueChange={setFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="degraded">Degraded</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                Status <ArrowUpDown className="w-4 h-4 inline" />
              </TableHead>
              {showServiceColumn && <TableHead>Service</TableHead>}
              <TableHead>Response Time (ms)</TableHead>
              <TableHead>Message</TableHead>
              <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">
                Timestamp <ArrowUpDown className="w-4 h-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
                </TableCell>
                {showServiceColumn && (
                  <TableCell>
                    {log.monitor ? (
                      <Link to={`/monitoring/${log.monitor._id}`} className="hover:underline">{log.monitor.name}</Link>
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                )}
                <TableCell>{log.responseTime}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{format(new Date(log.createdAt), 'Pp')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={paginatedLogs.length < rowsPerPage}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentsTable;
