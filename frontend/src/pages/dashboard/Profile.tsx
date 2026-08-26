import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Shield } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-2xl font-bold">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/profile/edit")}>Edit Profile</Button>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Subscription & Billing
          </CardTitle>
          <CardDescription>Manage your plan and billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-semibold">Current Plan</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="capitalize">{user?.plan || 'free'}</Badge>
                {user?.subscriptionStatus === 'active' && <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Active</Badge>}
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/pricing">Change Plan</Link>
            </Button>
          </div>

          <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" /> Secure billing powered by Stripe
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
