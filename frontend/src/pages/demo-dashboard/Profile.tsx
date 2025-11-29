import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DemoProfile = () => {

  const dummyUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatarUrl: "https://github.com/shadcn.png",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details (Demo)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={dummyUser.avatarUrl} />
              <AvatarFallback>{dummyUser.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-2xl font-bold">{dummyUser.name}</p>
              <p className="text-muted-foreground">{dummyUser.email}</p>
            </div>
          </div>
          <Button disabled>Edit Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoProfile;
