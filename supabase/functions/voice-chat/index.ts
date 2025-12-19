import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map website names to URLs - Comprehensive list of frequently used websites
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
  'wikipedia.org': 'https://www.wikipedia.org',
  
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

// Function to detect and extract website name from message
function detectWebsiteCommand(message: string): { website: string | null; url: string | null } {
  const lowerMessage = message.toLowerCase().trim();
  
  // Patterns to match: "open youtube", "open google", "go to youtube", etc.
  const openPatterns = [
    /(?:open|go to|navigate to|visit|launch|start)\s+(?:the\s+)?(?:website\s+)?(?:of\s+)?([a-z0-9]+(?:\.[a-z]+)?)/i,
    /(?:open|go to|navigate to|visit|launch|start)\s+([a-z0-9]+(?:\.[a-z]+)?)/i,
  ];

  for (const pattern of openPatterns) {
    const match = lowerMessage.match(pattern);
    if (match && match[1]) {
      const websiteName = match[1].toLowerCase();
      
      // Check if it's a direct URL
      if (websiteName.startsWith('http://') || websiteName.startsWith('https://')) {
        return { website: null, url: websiteName };
      }
      
      // Check if it's in our website map
      if (websiteMap[websiteName]) {
        return { website: websiteName, url: websiteMap[websiteName] };
      }
      
      // Try to find partial matches (e.g., "tube" for "youtube")
      for (const [key, url] of Object.entries(websiteMap)) {
        if (key.includes(websiteName) || websiteName.includes(key)) {
          return { website: key, url };
        }
      }
    }
  }

  // Check if message contains a URL pattern
  const urlPattern = /(https?:\/\/[^\s]+)/i;
  const urlMatch = lowerMessage.match(urlPattern);
  if (urlMatch) {
    return { website: null, url: urlMatch[1] };
  }

  return { website: null, url: null };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    console.log('Received message:', message);

    if (!message) {
      throw new Error('Message is required');
    }

    // Check if user wants to open a website
    const websiteCommand = detectWebsiteCommand(message);
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Prepare prompt for Gemini - optimized for fast, concise JARVIS responses
    let prompt = `You are J.A.R.V.I.S. Be concise, direct, and efficient. Maximum 2 sentences.`;
    
    if (websiteCommand.url) {
      const websiteName = websiteCommand.website || 'the website';
      prompt += ` User wants to open ${websiteName}. Confirm briefly.`;
    } else {
      prompt += ` ${message}`;
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7, // Lower for faster, more direct responses
            maxOutputTokens: 150, // Reduced for faster, concise responses (JARVIS is brief)
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not process your request.';

    // Return response with URL if website command was detected
    const responseData: any = { response: aiResponse };
    if (websiteCommand.url) {
      responseData.action = 'open_website';
      responseData.url = websiteCommand.url;
      responseData.website = websiteCommand.website || 'website';
    }

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in voice-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
