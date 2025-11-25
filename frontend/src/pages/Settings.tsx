import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import api from "@/utils/api";

const Settings = () => {
  const { isAuthenticated } = useAuth();
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  const handlePruneLogs = async () => {
    try {
      const response = await api.post("/monitoring/prune-logs");
      toast.success(`Successfully pruned ${response.data.data.deletedCount} old logs.`);
    } catch (error) {
      toast.error("Failed to prune old logs.");
    }
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold">Notifications</h2>
            <div className="flex items-center space-x-2 mt-4">
              <Switch id="email-notifications" />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Theme</h2>
            <RadioGroup defaultValue="light" className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Data Management</h2>
            <div className="flex items-center space-x-2 mt-4">
              <Button onClick={handlePruneLogs} variant="destructive">
                Prune Old Logs
              </Button>
              <p className="text-sm text-muted-foreground">
                Delete old logs to save space and improve performance.
              </p>
            </div>
          </div>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
