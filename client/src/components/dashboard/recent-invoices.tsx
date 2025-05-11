import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  totalAmount: string | number;
  issueDate: string;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue";
}

interface RecentInvoicesProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export default function RecentInvoices({ invoices, isLoading = false }: RecentInvoicesProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mt-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Invoices</h2>
          <p className="mt-1 text-sm text-gray-500">
            A list of all recent invoices including client, amount, and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link href="/invoices">
            <Button>
              View All Invoices
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {isLoading ? (
                <div className="flex justify-center items-center py-12 bg-white">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : invoices && invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/invoices/${invoice.id}`}>
                            <a className="text-primary-600 hover:text-primary-900">
                              View
                            </a>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 px-6 text-center bg-white">
                  <p className="text-gray-500">No invoices found.</p>
                  <Link href="/invoices/create">
                    <Button className="mt-4" variant="outline">
                      Create your first invoice
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
