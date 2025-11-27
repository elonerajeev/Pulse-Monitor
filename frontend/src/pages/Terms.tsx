import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Card className="border-none shadow-lg rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Welcome to PulseMonitor! These terms and conditions outline the rules
                and regulations for the use of PulseMonitor's Website, located at
                pulsemonitor.com.
              </p>
              <p>
                By accessing this website we assume you accept these terms and
                conditions. Do not continue to use PulseMonitor if you do not agree
                to take all of the terms and conditions stated on this page.
              </p>
              <h3 className="font-bold text-lg">Cookies</h3>
              <p>
                We employ the use of cookies. By accessing PulseMonitor, you agreed
                to use cookies in agreement with the PulseMonitor's Privacy Policy.
              </p>
              <h3 className="font-bold text-lg">License</h3>
              <p>
                Unless otherwise stated, PulseMonitor and/or its licensors own the
                intellectual property rights for all material on PulseMonitor. All
                intellectual property rights are reserved. You may access this from
                PulseMonitor for your own personal use subjected to restrictions set
                in these terms and conditions.
              </p>
              <p>You must not:</p>
              <ul className="list-disc list-inside pl-4">
                <li>Republish material from PulseMonitor</li>
                <li>Sell, rent or sub-license material from PulseMonitor</li>
                <li>Reproduce, duplicate or copy material from PulseMonitor</li>
                <li>Redistribute content from PulseMonitor</li>
              </ul>
              <div className="text-center pt-4">
                <Button asChild>
                  <Link to="/signup">Back to Signup</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;
