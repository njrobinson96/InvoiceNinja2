import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Payment {
  id: number;
  clientName: string;
  totalAmount: string | number;
  dueDate: string;
  daysUntilDue: number;
  notes?: string;
}

interface UpcomingPaymentsProps {
  payments: Payment[];
}

export default function UpcomingPayments({ payments }: UpcomingPaymentsProps) {
  // Get client initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getDueText = (days: number) => {
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {payments && payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary-100 text-primary-600">
                        {getInitials(payment.clientName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">{payment.clientName}</h4>
                    <p className="text-xs text-gray-500">
                      {payment.notes || 'Invoice payment'} - {getDueText(payment.daysUntilDue)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(payment.totalAmount)}</p>
                  <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
                    Send reminder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No upcoming payments</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
