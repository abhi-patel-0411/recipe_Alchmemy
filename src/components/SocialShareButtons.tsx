
import { useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon
} from 'react-share';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, Share, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  recipeId?: string;
}

const SocialShareButtons = ({ url, title, description, recipeId }: SocialShareButtonsProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const { user, isAuthenticated } = useAuth();
  
  const shareUrl = window.location.origin + url;
  const shareTitle = `Check out this recipe: ${title}`;
  const shareMessage = description 
    ? `${shareTitle}\n\n${description}\n\n${shareUrl}`
    : shareTitle;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard!');
  };

  const shareWithUser = async () => {
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to share recipes');
      return;
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Get stored users to check if recipient exists
    const storedUsers = localStorage.getItem('demo_users');
    if (!storedUsers) {
      toast.error('User not found');
      return;
    }

    const users = JSON.parse(storedUsers);
    const recipient = users.find((u: any) => u.email === recipientEmail);
    
    if (!recipient) {
      toast.error('User not found');
      return;
    }

    // Check if the recipe exists
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const recipeToShare = recipes.find((r: any) => r.id === recipeId);

    if (!recipeToShare) {
      toast.error('Recipe not found');
      return;
    }

    // Create a notification for the recipient
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: recipient.id,
      type: 'recipe_share',
      message: `${user.name} shared a recipe with you: ${recipeToShare.title}`,
      recipeId: recipeId,
      fromUserId: user.id,
      read: false,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    toast.success(`Recipe shared with ${recipient.name}`);
    setShareDialogOpen(false);
    setRecipientEmail('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FacebookShareButton url={shareUrl} hashtag="#recipedream">
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <TwitterShareButton url={shareUrl} title={shareTitle}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>

      <WhatsappShareButton url={shareUrl} title={shareTitle}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>

      <EmailShareButton url={shareUrl} subject={shareTitle} body={shareMessage}>
        <EmailIcon size={32} round />
      </EmailShareButton>

      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
        title="Copy link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="Share with a Recipe Dream user">
            <Share className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share with a Recipe Dream User</DialogTitle>
            <DialogDescription>
              Enter the email address of the user you want to share this recipe with
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="recipient-email" className="text-sm font-medium">
                Recipient Email
              </label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="user@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            <Button 
              onClick={shareWithUser}
              className="w-full"
              disabled={!isAuthenticated || !recipientEmail}
            >
              Share Recipe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialShareButtons;
