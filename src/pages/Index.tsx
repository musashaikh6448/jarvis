import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ParticleBackground";
import VoiceWave from "@/components/VoiceWave";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SpeechRecognitionService, TextToSpeechService } from "@/utils/speechRecognition";

const Index = () => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [isProcessing, setIsProcessing] = useState(false);

  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);
  const ttsRef = useRef<TextToSpeechService | null>(null);

  useEffect(() => {
    // Initialize Text-to-Speech
    ttsRef.current = new TextToSpeechService(() => {
      setIsSpeaking(false);
      setStatus("Ready");
    });

    // Initialize Speech Recognition
    speechRecognitionRef.current = new SpeechRecognitionService(
      async (text) => {
        setIsListening(false);
        setStatus("Processing...");
        setIsProcessing(true);
        
        console.log("User said:", text);
        
        // Quick check for website opening commands on frontend
        const websiteMap: Record<string, string> = {
          // Social Media
          'youtube': 'https://www.youtube.com',
          'facebook': 'https://www.facebook.com',
          'twitter': 'https://www.twitter.com',
          'x': 'https://www.x.com',
          'instagram': 'https://www.instagram.com',
          'linkedin': 'https://www.linkedin.com',
          'reddit': 'https://www.reddit.com',
          'pinterest': 'https://www.pinterest.com',
          'tiktok': 'https://www.tiktok.com',
          'snapchat': 'https://www.snapchat.com',
          'tumblr': 'https://www.tumblr.com',
          
          // Communication
          'whatsapp': 'https://web.whatsapp.com',
          'telegram': 'https://web.telegram.org',
          'discord': 'https://www.discord.com',
          'skype': 'https://www.skype.com',
          'zoom': 'https://www.zoom.us',
          'teams': 'https://www.microsoft.com/en-us/microsoft-teams',
          'slack': 'https://slack.com',
          
          // Email
          'gmail': 'https://www.gmail.com',
          'outlook': 'https://www.outlook.com',
          'yahoo': 'https://mail.yahoo.com',
          'protonmail': 'https://www.protonmail.com',
          
          // Search & Information
          'google': 'https://www.google.com',
          'bing': 'https://www.bing.com',
          'duckduckgo': 'https://www.duckduckgo.com',
          'wikipedia': 'https://www.wikipedia.org',
          
          // Shopping
          'amazon': 'https://www.amazon.com',
          'ebay': 'https://www.ebay.com',
          'aliexpress': 'https://www.aliexpress.com',
          'etsy': 'https://www.etsy.com',
          'shopify': 'https://www.shopify.com',
          'walmart': 'https://www.walmart.com',
          'target': 'https://www.target.com',
          
          // Entertainment
          'netflix': 'https://www.netflix.com',
          'spotify': 'https://www.spotify.com',
          'youtube music': 'https://music.youtube.com',
          'apple music': 'https://music.apple.com',
          'twitch': 'https://www.twitch.tv',
          'hulu': 'https://www.hulu.com',
          'disney': 'https://www.disneyplus.com',
          'disney plus': 'https://www.disneyplus.com',
          'prime video': 'https://www.primevideo.com',
          'hbo': 'https://www.hbo.com',
          'hbo max': 'https://www.hbomax.com',
          
          // Development & Tech
          'github': 'https://www.github.com',
          'gitlab': 'https://www.gitlab.com',
          'stackoverflow': 'https://www.stackoverflow.com',
          'stack exchange': 'https://stackexchange.com',
          'medium': 'https://www.medium.com',
          'dev.to': 'https://dev.to',
          'codepen': 'https://www.codepen.io',
          'jsfiddle': 'https://www.jsfiddle.net',
          'replit': 'https://www.replit.com',
          
          // News & Media
          'bbc': 'https://www.bbc.com',
          'cnn': 'https://www.cnn.com',
          'reuters': 'https://www.reuters.com',
          'the guardian': 'https://www.theguardian.com',
          'nytimes': 'https://www.nytimes.com',
          'new york times': 'https://www.nytimes.com',
          
          // Productivity & Tools
          'notion': 'https://www.notion.so',
          'trello': 'https://www.trello.com',
          'asana': 'https://www.asana.com',
          'dropbox': 'https://www.dropbox.com',
          'onedrive': 'https://www.onedrive.com',
          'drive': 'https://drive.google.com',
          'google drive': 'https://drive.google.com',
          'microsoft': 'https://www.microsoft.com',
          'office': 'https://www.office.com',
          'office365': 'https://www.office.com',
          
          // Education
          'coursera': 'https://www.coursera.org',
          'udemy': 'https://www.udemy.com',
          'khan academy': 'https://www.khanacademy.org',
          'edx': 'https://www.edx.org',
          'udacity': 'https://www.udacity.com',
          
          // Banking & Finance
          'paypal': 'https://www.paypal.com',
          'stripe': 'https://www.stripe.com',
          'venmo': 'https://www.venmo.com',
          
          // Travel
          'booking': 'https://www.booking.com',
          'airbnb': 'https://www.airbnb.com',
          'expedia': 'https://www.expedia.com',
          'tripadvisor': 'https://www.tripadvisor.com',
          
          // Food
          'uber eats': 'https://www.ubereats.com',
          'doordash': 'https://www.doordash.com',
          'grubhub': 'https://www.grubhub.com',
          
          // Other Popular Sites
          'imgur': 'https://www.imgur.com',
          'flickr': 'https://www.flickr.com',
          'vimeo': 'https://www.vimeo.com',
          'soundcloud': 'https://www.soundcloud.com',
          'bandcamp': 'https://www.bandcamp.com',
        };

        const lowerText = text.toLowerCase().trim();
        const openPattern = /(?:open|go to|navigate to|visit|launch|start)\s+(?:the\s+)?(?:website\s+)?(?:of\s+)?([a-z0-9]+)/i;
        const match = lowerText.match(openPattern);
        let detectedUrl: string | null = null;

        if (match && match[1]) {
          const websiteName = match[1].toLowerCase();
          if (websiteMap[websiteName]) {
            detectedUrl = websiteMap[websiteName];
          } else {
            // Try partial match
            for (const [key, url] of Object.entries(websiteMap)) {
              if (key.includes(websiteName) || websiteName.includes(key)) {
                detectedUrl = url;
                break;
              }
            }
          }
        }

        // If we detected a website command, open it immediately (user-initiated action)
        if (detectedUrl) {
          console.log('Detected website command, opening:', detectedUrl);
          // Use anchor element method which is more reliable
          const link = document.createElement('a');
          link.href = detectedUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        try {
          // Send to Gemini via edge function
          const { data, error } = await supabase.functions.invoke('voice-chat', {
            body: { message: text }
          });

          if (error) {
            console.error('Function error:', error);
            throw error;
          }

          console.log('Function response:', data);
          
          if (data?.response) {
            // Also check backend response in case frontend detection missed it
            if (data.action === 'open_website' && data.url && !detectedUrl) {
              console.log('Backend detected website, opening:', data.url);
              const link = document.createElement('a');
              link.href = data.url;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            
            setStatus("Speaking...");
            setIsSpeaking(true);
            ttsRef.current?.speak(data.response);
          } else {
            throw new Error('No response from AI');
          }
        } catch (error: any) {
          console.error('Error:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to process your request",
            variant: "destructive",
          });
          setStatus("Ready");
        } finally {
          setIsProcessing(false);
        }
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        setStatus("Ready");
        toast({
          title: "Speech Recognition Error",
          description: error,
          variant: "destructive",
        });
      }
    );

    return () => {
      speechRecognitionRef.current?.stop();
      ttsRef.current?.stop();
    };
  }, [toast]);

  const toggleListening = () => {
    if (isProcessing || isSpeaking) {
      toast({
        title: "Please wait",
        description: "AI is currently processing or speaking",
      });
      return;
    }

    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      setStatus("Ready");
    } else {
      setStatus("Listening...");
      setIsListening(true);
      speechRecognitionRef.current?.start();
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center">
      {/* Hexagonal Grid Background - Optimized */}
      <div className="absolute inset-0 hex-grid opacity-15" />
      
      {/* Scanning Lines - Reduced to 1 for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="scan-line" style={{ animationDelay: '0s' }} />
      </div>

      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto px-4 w-full">
        {/* Futuristic Header */}
        <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="relative animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <h1 className="text-7xl md:text-8xl font-bold holographic-text tracking-wider mb-2 text-glow-animate">
              J.A.R.V.I.S
            </h1>
          </div>
          
          <div className="flex items-center justify-center gap-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent animate-breathe" />
            <p className="text-sm md:text-base text-primary/80 font-mono uppercase tracking-[0.3em]">
              Just A Rather Very Intelligent System
            </p>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent animate-breathe" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-3 mt-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className={`
              relative w-4 h-4 rounded-full transition-all duration-500
              ${isListening || isProcessing || isSpeaking 
                ? 'bg-primary animate-smooth-pulse scale-110' 
                : 'bg-primary/50 scale-100'
              }
            `}>
              <div className={`
                absolute inset-0 rounded-full transition-all duration-500
                ${isListening || isProcessing || isSpeaking 
                  ? 'bg-primary animate-ping opacity-75' 
                  : 'opacity-0'
                }
              `} />
            </div>
            <span className="text-xs md:text-sm text-primary uppercase tracking-[0.2em] font-mono transition-all duration-300">
              {status}
            </span>
            <div className={`
              relative w-4 h-4 rounded-full transition-all duration-500
              ${isListening || isProcessing || isSpeaking 
                ? 'bg-primary animate-smooth-pulse scale-110' 
                : 'bg-primary/50 scale-100'
              }
            `}>
              <div className={`
                absolute inset-0 rounded-full transition-all duration-500
                ${isListening || isProcessing || isSpeaking 
                  ? 'bg-primary animate-ping opacity-75' 
                  : 'opacity-0'
                }
              `} />
            </div>
          </div>
        </div>

        {/* Holographic Voice Wave Panel */}
        <div className="w-full max-w-3xl animate-slide-up" style={{ animationDelay: '1s' }}>
          <div className="tech-panel rounded-2xl p-8 md:p-12 holographic-border relative overflow-hidden border-animate hover-lift hover-glow" style={{ transform: 'translateZ(0)' }}>
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50 corner-glow transition-all duration-500" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50 corner-glow transition-all duration-500" style={{ animationDelay: '0.2s' }} />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50 corner-glow transition-all duration-500" style={{ animationDelay: '0.4s' }} />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50 corner-glow transition-all duration-500" style={{ animationDelay: '0.6s' }} />
            
            <div className="relative z-10">
              <VoiceWave isActive={isListening || isSpeaking} />
            </div>
          </div>
        </div>

        {/* Futuristic Control Button */}
        <div className="flex flex-col items-center gap-6 animate-scale-in" style={{ animationDelay: '1.2s' }}>
          <div className="relative animate-float-smooth">
            {/* Outer Ring */}
            <div className={`
              absolute inset-0 rounded-full transition-all duration-700 ease-out
              ${isListening 
                ? 'bg-primary/20 animate-smooth-pulse scale-125' 
                : 'bg-primary/10 scale-100'
              }
            `} />
            
            {/* Middle Ring */}
            <div className={`
              absolute inset-0 rounded-full -m-2 transition-all duration-700 ease-out
              ${isListening 
                ? 'bg-primary/10 animate-smooth-pulse scale-110' 
                : 'scale-100 opacity-0'
              }
            `} />
            
            <Button
              onClick={toggleListening}
              disabled={isProcessing || isSpeaking}
              size="lg"
              className={`
                relative w-28 h-28 md:w-32 md:h-32 rounded-full 
                transition-all duration-500 border-2 scale-on-active
                ${isListening 
                  ? 'bg-destructive/90 hover:bg-destructive border-destructive animate-smooth-pulse scale-110 shadow-[0_0_40px_hsl(var(--destructive)/0.6)]' 
                  : 'bg-primary/90 hover:bg-primary border-primary glow-neon hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]'
                }
                ${(isProcessing || isSpeaking) && 'opacity-50 cursor-not-allowed'}
              `}
            >
              {isListening ? (
                <MicOff size={40} className="text-primary-foreground drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
              ) : isSpeaking ? (
                <Volume2 size={40} className="text-primary-foreground animate-pulse drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
              ) : (
                <Mic size={40} className="text-primary-foreground drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
              )}
            </Button>
          </div>
          
          <p className="text-center text-sm md:text-base text-primary/70 max-w-md font-mono uppercase tracking-wider transition-all duration-300 animate-fade-in">
            {isListening 
              ? ">> LISTENING... SPEAK NOW <<" 
              : isSpeaking 
              ? ">> AI RESPONDING... <<" 
              : isProcessing 
              ? ">> PROCESSING REQUEST... <<" 
              : ">> ACTIVATE VOICE INTERFACE <<"}
          </p>
        </div>

        {/* Tech Panel Instructions */}
        <div className="tech-panel holographic-border rounded-xl p-6 md:p-8 max-w-2xl w-full hover-lift hover-glow animate-slide-up" style={{ animationDelay: '1.4s' }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-primary/50" />
            <h3 className="text-primary font-mono uppercase tracking-wider text-sm md:text-base">
              System Commands
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/50 to-primary/50" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30 border border-primary/20 hover-lift transition-all duration-300 hover:border-primary/40">
              <span className="text-primary font-mono animate-breathe">[01]</span>
              <span className="text-foreground/80">Natural language queries</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30 border border-primary/20 hover-lift transition-all duration-300 hover:border-primary/40" style={{ animationDelay: '0.1s' }}>
              <span className="text-primary font-mono animate-breathe" style={{ animationDelay: '0.2s' }}>[02]</span>
              <span className="text-foreground/80">Website navigation: "open [site]"</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30 border border-primary/20 hover-lift transition-all duration-300 hover:border-primary/40" style={{ animationDelay: '0.2s' }}>
              <span className="text-primary font-mono animate-breathe" style={{ animationDelay: '0.4s' }}>[03]</span>
              <span className="text-foreground/80">Clear speech recognition</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/30 border border-primary/20 hover-lift transition-all duration-300 hover:border-primary/40" style={{ animationDelay: '0.3s' }}>
              <span className="text-primary font-mono animate-breathe" style={{ animationDelay: '0.6s' }}>[04]</span>
              <span className="text-foreground/80">Multi-language support enabled</span>
            </div>
          </div>
        </div>

        {/* Footer with Tech Aesthetic */}
        <div className="flex items-center justify-center gap-4 mt-4 animate-fade-in" style={{ animationDelay: '1.6s' }}>
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-primary/30 animate-breathe" />
          <p className="text-xs text-primary/60 font-mono uppercase tracking-wider text-center">
            Powered by Google Gemini AI • Real-time Processing
          </p>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-primary/30 animate-breathe" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </div>
  );
};

export default Index;
