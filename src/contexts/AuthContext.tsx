
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, AuthState } from "@/types";
import { toast } from "sonner";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Sample user data for demonstration
const DEMO_USERS = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    profileImageUrl: "https://i.pravatar.cc/150?u=john",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    profileImageUrl: "https://i.pravatar.cc/150?u=jane",
    createdAt: new Date().toISOString(),
  },
];

// Try to load demo users from localStorage
try {
  const storedUsers = localStorage.getItem("demo_users");
  if (!storedUsers) {
    localStorage.setItem("demo_users", JSON.stringify(DEMO_USERS));
  } else {
    // Use stored demo users
    const parsedUsers = JSON.parse(storedUsers);
    // Make sure we have at least the default users
    DEMO_USERS.forEach(defaultUser => {
      if (!parsedUsers.some((u: any) => u.id === defaultUser.id)) {
        parsedUsers.push(defaultUser);
      }
    });
    
    // Update demo users array with stored users
    while (DEMO_USERS.length > 0) DEMO_USERS.pop();
    parsedUsers.forEach((user: any) => DEMO_USERS.push(user));
  }
} catch (error) {
  console.error("Error initializing demo users:", error);
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("user");
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Get latest demo users from localStorage
      let currentUsers = DEMO_USERS;
      try {
        const storedUsers = localStorage.getItem("demo_users");
        if (storedUsers) {
          currentUsers = JSON.parse(storedUsers);
        }
      } catch (error) {
        console.error("Error reading demo users:", error);
      }

      // Find user with matching credentials
      const user = currentUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = user;
      
      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      
      setAuthState({
        user: userWithoutPassword as User,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Get latest demo users from localStorage
      let currentUsers = DEMO_USERS;
      try {
        const storedUsers = localStorage.getItem("demo_users");
        if (storedUsers) {
          currentUsers = JSON.parse(storedUsers);
        }
      } catch (error) {
        console.error("Error reading demo users:", error);
      }

      // Check if email already exists
      const emailExists = currentUsers.some((u) => u.email === email);
      if (emailExists) {
        throw new Error("Email already in use");
      }

      // Create new user
      const newUser = {
        id: `${Date.now()}`,
        name,
        email,
        password,
        profileImageUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
        createdAt: new Date().toISOString(),
      };

      // Add to demo users array
      currentUsers.push(newUser);
      
      // Update localStorage
      localStorage.setItem("demo_users", JSON.stringify(currentUsers));

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      
      setAuthState({
        user: userWithoutPassword as User,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success("Registration successful");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.success("Logged out successfully");
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!authState.user) {
        throw new Error("No user logged in");
      }

      // Update the user in localStorage
      const updatedUser = {
        ...authState.user,
        ...data,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setAuthState({
        ...authState,
        user: updatedUser,
      });

      // Update in demo users
      try {
        const storedUsers = localStorage.getItem("demo_users");
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const index = users.findIndex((u: any) => u.id === authState.user?.id);
          if (index !== -1) {
            users[index] = {
              ...users[index],
              ...data,
              password: users[index].password, // Keep the password
            };
            localStorage.setItem("demo_users", JSON.stringify(users));
          }
        }
      } catch (error) {
        console.error("Error updating demo users:", error);
      }
      
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile update failed");
      throw error;
    }
  };

  const value = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
