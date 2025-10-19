import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div>
      <Navbar isAuthenticated={true} />
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
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;