import { Clock, CheckCircle, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface FinancialMetricsProps {
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  totalClients: number;
}

export default function FinancialMetrics({
  pendingAmount,
  paidAmount,
  overdueAmount,
  totalClients
}: FinancialMetricsProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg leading-6 font-medium text-gray-900">Financial Overview</h2>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Payment Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(pendingAmount)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/invoices?status=pending" className="font-medium text-primary-600 hover:text-primary-900">
                View all
              </a>
            </div>
          </div>
        </Card>

        {/* Paid Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Paid this month</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(paidAmount)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/invoices?status=paid" className="font-medium text-primary-600 hover:text-primary-900">
                View all
              </a>
            </div>
          </div>
        </Card>

        {/* Overdue Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue Invoices</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(overdueAmount)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/invoices?status=overdue" className="font-medium text-primary-600 hover:text-primary-900">
                View all
              </a>
            </div>
          </div>
        </Card>

        {/* Total Clients Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{totalClients}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="/clients" className="font-medium text-primary-600 hover:text-primary-900">
                View all
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
