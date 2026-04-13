import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, ShieldOff, Trash2, UserCheck, UserX } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  is_removed: boolean;
  created_at: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

const useAllProfiles = () =>
  useQuery({
    queryKey: ["admin_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as UserProfile[];
    },
  });

const useAllRoles = () =>
  useQuery({
    queryKey: ["admin_user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (error) throw error;
      return data as UserRole[];
    },
  });

const UsersTab = () => {
  const { data: profiles, isLoading } = useAllProfiles();
  const { data: roles } = useAllRoles();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<{
    type: "remove" | "restore" | "make_admin" | "remove_admin";
    userId: string;
    name: string;
  } | null>(null);

  const getRoles = (userId: string) =>
    (roles || []).filter((r) => r.user_id === userId).map((r) => r.role);

  const isUserAdmin = (userId: string) => getRoles(userId).includes("admin");

  const handleMakeAdmin = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("User promoted to admin!");
    queryClient.invalidateQueries({ queryKey: ["admin_user_roles"] });
  };

  const handleRemoveAdmin = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Admin role removed!");
    queryClient.invalidateQueries({ queryKey: ["admin_user_roles"] });
  };

  const handleRemoveUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_removed: true, removed_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Also remove admin role if they have one
    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");
    toast.success("User removed!");
    queryClient.invalidateQueries({ queryKey: ["admin_profiles"] });
    queryClient.invalidateQueries({ queryKey: ["admin_user_roles"] });
  };

  const handleRestoreUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_removed: false, removed_at: null })
      .eq("user_id", userId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("User restored!");
    queryClient.invalidateQueries({ queryKey: ["admin_profiles"] });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    const { type, userId } = confirmAction;
    switch (type) {
      case "make_admin":
        handleMakeAdmin(userId);
        break;
      case "remove_admin":
        handleRemoveAdmin(userId);
        break;
      case "remove":
        handleRemoveUser(userId);
        break;
      case "restore":
        handleRestoreUser(userId);
        break;
    }
    setConfirmAction(null);
  };

  const getActionMessage = () => {
    if (!confirmAction) return "";
    switch (confirmAction.type) {
      case "make_admin":
        return `Make "${confirmAction.name}" an admin? They will have full access to the admin panel.`;
      case "remove_admin":
        return `Remove admin role from "${confirmAction.name}"? They will lose admin panel access.`;
      case "remove":
        return `Remove "${confirmAction.name}"? They will see a removal message when trying to access the admin panel.`;
      case "restore":
        return `Restore "${confirmAction.name}"? They will be able to use the app again.`;
      default:
        return "";
    }
  };

  const activeUsers = (profiles || []).filter((p) => !p.is_removed);
  const removedUsers = (profiles || []).filter((p) => p.is_removed);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Active Users ({activeUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeUsers.length === 0 && (
              <p className="text-muted-foreground text-sm">No active users found.</p>
            )}
            {activeUsers.map((profile) => {
              const admin = isUserAdmin(profile.user_id);
              return (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {profile.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{profile.full_name || "No Name"}</p>
                    <div className="flex gap-1 mt-1">
                      {admin && (
                        <Badge variant="default" className="text-xs">Admin</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">User</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {admin ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({
                            type: "remove_admin",
                            userId: profile.user_id,
                            name: profile.full_name,
                          })
                        }
                        title="Remove Admin"
                      >
                        <ShieldOff className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({
                            type: "make_admin",
                            userId: profile.user_id,
                            name: profile.full_name,
                          })
                        }
                        title="Make Admin"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setConfirmAction({
                          type: "remove",
                          userId: profile.user_id,
                          name: profile.full_name,
                        })
                      }
                      title="Remove User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {removedUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <UserX className="h-5 w-5" /> Removed Users ({removedUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {removedUsers.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 p-3 border border-destructive/20 rounded-lg bg-destructive/5"
                >
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold text-sm">
                    {profile.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{profile.full_name || "No Name"}</p>
                    <Badge variant="destructive" className="text-xs mt-1">Removed</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConfirmAction({
                        type: "restore",
                        userId: profile.user_id,
                        name: profile.full_name,
                      })
                    }
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>{getActionMessage()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UsersTab;
