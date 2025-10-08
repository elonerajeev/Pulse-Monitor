import Navbar from "@/components/ui/navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const EditProfile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);

  const handleUpdate = () => {
    const updatedUser = { ...user, name, email };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // You might want to show a toast notification here to indicate that the profile has been updated.
  };

  return (
    <div>
      <Navbar isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Edit Profile</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="name">Name</label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button onClick={handleUpdate}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
