import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/ui/navbar";

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email });
    toast.success("Profile updated successfully");
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Edit Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
