import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        paid: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        overdue: "bg-red-100 text-red-800",
        draft: "bg-gray-100 text-gray-800",
        viewed: "bg-blue-100 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "draft",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: "draft" | "pending" | "viewed" | "paid" | "overdue";
}

export function StatusBadge({ 
  className, 
  status, 
  ...props 
}: StatusBadgeProps) {
  const variant = status as "draft" | "pending" | "viewed" | "paid" | "overdue";
  
  // Convert status to display text
  const statusText = {
    draft: "Draft",
    pending: "Pending",
    viewed: "Viewed",
    paid: "Paid",
    overdue: "Overdue",
  }[status];

  return (
    <div className={cn(statusBadgeVariants({ variant }), className)} {...props}>
      {statusText}
    </div>
  );
}
