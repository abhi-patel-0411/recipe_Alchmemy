
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChefHat,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeProvider";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/explore" },
    { name: "Create", href: "/create", requiresAuth: true },
    { name: "My Recipes", href: "/my-recipes", requiresAuth: true },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b py-3">
      <div className="container px-4 mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <ChefHat className="h-6 w-6 text-recipe-primary mr-2" />
            {/* <img src="/public/lt.png" alt="Logo" className="h-6 w-6 mr-2 rounded-pill rounded rounded-circle" /> */}
            <span className="font-display font-bold text-xl gradient-text">
              Recipe Alchmemy
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <form onSubmit={handleSearch} className="relative mr-2">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search recipes..."
              className="pl-8 w-[200px] h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {navigation
            .filter(item => !item.requiresAuth || isAuthenticated)
            .map(item => (
              <Button
                key={item.name}
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link to={item.href}>{item.name}</Link>
              </Button>
            ))}
            
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <div className="flex items-center space-x-2">
                    <img
                      src={user?.profileImageUrl}
                      alt={user?.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="hidden lg:inline-block">{user?.name}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/create" className="cursor-pointer">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Recipe
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" className="bg-recipe-primary hover:bg-recipe-primary/90" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[62px] left-0 right-0 bg-background border-b shadow-lg p-4 flex flex-col space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search recipes..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <div className="space-y-2">
            {navigation
              .filter(item => !item.requiresAuth || isAuthenticated)
              .map(item => (
                <Button
                  key={item.name}
                  variant={location.pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                  asChild
                >
                  <Link to={item.href}>{item.name}</Link>
                </Button>
              ))}
          </div>
          
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? (
                <><Sun className="mr-2 h-4 w-4" /> Light mode</>
              ) : (
                <><Moon className="mr-2 h-4 w-4" /> Dark mode</>
              )}
            </Button>
            
            {isAuthenticated ? (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> 
                Logout
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
