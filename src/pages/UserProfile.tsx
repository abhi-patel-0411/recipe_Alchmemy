
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { User, Recipe } from "@/types";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, Edit, Heart, Share2, Settings, Camera, Grid, BookmarkIcon, GridIcon, SaveIcon } from "lucide-react";
import { getRandomPlaceholderImage } from "@/lib/groq";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated, updateProfile } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recipes");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userStats, setUserStats] = useState({ followers: 0, following: 0 });
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  
  const isOwnProfile = isAuthenticated && currentUser?.id === userId;

  useEffect(() => {
    // Load demo users from localStorage
    const loadUserData = async () => {
      setIsLoading(true);
      
      try {
        // Try to get user from localStorage
        let foundUser: User | null = null;
        const storedUsers = localStorage.getItem("demo_users");
        
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const userMatch = users.find((u: any) => u.id === userId);
          if (userMatch) {
            const { password, ...userWithoutPassword } = userMatch;
            foundUser = userWithoutPassword as User;
          }
        }
        
        // If not found in localStorage and it's the current user, use that data
        if (!foundUser && isAuthenticated && currentUser && currentUser.id === userId) {
          foundUser = currentUser;
        }
        
        // If still not found, use mock data
        if (!foundUser) {
          foundUser = {
            id: userId || "1",
            name: "Food Enthusiast",
            email: "chef@example.com",
            profileImageUrl: `https://i.pravatar.cc/300?u=${userId || Math.random()}`,
            createdAt: new Date().toISOString()
          };
        }
        
        setUser(foundUser);
        setEditedUser({
          name: foundUser.name,
          email: foundUser.email,
          profileImageUrl: foundUser.profileImageUrl,
          bio: foundUser.bio || "Food lover and cooking enthusiast"
        });
        
        // Set user stats - try to get real stats if available
        const followers = localStorage.getItem(`${userId}_followers`) || Math.floor(Math.random() * 500).toString();
        const following = localStorage.getItem(`${userId}_following`) || Math.floor(Math.random() * 200).toString();
        
        setUserStats({
          followers: parseInt(followers),
          following: parseInt(following)
        });
        
        // Get user recipes from localStorage
        let userRecipes: Recipe[] = [];
        const storedRecipes = localStorage.getItem("recipes");
        
        if (storedRecipes) {
          const allRecipes = JSON.parse(storedRecipes);
          userRecipes = allRecipes.filter((recipe: Recipe) => recipe.userId === userId);
        }
        
        // If no stored recipes, use mock data
        if (userRecipes.length === 0) {
          userRecipes = Array(3).fill(0).map((_, i) => ({
            id: `${userId}-recipe-${i + 1}`,
            title: `Recipe ${i + 1}`,
            description: `This is a delicious recipe created by ${foundUser!.name}.`,
            imageUrl: getRandomPlaceholderImage(),
            prepTime: `${Math.floor(Math.random() * 20) + 5}`,
            cookTime: `${Math.floor(Math.random() * 40) + 10}`,
            servings: `${Math.floor(Math.random() * 6) + 1}`,
            difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)] as "Easy" | "Medium" | "Hard",
            ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
            instructions: ["Step 1", "Step 2", "Step 3"],
            tips: ["Tip 1", "Tip 2"],
            tags: ["tag1", "tag2", "tag3"].slice(0, Math.floor(Math.random() * 3) + 1),
            nutrition: {
              calories: `${Math.floor(Math.random() * 500) + 200}`,
              protein: `${Math.floor(Math.random() * 30) + 5}g`,
              carbs: `${Math.floor(Math.random() * 50) + 20}g`,
              fats: `${Math.floor(Math.random() * 30) + 5}g`
            },
            userId: userId || "1",
            author: foundUser,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: Math.floor(Math.random() * 50),
            comments: []
          }));
        }
        
        setRecipes(userRecipes);
        
        // Get liked recipes from localStorage or create mock ones
        const likedRecipeIds = localStorage.getItem(`${userId}_liked_recipes`);
        if (likedRecipeIds && storedRecipes) {
          const likedIds = JSON.parse(likedRecipeIds);
          const allRecipes = JSON.parse(storedRecipes);
          const userLikedRecipes = allRecipes.filter((recipe: Recipe) => 
            likedIds.includes(recipe.id)
          );
          
          // If we found some actual liked recipes, use them
          if (userLikedRecipes.length > 0) {
            setLikedRecipes(userLikedRecipes);
            setIsLoading(false);
            return;
          }
        }
        
        // If we don't have actual liked recipes, create mock ones
        const mockLikedRecipes: Recipe[] = Array(2).fill(0).map((_, i) => ({
          id: `liked-recipe-${i + 1}`,
          title: `Liked Recipe ${i + 1}`,
          description: `This is a recipe that ${foundUser!.name} liked.`,
          imageUrl: getRandomPlaceholderImage(),
          prepTime: `${Math.floor(Math.random() * 20) + 5}`,
          cookTime: `${Math.floor(Math.random() * 40) + 10}`,
          servings: `${Math.floor(Math.random() * 6) + 1}`,
          difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)] as "Easy" | "Medium" | "Hard",
          ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
          instructions: ["Step 1", "Step 2", "Step 3"],
          tips: ["Tip 1", "Tip 2"],
          tags: ["tag1", "tag2", "tag3"].slice(0, Math.floor(Math.random() * 3) + 1),
          nutrition: {
            calories: `${Math.floor(Math.random() * 500) + 200}`,
            protein: `${Math.floor(Math.random() * 30) + 5}g`,
            carbs: `${Math.floor(Math.random() * 50) + 20}g`,
            fats: `${Math.floor(Math.random() * 30) + 5}g`
          },
          userId: `other-user-${i + 1}`,
          author: {
            id: `other-user-${i + 1}`,
            name: `Other User ${i + 1}`,
            email: `other${i + 1}@example.com`,
            profileImageUrl: `https://i.pravatar.cc/150?u=other${i + 1}`,
            createdAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: Math.floor(Math.random() * 50),
          liked: true,
          comments: []
        }));
        
        setLikedRecipes(mockLikedRecipes);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setIsLoading(false);
      }
    };
    
    loadUserData();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [userId, isAuthenticated, currentUser]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user?.name}'s Recipe Profile`,
        text: `Check out ${user?.name}'s amazing recipes!`,
        url: window.location.href,
      }).then(() => {
        toast.success("Profile shared successfully!");
      }).catch((error) => {
        console.error("Error sharing:", error);
        toast.error("Failed to share profile");
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success("Profile link copied to clipboard!"))
        .catch(() => toast.error("Failed to copy link"));
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (isOwnProfile) {
        // If a new profile image was uploaded
        if (profileImagePreview) {
          editedUser.profileImageUrl = profileImagePreview;
        }
        
        if (updateProfile) {
          await updateProfile(editedUser);
          if (user) {
            setUser({...user, ...editedUser});
          }
          
          // Update in localStorage too
          try {
            const storedUsers = localStorage.getItem("demo_users");
            if (storedUsers) {
              const users = JSON.parse(storedUsers);
              const updatedUsers = users.map((u: any) => {
                if (u.id === userId) {
                  return {...u, ...editedUser};
                }
                return u;
              });
              localStorage.setItem("demo_users", JSON.stringify(updatedUsers));
            }
          } catch (error) {
            console.error("Error updating user in localStorage", error);
          }
          
          setEditDialogOpen(false);
          toast.success("Profile updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleFollowUser = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to follow users");
      return;
    }
    
    // Update stats
    setUserStats({
      ...userStats,
      followers: userStats.followers + 1
    });
    
    // In a real app, would send this to backend
    toast.success(`You are now following ${user?.name}`);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem(`${userId}_followers`, (userStats.followers + 1).toString());
    } catch (error) {
      console.error("Error saving follow status", error);
    }
  };

  const handleLikeRecipe = (recipeId: string) => {
    // Toggle recipe like state
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === recipeId ? {...recipe, liked: !recipe.liked, likes: recipe.liked ? recipe.likes - 1 : recipe.likes + 1} : recipe
    );
    setRecipes(updatedRecipes);
    
    // Update localStorage
    try {
      const storedRecipes = localStorage.getItem("recipes");
      if (storedRecipes) {
        const allRecipes = JSON.parse(storedRecipes);
        const updatedAllRecipes = allRecipes.map((recipe: Recipe) => 
          recipe.id === recipeId ? {...recipe, liked: !recipe.liked, likes: recipe.liked ? recipe.likes - 1 : recipe.likes + 1} : recipe
        );
        localStorage.setItem("recipes", JSON.stringify(updatedAllRecipes));
      }
      toast.success("Recipe like status updated!");
      
      // Update liked recipes list in localStorage
      const likedRecipeIds = localStorage.getItem(`${userId}_liked_recipes`) || "[]";
      const likedIds = JSON.parse(likedRecipeIds);
      
      // Find if recipe is liked or not after the update
      const updatedRecipe = updatedRecipes.find(recipe => recipe.id === recipeId);
      
      if (updatedRecipe?.liked) {
        if (!likedIds.includes(recipeId)) {
          likedIds.push(recipeId);
        }
      } else {
        const index = likedIds.indexOf(recipeId);
        if (index > -1) {
          likedIds.splice(index, 1);
        }
      }
      
      localStorage.setItem(`${userId}_liked_recipes`, JSON.stringify(likedIds));
    } catch (error) {
      console.error("Error updating recipe like status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container px-4 mx-auto py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse-gentle">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container px-4 mx-auto py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">User not found</h2>
            <Button asChild>
              <Link to="/explore">Browse Recipes</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          {/* Instagram-style Profile Header */}
          <div className="flex flex-col items-center" data-aos="fade-up">
            <div className="relative mb-6">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
                <img 
                  src={user.profileImageUrl} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              {isOwnProfile && (
                <Button 
                  size="icon" 
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="text-center mb-6">
              <h1 className="text-3xl font-display font-bold">{user.name}</h1>
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 mt-2">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
                <Calendar size={16} />
                <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              
              {user.bio && (
                <p className="mt-3 text-gray-700 dark:text-gray-300 max-w-md mx-auto">
                  {user.bio}
                </p>
              )}
            </div>
            
            {/* Instagram-style Stats */}
            <div className="flex justify-center items-center gap-10 mb-6">
              <div className="text-center">
                <div className="font-bold text-xl">{recipes.length}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Recipes</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">{userStats.followers}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl">{userStats.following}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Following</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                    Edit Profile
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="default" onClick={handleFollowUser}>
                    Follow
                  </Button>
                  <Button variant="outline" onClick={handleShareProfile}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="container px-4 mx-auto py-8">
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <TabsList className="flex h-12 items-center bg-transparent p-0 justify-start space-x-8">
              <TabsTrigger 
                value="recipes" 
                className="relative py-3 px-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-recipe-primary border-b-2 border-transparent data-[state=active]:border-recipe-primary rounded-none"
              >
                <GridIcon className="h-4 w-4 mr-2" />
                {isOwnProfile ? "My Recipes" : "Recipes"} ({recipes.length})
              </TabsTrigger>
              <TabsTrigger 
                value="liked" 
                className="relative py-3 px-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-recipe-primary border-b-2 border-transparent data-[state=active]:border-recipe-primary rounded-none"
              >
                <Heart className="h-4 w-4 mr-2" />
                Liked Recipes ({likedRecipes.length})
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="relative py-3 px-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-recipe-primary border-b-2 border-transparent data-[state=active]:border-recipe-primary rounded-none"
              >
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Saved Recipes
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={layout === "grid" ? "secondary" : "ghost"} 
                size="icon" 
                onClick={() => setLayout("grid")}
              >
                <GridIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant={layout === "list" ? "secondary" : "ghost"} 
                size="icon"
                onClick={() => setLayout("list")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="recipes" className="pt-8">
            {recipes.length > 0 ? (
              <div className={layout === "grid" ? 
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" :
                "space-y-6"
              }>
                {recipes.map((recipe, index) => (
                  <div key={recipe.id} data-aos="fade-up" data-aos-delay={index * 50}>
                    <RecipeCard recipe={recipe} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">No recipes yet</h3>
                {isOwnProfile ? (
                  <>
                    <p className="text-gray-500 mb-4">Create your first recipe to get started</p>
                    <Button asChild>
                      <Link to="/create">Create Recipe</Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-500">This user hasn't created any recipes yet</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="pt-8">
            {likedRecipes.length > 0 ? (
              <div className={layout === "grid" ? 
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" :
                "space-y-6"
              }>
                {likedRecipes.map((recipe, index) => (
                  <div key={recipe.id} data-aos="fade-up" data-aos-delay={index * 50}>
                    <RecipeCard recipe={recipe} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">No liked recipes yet</h3>
                {isOwnProfile ? (
                  <>
                    <p className="text-gray-500 mb-4">Browse recipes and like the ones you enjoy</p>
                    <Button asChild>
                      <Link to="/explore">Explore Recipes</Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-500">This user hasn't liked any recipes yet</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="pt-8">
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
              <h3 className="text-xl font-semibold mb-2">Saved Recipes</h3>
              <p className="text-gray-500 mb-4">Bookmark recipes to save them for later</p>
              <Button asChild>
                <Link to="/explore">Explore Recipes</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      {isOwnProfile && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img 
                    src={profileImagePreview || editedUser.profileImageUrl || user.profileImageUrl} 
                    alt={user.name} 
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                  <div className="absolute bottom-0 right-0 flex">
                    <label htmlFor="profile-image-upload" className="cursor-pointer">
                      <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-600">
                        <Camera className="h-4 w-4" />
                      </div>
                      <input 
                        id="profile-image-upload" 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={editedUser.name || ""}
                  onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                  placeholder="Your name"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={editedUser.bio || ""}
                  onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                  placeholder="Tell people about yourself..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={editedUser.email || ""}
                  onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-medium">
                  Website
                </label>
                <Input
                  id="website"
                  value={editedUser.website || ""}
                  onChange={(e) => setEditedUser({...editedUser, website: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserProfile;
