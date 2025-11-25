import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface MonitoringService {
    _id: string;
    name: string;
    target: string;
    serviceType: string;
    interval: number;
    location?: string;
}

interface EditServiceModalProps {
    service: MonitoringService;
    onUpdate: (service: MonitoringService) => void;
    onCancel: () => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({ service, onUpdate, onCancel }) => {
    const [name, setName] = useState(service.name);
    const [target, setTarget] = useState(service.target);
    const [serviceType, setServiceType] = useState(service.serviceType);
    const [interval, setInterval] = useState(service.interval);
    const [location, setLocation] = useState(service.location || 'us-east');

    useEffect(() => {
        setName(service.name);
        setTarget(service.target);
        setServiceType(service.serviceType);
        setInterval(service.interval);
        setLocation(service.location || 'us-east');
    }, [service]);

    const handleUpdate = () => {
        onUpdate({ ...service, name, target, serviceType, interval, location });
    };

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Monitoring Service</DialogTitle>
                    <DialogDescription>Update the details of your monitoring service.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Service Name" />
                    <Input id="target" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="URL or IP Address" />
                    <Select value={serviceType} onValueChange={setServiceType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Service Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="server">Server/Port</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                            <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="us-east">US East</SelectItem>
                            <SelectItem value="us-west">US West</SelectItem>
                            <SelectItem value="eu-west">EU West</SelectItem>
                            <SelectItem value="eu-central">EU Central</SelectItem>
                            <SelectItem value="ap-south">AP South</SelectItem>
                            <SelectItem value="ap-southeast">AP Southeast</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input id="interval" type="number" value={interval} onChange={(e) => setInterval(Number(e.target.value))} placeholder="Interval (minutes)" />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleUpdate}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditServiceModal;