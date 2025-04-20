
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ProfileRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to user's profile
      navigate(`/profile/${user.id}`);
    } else {
      // If not authenticated, redirect to login with a message
      toast.error("Please log in to view your profile");
      navigate("/login", { state: { redirectTo: "/profile" } });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="animate-pulse text-lg">Redirecting to profile...</div>
    </div>
  );
};

export default ProfileRedirect;
