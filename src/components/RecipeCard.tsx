
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Recipe } from "@/types";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateRecipeImageURL } from "@/lib/groq";
import {
  FacebookShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
} from "react-share";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

const RecipeCard = ({ recipe, className = "" }: RecipeCardProps) => {
  const [liked, setLiked] = useState(recipe.liked || false);
  const [likes, setLikes] = useState(recipe.likes);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const navigate = useNavigate();
  
  // Ensure image exists, use fallback if not
  const [imageError, setImageError] = useState(false);
  const imageUrl = imageError ? generateRecipeImageURL(recipe.title) : recipe.imageUrl;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    
    // Update the recipe likes in localStorage
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const updatedRecipes = recipes.map((r: Recipe) => {
      if (r.id === recipe.id) {
        return { ...r, likes: liked ? r.likes - 1 : r.likes + 1, liked: !liked };
      }
      return r;
    });
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    
    toast.success(liked ? "Recipe unliked" : "Recipe liked!");
  };
  
  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  const shareUrl = `${window.location.origin}/recipe/${recipe.id}`;
  const shareTitle = `Check out this amazing recipe: ${recipe.title}`;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card 
      className={`recipe-card overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
      data-aos="fade-up"
      onClick={handleCardClick}
    >
      <div className="block">
        <div className="relative overflow-hidden aspect-video">
          <img
            src={imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-0 p-3 w-full">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                {recipe.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/80 text-gray-800">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="bg-white/80 text-gray-800">
                  {recipe.difficulty}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold line-clamp-1">{recipe.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {recipe.description}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <button onClick={handleLike} className="flex items-center">
                  <Heart
                    size={18}
                    className={`cursor-pointer ${
                      liked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm ml-1">{likes}</span>
                </button>
              </div>
              
              <div 
                className="flex items-center space-x-1 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/recipe/${recipe.id}#comments`);
                }}
              >
                <MessageSquare size={18} className="text-muted-foreground" />
                <span className="text-sm">{recipe.comments.length}</span>
              </div>
            </div>
            
            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
              <DialogTrigger asChild>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  <Share2 size={18} />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>Share this recipe</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col space-y-4 py-4">
                  <div className="flex justify-center space-x-4">
                    <FacebookShareButton url={shareUrl} title={shareTitle}>
                      <FacebookIcon size={40} round />
                    </FacebookShareButton>
                    <WhatsappShareButton url={shareUrl} title={shareTitle}>
                      <WhatsappIcon size={40} round />
                    </WhatsappShareButton>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>Prep: {recipe.prepTime}m</span>
              <span>•</span>
              <span>Cook: {recipe.cookTime}m</span>
            </div>
            <div className="flex items-center space-x-1">
              <img
                src={recipe.author.profileImageUrl}
                alt={recipe.author.name}
                className="w-5 h-5 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${recipe.author.id}`;
                }}
              />
              <span>{recipe.author.name}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default RecipeCard;
