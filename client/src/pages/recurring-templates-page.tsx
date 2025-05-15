import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Calendar, MoreHorizontal, Edit, Trash2, Play, Pause } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileMenu from "@/components/layout/mobile-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const frequencyLabels: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 Weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  biannually: "Bi-Annually",
  annually: "Annually"
};

export default function RecurringTemplatesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<number | null>(null);
  const [generateTemplateId, setGenerateTemplateId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch recurring templates
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ["/api/recurring-templates"],
    queryFn: async () => {
      const res = await fetch("/api/recurring-templates");
      if (!res.ok) {
        throw new Error("Failed to fetch recurring templates");
      }
      return res.json();
    },
    enabled: !!user,
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const res = await apiRequest("DELETE", `/api/recurring-templates/${templateId}`);
      if (!res.ok) {
        throw new Error("Failed to delete template");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-templates"] });
      toast({
        title: "Template deleted",
        description: "The recurring template has been deleted successfully.",
      });
      setDeleteTemplateId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle template active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ templateId, active }: { templateId: number; active: boolean }) => {
      const res = await apiRequest("PATCH", `/api/recurring-templates/${templateId}/toggle`, { active });
      if (!res.ok) {
        throw new Error("Failed to update template status");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-templates"] });
      toast({
        title: "Template status updated",
        description: "The template status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate invoice from template
  const generateInvoiceMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const res = await apiRequest("POST", `/api/recurring-templates/${templateId}/generate`);
      if (!res.ok) {
        throw new Error("Failed to generate invoice");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice generated",
        description: "A new invoice has been created from the template.",
      });
      setGenerateTemplateId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header openMobileMenu={() => setIsMobileMenuOpen(true)} />
          <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Recurring Templates</h1>
                <Button disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header openMobileMenu={() => setIsMobileMenuOpen(true)} />
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Recurring Templates</h1>
              <Link href="/recurring-templates/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </Link>
            </div>

            {error ? (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-destructive mb-2">Error loading templates</p>
                    <p className="text-muted-foreground mb-4">
                      {error instanceof Error ? error.message : "An unexpected error occurred"}
                    </p>
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/recurring-templates"] })}>
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : templates?.length === 0 ? (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="text-center py-10">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No recurring templates</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Create your first recurring template to automate invoice generation on a schedule.
                    </p>
                    <Link href="/recurring-templates/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Template
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template: any) => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>
                            {frequencyLabels[template.frequency] || template.frequency}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-5 w-5" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setGenerateTemplateId(template.id)}>
                              <Play className="mr-2 h-4 w-4" />
                              Generate Invoice Now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActiveMutation.mutate({ 
                              templateId: template.id, 
                              active: !template.active 
                            })}>
                              {template.active ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <Link href={`/recurring-templates/${template.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteTemplateId(template.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Next invoice:</span>
                        <span className="text-sm font-medium">
                          {formatDate(template.nextGenerationDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={template.active ? "default" : "outline"}>
                          {template.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <Separator className="my-3" />
                      <Link href={`/recurring-templates/${template.id}`}>
                        <Button variant="ghost" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTemplateId !== null} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this recurring template and all its items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteTemplateId !== null) {
                  deleteMutation.mutate(deleteTemplateId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate Invoice Confirmation Dialog */}
      <AlertDialog open={generateTemplateId !== null} onOpenChange={(open) => !open && setGenerateTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Invoice Now?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new invoice from this template immediately. The next automatic generation will still occur on the scheduled date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (generateTemplateId !== null) {
                  generateInvoiceMutation.mutate(generateTemplateId);
                }
              }}
            >
              Generate Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}