import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Globe,
  Save,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme/theme-provider";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const { theme } = useTheme();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    bio: "AI enthusiast and technology professional",
    notifications: {
      email: true,
      push: false,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      chatHistory: true,
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }));
  };

  const handlePrivacyChange = (field: string, value: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [field]: value },
    }));
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile settings have been saved successfully",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description:
        "We'll send you an email with instructions to confirm account deletion",
      variant: "destructive",
    });
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/chat")}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {/*<Logo size="sm" />*/}
            {theme === "light" ? (
              <img
                src="public\intelliVizLogo.svg"
                className="w-[8rem] h-[3rem]"
              />
            ) : (
              <img
                src="public\lovable-uploads\intelliVizLogo_WhiteRed.svg"
                className="w-[8rem] h-[3rem]"
              />
            )}
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" onClick={() => navigate("/chat")}>
              Back to Chat
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-24 w-24 rounded-full"
                    />
                  ) : (
                    <User className="h-12 w-12" />
                  )}
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Change Avatar
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Member since
                      </span>
                      <span>January 2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Conversations
                      </span>
                      <span>127</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Files uploaded
                      </span>
                      <span>45</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profileData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your conversations
                    </p>
                  </div>
                  <Switch
                    checked={profileData.notifications.email}
                    onCheckedChange={(value) =>
                      handleNotificationChange("email", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new messages and updates
                    </p>
                  </div>
                  <Switch
                    checked={profileData.notifications.push}
                    onCheckedChange={(value) =>
                      handleNotificationChange("push", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and tips
                    </p>
                  </div>
                  <Switch
                    checked={profileData.notifications.marketing}
                    onCheckedChange={(value) =>
                      handleNotificationChange("marketing", value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <Switch
                    checked={profileData.privacy.profileVisible}
                    onCheckedChange={(value) =>
                      handlePrivacyChange("profileVisible", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Save Chat History</Label>
                    <p className="text-sm text-muted-foreground">
                      Keep your conversation history for future reference
                    </p>
                  </div>
                  <Switch
                    checked={profileData.privacy.chatHistory}
                    onCheckedChange={(value) =>
                      handlePrivacyChange("chatHistory", value)
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Globe className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
