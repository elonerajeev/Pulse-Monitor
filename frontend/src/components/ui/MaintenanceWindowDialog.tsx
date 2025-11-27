import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MaintenanceWindowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  onSchedule: (data: {
    serviceId: string;
    startTime: string;
    endTime: string;
    reason: string;
  }) => void;
}

const MaintenanceWindowDialog: React.FC<MaintenanceWindowDialogProps> = ({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  onSchedule,
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

  // Reset form fields when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStartTime('');
      setEndTime('');
      setReason('');
    }
  }, [isOpen]);

  const handleSchedule = () => {
    if (!startTime || !endTime || !reason) {
      // Basic validation
      alert('Please fill in all fields.');
      return;
    }
    onSchedule({ serviceId, startTime, endTime, reason });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance Window</DialogTitle>
          <DialogDescription>
            Schedule a maintenance period for {serviceName}. Alerts will be
            suppressed during this time.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serviceName" className="text-right">
              Service
            </Label>
            <Input
              id="serviceName"
              value={serviceName}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3 resize-none"
              placeholder="Reason for maintenance (e.g., database upgrade, server migration)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceWindowDialog;