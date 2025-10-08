import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";

const SwitchProfile = () => {
  return (
    <div>
      <Navbar isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Switch Profile</h1>
        <div className="space-y-4">
          <p>You are currently logged in as John Doe.</p>
          <Button>Switch to Jane Doe</Button>
        </div>
      </div>
    </div>
  );
};

export default SwitchProfile;
