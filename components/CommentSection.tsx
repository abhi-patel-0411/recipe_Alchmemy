
import { useState } from "react";
import { Comment, User } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface CommentSectionProps {
  comments: Comment[];
  recipeId: string;
}

const CommentSection = ({ comments, recipeId }: CommentSectionProps) => {
  const { isAuthenticated, user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Please log in to comment");
      return;
    }
    
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    // Mock API call to submit comment
    setTimeout(() => {
      const newComment: Comment = {
        id: `temp-${Date.now()}`,
        content: commentText,
        userId: user?.id || "",
        author: user as User,
        recipeId: recipeId,
        createdAt: new Date().toISOString()
      };
      
      setLocalComments([...localComments, newComment]);
      setCommentText("");
      setIsSubmitting(false);
      toast.success("Comment added successfully");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {localComments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          localComments.map((comment) => (
            <div key={comment.id} className="flex space-x-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="flex-shrink-0">
                {comment.author.profileImageUrl ? (
                  <img
                    src={comment.author.profileImageUrl}
                    alt={comment.author.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{comment.author.name}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="flex flex-col space-y-4">
          {!isAuthenticated ? (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-center">
              <p className="mb-2">Please log in to leave a comment</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          ) : (
            <>
              <Textarea 
                placeholder="Add a comment..." 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !commentText.trim()}
                  className="bg-recipe-primary hover:bg-recipe-primary/90"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      Post Comment <Send className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
