import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreVertical, FileText, Edit, Trash, ExternalLink } from "lucide-react";
import { getInitialsFromName } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

interface ClientListProps {
  clients: Client[];
  isLoading: boolean;
  error: Error | null;
}

export default function ClientList({ clients, isLoading, error }: ClientListProps) {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: "Client deleted",
        description: "The client has been successfully deleted.",
      });
      
      setConfirmDialogOpen(false);
      setSelectedClient(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to delete client with confirmation
  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setConfirmDialogOpen(true);
  };

  // Function to handle client action confirmation
  const handleConfirmDelete = () => {
    if (!selectedClient) return;
    deleteClientMutation.mutate(selectedClient.id);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500">Error loading clients: {error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/clients"] })}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Render empty state
  if (!clients || clients.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg py-12 px-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
        <p className="text-gray-500 mb-6">Add your first client to get started</p>
        <Link href="/clients/create">
          <Button>Add Client</Button>
        </Link>
      </div>
    );
  }

  // Render client grid for mobile view
  const renderMobileView = () => (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {clients.map((client) => (
        <Card key={client.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary-100 text-primary-600">
                    {getInitialsFromName(client.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">{client.name}</h4>
                  <p className="text-sm text-gray-500">{client.company || "N/A"}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={`/clients/${client.id}`}>
                      <div className="flex items-center w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={`/invoices/create?clientId=${client.id}`}>
                      <div className="flex items-center w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>New Invoice</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClient(client)}>
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm">
                <span className="text-gray-500">Email: </span>
                <a href={`mailto:${client.email}`} className="text-primary-600">{client.email}</a>
              </p>
              {client.phone && (
                <p className="text-sm">
                  <span className="text-gray-500">Phone: </span>
                  <span>{client.phone}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render client table for desktop view
  const renderDesktopView = () => (
    <div className="hidden md:block">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-primary-100 text-primary-600 text-xs">
                        {getInitialsFromName(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    {client.name}
                  </div>
                </TableCell>
                <TableCell>
                  <a href={`mailto:${client.email}`} className="text-primary-600 hover:underline">
                    {client.email}
                  </a>
                </TableCell>
                <TableCell>{client.phone || "—"}</TableCell>
                <TableCell>{client.company || "—"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={`/clients/${client.id}`}>
                          <div className="flex items-center w-full">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/invoices/create?clientId=${client.id}`}>
                          <div className="flex items-center w-full">
                            <FileText className="mr-2 h-4 w-4" />
                            <span>New Invoice</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <a 
                          href={`mailto:${client.email}`} 
                          className="flex items-center w-full"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>Email</span>
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteClient(client)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <>
      {renderMobileView()}
      {renderDesktopView()}

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedClient?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
