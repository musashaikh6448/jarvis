import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface CommandSuggestionProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

const CommandSuggestion = ({ icon, text, onClick }: CommandSuggestionProps) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "bg-glass border-neon text-foreground hover:bg-primary/10",
        "hover:border-primary transition-all duration-300",
        "flex items-center gap-2 px-4 py-2 rounded-xl h-auto"
      )}
    >
      <span className="text-primary">{icon}</span>
      <span className="text-sm">{text}</span>
    </Button>
  );
};

export default CommandSuggestion;
