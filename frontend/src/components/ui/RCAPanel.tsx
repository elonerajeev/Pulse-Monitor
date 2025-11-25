import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const RCAPanel = ({ isOpen, onClose, rcaData }) => {
  if (!rcaData) return null;

  const { incident, service, logsBefore, logsAfter } = rcaData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Root Cause Analysis</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div className="col-span-1 space-y-2">
            <h3 className="font-semibold">Incident Details</h3>
            <p><strong>Service:</strong> {service.name}</p>
            <p><strong>Status:</strong> <Badge variant={incident.status === 'online' ? 'success' : 'destructive'}>{incident.status}</Badge></p>
            <p><strong>Time:</strong> {new Date(incident.createdAt).toLocaleString()}</p>
            <p><strong>Reason:</strong> {incident.message}</p>
          </div>
          <div className="col-span-2">
            <h3 className="font-semibold mb-2">Event Timeline</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time (ms)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsBefore.map(log => (
                  <TableRow key={log._id}>
                    <TableCell>{new Date(log.createdAt).toLocaleTimeString()}</TableCell>
                    <TableCell><Badge variant={log.status === 'online' ? 'success' : 'destructive'}>{log.status}</Badge></TableCell>
                    <TableCell>{log.responseTime}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-red-100 dark:bg-red-900">
                  <TableCell>{new Date(incident.createdAt).toLocaleTimeString()}</TableCell>
                  <TableCell><Badge variant='destructive'>{incident.status}</Badge></TableCell>
                  <TableCell>{incident.responseTime}</TableCell>
                </TableRow>
                {logsAfter.map(log => (
                  <TableRow key={log._id}>
                    <TableCell>{new Date(log.createdAt).toLocaleTimeString()}</TableCell>
                    <TableCell><Badge variant={log.status === 'online' ? 'success' : 'destructive'}>{log.status}</Badge></TableCell>
                    <TableCell>{log.responseTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RCAPanel;
