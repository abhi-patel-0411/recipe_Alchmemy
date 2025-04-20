
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recipe from "./pages/Recipe";
import Explore from "./pages/Explore";
import UserProfile from "./pages/UserProfile";
import CreateRecipe from "./pages/CreateRecipe";
import ProfileRedirect from "./pages/ProfileRedirect";
import MyRecipes from "./pages/MyRecipes";
import Settings from "./pages/Settings";
import GenerateRecipe from "./pages/GenerateRecipe";

// Initialize AOS
import AOS from "aos";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out"
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipe/:id" element={<Recipe />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/search" element={<Navigate to="/explore" replace />} />
        <Route path="/search/:query" element={<Navigate to="/explore" replace />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/profile" element={<ProfileRedirect />} />
        <Route path="/create" element={<CreateRecipe />} />
        <Route path="/generate" element={<GenerateRecipe />} />
        <Route path="/my-recipes" element={<MyRecipes />} />
        <Route path="/settings" element={<Settings />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
