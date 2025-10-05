import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

interface AddMonitoringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMonitoringDialog({
  open,
  onOpenChange,
}: AddMonitoringDialogProps) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [type, setType] = useState("website"); // Default value for the select
  const [interval, setInterval] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setTarget("");
    setType("website");
    setInterval(5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/monitoring/add",
        { name, target, type, interval },
        { withCredentials: true } // Important for sending cookies
      );
      toast.success("Monitoring service added successfully!");
      resetForm();
      onOpenChange(false); // Close the dialog on success
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to add service.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpenState: boolean) => {
    if (!newOpenState) {
      resetForm();
    }
    onOpenChange(newOpenState);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Monitoring Service</DialogTitle>
          <DialogDescription>
            Fill in the details below to start monitoring a new service.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Service Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target" className="text-right">
                Target
              </Label>
              <Input id="target" value={target} onChange={(e) => setTarget(e.target.value)} className="col-span-3" placeholder="https://example.com or 192.168.1.1" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website Monitoring</SelectItem>
                  <SelectItem value="server">Server Monitoring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interval" className="text-right">
                Interval (min)
              </Label>
              <Input id="interval" type="number" value={interval} onChange={(e) => setInterval(Number(e.target.value))} className="col-span-3" min="1" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Service"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}