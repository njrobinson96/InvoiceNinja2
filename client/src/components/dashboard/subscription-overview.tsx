import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";

interface SubscriptionOverviewProps {
  plan: string;
}

export default function SubscriptionOverview({ plan }: SubscriptionOverviewProps) {
  const getPlanName = () => {
    switch (plan) {
      case 'professional':
        return 'Professional Plan';
      case 'enterprise':
        return 'Enterprise Plan';
      default:
        return 'Free Plan';
    }
  };
  
  const getRenewalDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Features based on plan
  const features = {
    free: [
      'Up to 5 clients',
      'Basic invoice templates',
      'Manual payment tracking',
      'Limited to 10 invoices per month'
    ],
    professional: [
      'Unlimited clients',
      'Customizable invoice templates',
      'Recurring invoices',
      'Online payments (1.5% fee)'
    ],
    enterprise: [
      'All Professional features',
      'Multiple users',
      'Priority support',
      'Online payments (1% fee)',
      'Custom branding'
    ]
  };

  const currentFeatures = features[plan as keyof typeof features] || features.free;
  const upgradeText = plan === 'free' ? 'Upgrade to Professional' : 
                     plan === 'professional' ? 'Upgrade to Enterprise' : 
                     'Contact Sales';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Your Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <Crown className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">{getPlanName()}</h4>
              <p className="text-xs text-gray-500">Monthly billing - Renews on {getRenewalDate()}</p>
            </div>
          </div>
          
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h5 className="text-sm font-medium text-gray-900">Plan Features</h5>
            <ul className="mt-2 space-y-2">
              {currentFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                  <span className="text-sm text-gray-500">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {plan !== 'enterprise' && (
            <div className="mt-5">
              <Button variant="default" className="w-full">
                {upgradeText}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
