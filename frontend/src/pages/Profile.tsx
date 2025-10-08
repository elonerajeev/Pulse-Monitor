import Navbar from "@/components/ui/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <Navbar isAuthenticated={true} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <Link to="/profile/edit">
            <Button>Edit Profile</Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline">Settings</Button>
          </Link>
          <Link to="/switch-profile">
            <Button variant="outline">Switch Profile</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
