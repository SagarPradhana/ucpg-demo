import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Crown,
  CreditCard,
  Building2,
  BarChart3,
  User,
} from "lucide-react";
import { useForm, UseFormReturn } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createUserRole,
  getAllPermissions,
  getUserRole,
  updateUserRoles,
} from "@/service/adminservices";
import { toast } from "../ui/use-toast";
import { epochToCustomLocalStringTime } from "@/Common";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role:
    | "super-admin"
    | "transaction-admin"
    | "provider-admin"
    | "statistics-admin";
  lastLogin: string;
  isActive: boolean;
  permissions: string[];
}

interface CreateUserFormData {
  fullName: string;
  email: string;
  password: string;
  role: string;
}
interface CreateUserWithPermissionsFormData extends CreateUserFormData {
  permissions: string[];
}
interface AdminUserRolesProps {}

const AdminUserRoles: React.FC<AdminUserRolesProps> = ({}) => {
  const createUserSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(
      [
        "super-admin",
        "transaction-admin",
        "provider-admin",
        "statistics-admin",
        "user",
      ],
      {
        required_error: "Please select a role",
      }
    ),
  });

  type CreateUserFormData = z.infer<typeof createUserSchema>;

  const { data: getRoleUserResponse, refetch } = useQuery({
    queryKey: ["userRole"],
    queryFn: () => getUserRole(),
    gcTime: 60000,
    staleTime: 60000,
  });

  const { data: getAllPermissionResponse } = useQuery({
    queryKey: ["allPermissions"],
    queryFn: () => getAllPermissions(),
    gcTime: 60000,
    staleTime: 60000,
  });
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const createUserForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "super-admin",
    },
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  useEffect(() => {
    if (getRoleUserResponse) {
      const filterUserDetails = ((getRoleUserResponse as any)?.data ?? [])?.map(
        (user: any) => ({
          id: user?.id,
          name: user?.name,
          email: user?.email,
          role: user?.role,
          lastLogin: epochToCustomLocalStringTime(user?.last_login),
          isActive: user?.is_active,
          permissions: user?.permissions ?? [],
        })
      );
      setAdminUsers(filterUserDetails);
    }
  }, [getRoleUserResponse]);

  // Mutation for creating new user
  const createUserMutation = useMutation({
    mutationFn: isEdit ? updateUserRoles : createUserRole,
    onSuccess: (data: any) => {
      toast({
        title: isEdit
          ? "✅ User Updated Successfully"
          : "✅ User Created Successfully",
        description: data?.message,
      });

      // Reset form and close modal
      createUserForm.reset();
      setIsCreateUserModalOpen(false);
      refetch();
    },
    onError: (error: any) => {
      console.error("❌ Admin: Failed to create user:", error);

      // Handle specific error cases
      let errorMessage = "Failed to create user. Please try again.";

      if (error.message?.includes("email")) {
        errorMessage = "Email address is already in use.";
      } else if (error.message?.includes("password")) {
        errorMessage = "Password does not meet security requirements.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: isEdit ? "❌ Failed to Update User" : "❌ Failed to Create User",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Handle create user form submission
  const handleCreateUser = () => {
    const addpayload = {
      name: createUserForm.getValues()?.fullName,
      email: createUserForm.getValues()?.email,

      role: createUserForm.getValues()?.role,
    };

    const editPayload = {
      name: createUserForm.getValues()?.fullName,
      user_email: createUserForm.getValues()?.email,
      role: createUserForm.getValues()?.role,
      permissions: selectedPermissions ?? [],
    };

    createUserMutation.mutate(isEdit ? editPayload : addpayload);
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Roles and Permissions</CardTitle>
              <CardDescription>
                Manage admin users and their access levels
              </CardDescription>
            </div>
            <Dialog
              open={isCreateUserModalOpen}
              onOpenChange={setIsCreateUserModalOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[500px] p-0 flex flex-col max-h-[90vh] overflow-visible">
                {/* HEADER */}
                <div className="p-4 border-b">
                  <DialogHeader>
                    <DialogTitle>Create New Admin User</DialogTitle>
                    <DialogDescription>
                      Add a new admin user with specific role permissions.
                    </DialogDescription>
                  </DialogHeader>
                </div>

                {/* BODY - scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <Form {...createUserForm}>
                    <form id="create-user-form" className="space-y-5">
                      {/* Full Name */}
                      <FormField
                        control={createUserForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email */}
                      <FormField
                        control={createUserForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter email address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Role */}
                      <FormField
                        control={createUserForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="super_admin">
                                  <div className="flex items-center">
                                    <Crown className="h-4 w-4 mr-2 text-yellow-600" />
                                    Super Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="transaction_admin">
                                  <div className="flex items-center">
                                    <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                                    Transaction Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="provider_admin">
                                  <div className="flex items-center">
                                    <Building2 className="h-4 w-4 mr-2 text-green-600" />
                                    Provider Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="statistics_admin">
                                  <div className="flex items-center">
                                    <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                                    Statistics Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="user">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-gray-600" />
                                    User
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Permissions Accordion */}
                      {isEdit &&
                        createUserForm.getValues()?.role !== "user" && (
                          <div className="space-y-2">
                            <Accordion
                              type="single"
                              collapsible
                              className="border rounded-md"
                            >
                              <AccordionItem value="permissions">
                                <AccordionTrigger className="px-4">
                                  User Permissions
                                </AccordionTrigger>
                                <AccordionContent className="px-4 py-2 space-y-4">
                                  {(getAllPermissionResponse as any)?.data &&
                                    Object.entries(
                                      (
                                        getAllPermissionResponse as any
                                      )?.data.reduce((acc: any, p: any) => {
                                        const category =
                                          p.category || "General";
                                        (acc[category] =
                                          acc[category] || []).push(p);
                                        return acc;
                                      }, {})
                                    )?.map(
                                      ([category, permissions]: [
                                        string,
                                        any
                                      ]) => (
                                        <div
                                          key={category}
                                          className="space-y-2"
                                        >
                                          <h4 className="font-medium text-sm">
                                            {category}
                                          </h4>
                                          {permissions?.map(
                                            (permission: any) => (
                                              <div
                                                key={permission.code}
                                                className="flex items-center space-x-2"
                                              >
                                                <Checkbox
                                                  id={permission.code}
                                                  checked={selectedPermissions?.includes(
                                                    permission.code
                                                  )}
                                                  onCheckedChange={(checked) =>
                                                    checked
                                                      ? setSelectedPermissions(
                                                          (prev) => [
                                                            ...prev,
                                                            permission.code,
                                                          ]
                                                        )
                                                      : setSelectedPermissions(
                                                          (prev) =>
                                                            prev.filter(
                                                              (p) =>
                                                                p !==
                                                                permission.code
                                                            )
                                                        )
                                                  }
                                                />
                                                <Label
                                                  htmlFor={permission.code}
                                                  className="text-sm"
                                                >
                                                  {permission.label}
                                                </Label>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )
                                    )}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        )}
                    </form>
                  </Form>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t flex justify-end space-x-2 bg-white">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      createUserForm.reset();
                      setIsCreateUserModalOpen(false);
                      setSelectedPermissions([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    form="create-user-form"
                    onClick={handleCreateUser}
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending
                      ? isEdit
                        ? "Updating..."
                        : "Creating..."
                      : isEdit
                      ? "Update User"
                      : "Create User"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsEdit(true);
                          createUserForm.reset({
                            fullName: user.name,
                            email: user.email,
                            role: user.role,
                          });
                          setSelectedPermissions(user.permissions);
                          setIsCreateUserModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserRoles;
