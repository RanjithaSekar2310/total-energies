import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/components/auth/auth-provider";
import {
  MessageSquare,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Users,
  Clock,
  Globe,
} from "lucide-react";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useTheme } from "@/components/theme/theme-provider";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: "Intelligent Conversations",
      description:
        "Advanced AI that understands context and provides meaningful responses",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant responses with our optimized AI infrastructure",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your conversations are secure and private by design",
    },
    {
      icon: Sparkles,
      title: "Multi-Modal",
      description:
        "Upload images, PDFs, and other files for enhanced conversations",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share and collaborate on conversations with your team",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Available worldwide with 99.9% uptime guarantee",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* <Logo size="md" /> */}
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
          <div className="flex items-center gap-4">
            {/* <LanguageSelector /> */}
            <ThemeToggle />
            {user ? (
              <Button
                onClick={() => navigate("/chat")}
                className="bg-primary hover:bg-primary/90"
              >
                Open Chat
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div
          className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="mb-[1.5rem] flex justify-center">
            {/* <Logo size="lg" /> */}
            <img
              src="public\lovable-uploads\newBot.png"
              alt="IntelliViz"
              className="w-[7rem] h-[7rem] "
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            The Future of
            <span className="bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent block">
              AI Conversation
            </span>
          </h1>

          <p className="text-[1.4rem]  text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the next generation of AI-powered conversations. Upload
            files, ask questions, and get intelligent responses that understand
            your needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              onClick={() => navigate(user ? "/chat" : "/auth")}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
            >
              {user ? "Continue Chatting" : "Start Chatting"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {theme === "light" ? (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6 h-auto border-[2px] border-[#dddedf] hover:bg-gray-100 transition-colors"
              >
                <Clock className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6 h-auto border-[2px] border-[#dddedf] hover:bg-black-100 transition-colors"
              >
                <Clock className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            )}
          </div>

          {/* Preview Animation */}
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-700/20 rounded-3xl blur-3xl"></div>
            <Card className="relative border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground ml-4">
                    IntelliViz Interface
                  </span>
                </div>
                <div className="text-left space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      AI
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-2xl p-4">
                        <p className="text-sm">
                          Hello! I'm IntelliViz, your intelligent AI assistant.
                          How can I help you today?
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 max-w-xs">
                      <div className="bg-primary text-primary-foreground rounded-2xl p-4">
                        <p className="text-sm">
                          Can you help me analyze this document?
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      AI
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-2xl p-4">
                        <div className="loading-dots h-4">
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose IntelliViz?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with cutting-edge technology to provide the best AI
            conversation experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-105 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-gradient-to-r from-primary to-purple-700 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-purple-700/5 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Conversations?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already experiencing the future of
              AI-powered communication
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col text-center">
            {/* <Logo size="sm" /> */}
            <img
              src="public\intelliVizFooter.svg"
              alt="IntelliViz logo"
              className="h-5 items-center justify-center"
            />
            <p className="text-muted-foreground mt-4 text-[12px]">
              © {new Date().getFullYear()} Intelliswift - An LTTS Company. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
