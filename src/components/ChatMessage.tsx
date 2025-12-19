import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 backdrop-blur-sm",
          isUser
            ? "bg-primary/20 border border-primary/30 text-foreground ml-auto glow-neon"
            : "bg-glass border-neon text-foreground"
        )}
      >
        <p className="text-sm leading-relaxed">{message}</p>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 block">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
