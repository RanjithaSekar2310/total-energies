import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useAuth } from "@/components/auth/auth-provider";
import {
  MessageSquare,
  Send,
  Plus,
  History,
  Upload,
  Mic,
  MicOff,
  User,
  Settings,
  LogOut,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/components/theme/theme-provider";
import DOMPurify from "dompurify";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const welcomeMessage: Message = {
      id: "welcome",
      content:
        "Hello! I'm IntelliViz, your intelligent AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    const fetchChatHistory = async () => {
      try {
        const response = await fetch("http://localhost:8000/chat_history");
        const data = await response.json();

        const historyList: ChatHistory[] = await Promise.all(
          data.history.map(async (filename: string, index: number) => {
            // let firstLine = "Click here to load chat...";

            // // try {
            // //   const contentRes = await fetch(
            // //     "http://localhost:8000/chat_content",
            // //     {
            // //       method: "POST",
            // //       headers: { "Content-Type": "application/json" },
            // //       body: JSON.stringify({ filename }),
            // //     }
            // //   );
            // //   const contentData = await contentRes.json();
            // //   const firstNonEmptyLine = contentData.content
            // //     ?.split("\n")
            // //     .find((line: string) => line.trim() !== "");

            // //   if (firstNonEmptyLine) firstLine = firstNonEmptyLine.trim();
            // // } catch (err) {
            // //   console.warn(`Failed to fetch content for ${filename}`);
            // // }

            const parts = filename.split("_");
            const timestampStr = parts[1]?.split(".")[0];
            const parsedDate = timestampStr
              ? new Date(
                  parseInt(timestampStr.substring(0, 4)),
                  parseInt(timestampStr.substring(4, 6)) - 1,
                  parseInt(timestampStr.substring(6, 8)),
                  parseInt(timestampStr.substring(9, 11)),
                  parseInt(timestampStr.substring(11, 13)),
                  parseInt(timestampStr.substring(13, 15))
                )
              : new Date();

            return {
              id: filename,
              title: `Chat - ${filename}`,
              lastMessage: "Click here to load chat...",
              timestamp: parsedDate,
            };
          })
        );

        // Sort descending by timestamp (latest first)
        historyList.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        setChatHistory(historyList);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchChatHistory();
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    //fetching api response

    const aiResponse = await sendMessageToBot(userMessage.content);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      sender: "ai",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  // FAST API integration
  const sendMessageToBot = async (message: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/orch_agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      console.log("API Response:", data); // Debugging

      let botResponse: string;

      // Handle different response types
      if (typeof data.response === "object") {
        botResponse = Object.entries(data.response)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");
      } else {
        botResponse = String(data.response || "No answer found.");
      }

      const withLinks = botResponse.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
      );

      // Apply formatting and sanitize
      return DOMPurify.sanitize(formatBotResponse(withLinks), {
        ALLOWED_TAGS: ["a"],
        ALLOWED_ATTR: ["href", "target", "rel", "class"],
      });
      // if (data.response && typeof data.response === "object") {
      //   return Object.entries(data.response)
      //     .map(([key, value]) => `${key}: ${value}`)
      //     .join("\n");
      // }

      // Handle string responses
      // return data.response || "No answer found.";
    } catch (error) {
      console.error("Error sending message to bot:", error);
      return "Oops! Something went wrong. Please try again later.";
    }
  };
  //

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const attachment = {
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      };

      const userMessage: Message = {
        id: Date.now().toString(),
        content: `Uploaded: ${file.name}`,
        sender: "user",
        timestamp: new Date(),
        attachments: [attachment],
      };

      setMessages((prev) => [...prev, userMessage]);
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, you'd implement actual voice recording here
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    const welcomeMessage: Message = {
      id: "welcome-new",
      content:
        "Hello! I'm ready to help you with a new conversation. What would you like to discuss today?",
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  //   const loadChatHistory = async (chatId: string) => {
  //     setCurrentChatId(chatId);
  //     console.log(`Loading chat history for: ${chatId}`);

  //     try {
  //       const response = await fetch("http://localhost:8000/chat_content", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ filename: chatId }),
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch chat content.");
  //       }

  //       const data = await response.json();
  //       // **Answer (in English)**: ${responseData["**Answer (in English)**"] || ""}\n

  //       const formatResponse = (responseData: unknown) => {
  //         return `
  //  ${responseData["**Answer (in English)**"] || ""}\n
  // **Agents Used**: ${responseData["**Agents Used**"] || ""}\n
  // PDF_Agent: ${responseData["PDF_Agent"] || ""}
  // News_Agent: ${responseData["News_Agent"] || ""}
  // Twitter_Agent: ${responseData["Twitter_Agent"] || ""}\n\n
  // **Sources**: ${responseData["**Sources**"] || ""}
  // PDF: ${responseData["PDF"] || ""}
  //       `.trim();
  //       };

  //       const userMessageContent = data.response.User || "";
  //       const aiMessageContent = formatResponse(data.response);

  //       const parsedMessages: Message[] = [];

  //       if (userMessageContent) {
  //         parsedMessages.push({
  //           id: `${chatId}-user`,
  //           content: userMessageContent,
  //           sender: "user",
  //           timestamp: new Date(),
  //         });
  //       }
  //       if (aiMessageContent) {
  //         parsedMessages.push({
  //           id: `${chatId}-ai`,
  //           content: aiMessageContent,
  //           sender: "ai",
  //           timestamp: new Date(),
  //         });
  //       }
  //       setMessages(parsedMessages);
  //     } catch (error) {
  //       console.error("Error loading chat content:", error);
  //     }
  //   };

  const formatBotResponse = (content: string): string => {
    // Split the content by double asterisks to preserve bold sections
    const parts = content.split(/(\*\*.*?\*\*)/g);

    // Process each part to add line breaks where needed
    return parts
      .map((part) => {
        // Handle bold headings
        if (part.startsWith("**") && part.endsWith("**")) {
          return `\n${part}\n`;
        }

        //handle bullet points
        if (part.includes(" - ")) {
          return part.replace(/ - /g, "\n- ");
        }

        // Handle colon separators
        if (part.includes(": ")) {
          return part.replace(/: /g, ":\n");
        }

        return part;
      })
      .join("");
  };

  const loadChatHistory = async (chatId: string) => {
    setCurrentChatId(chatId);
    console.log(`Loading chat history for: ${chatId}`);
    try {
      const response = await fetch("http://localhost:8000/chat_content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: chatId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chat content.");
      }

      const data = await response.json();

      // Check if the response has chat_history array
      if (!data.chat_history || !Array.isArray(data.chat_history)) {
        throw new Error("Invalid chat history format.");
      }

      const parsedMessages: Message[] = [];

      // Process each message in the chat history

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.chat_history.forEach((entry: any, index: number) => {
        // Add user message
        if (entry.user && entry.user.trim() !== "") {
          parsedMessages.push({
            id: `${chatId}-user-${index}`,
            content: entry.user,
            sender: "user",
            timestamp: new Date(),
          });
        }

        // Add bot message
        if (entry.bot && entry.bot.trim() !== "") {
          parsedMessages.push({
            id: `${chatId}-bot-${index}`,
            content: formatBotResponse(entry.bot),
            sender: "ai",
            timestamp: new Date(),
          });
        }
      });
      console.log("parsedMessages", parsedMessages);
      setMessages(parsedMessages);
    } catch (error) {
      console.error("Error loading chat content:", error);
    }
  };
  const deleteChatHistory = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      startNewChat();
    }
    console.log(`Deleted chat: ${chatId}`);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          {/* <Logo size="sm" /> */}
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

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={startNewChat}
            className="w-full justify-start"
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 px-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-sidebar-foreground/70" />
            <span className="text-sm font-medium text-sidebar-foreground/70">
              Recent Chats
            </span>
          </div>

          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {chatHistory.slice(0, 9).map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative rounded-lg ${
                    currentChatId === chat.id ? "bg-sidebar-accent" : ""
                  }`}
                >
                  <Button
                    variant={currentChatId === chat.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left h-auto p-3 pr-8"
                    onClick={() => loadChatHistory(chat.id)}
                  >
                    <div className="truncate">
                      <div className="font-medium text-sm truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {chat.lastMessage}
                      </div>
                    </div>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={(e) => deleteChatHistory(chat.id, e)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium truncate">
                      {user?.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {currentChatId
                ? chatHistory.find((c) => c.id === currentChatId)?.title
                : "New Conversation"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* <LanguageSelector /> */}
            <ThemeToggle />
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "ai" && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[70%] ${
                    message.sender === "user" ? "order-1" : ""
                  }`}
                >
                  <Card
                    className={`p-4 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted/50"
                    }`}
                  >
                    {message.sender === "ai" ? (
                      <div
                        className="text-sm leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                    )}

                    {message.attachments && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-background/10 rounded"
                          >
                            {attachment.type.startsWith("image/") ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="text-xs">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                  <div className="text-xs text-muted-foreground mt-1 px-2">
                    {/* {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} */}
                  </div>
                </div>

                {message.sender === "user" && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <Card className="p-4 bg-muted/50">
                  <div className="loading-dots h-4">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-background/80 backdrop-blur-sm p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex items-end gap-2 bg-muted/30 rounded-2xl p-2">
                <div className="flex gap-1">
                  {/* <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 w-9"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                  </Tooltip> */}

                  {/* <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleRecording}
                        className={`h-9 w-9 ${
                          isRecording ? "text-red-500" : ""
                        }`}
                      >
                        {isRecording ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice input</TooltipContent>
                  </Tooltip> */}
                </div>

                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  disabled={isLoading}
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="h-9 w-9 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-2">
                IntelliViz can make mistakes. Please verify important
                information.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
