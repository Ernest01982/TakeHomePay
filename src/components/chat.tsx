import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GoogleGenAI } from '@google/genai';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const SYSTEM_PROMPT = `
You are "ZAFinance Copilot." You help South Africans master their money using 2026/2027 data. You are grounded, witty, and always looking for the "tax shield" or "interest save."

Ground Truth: April 2026 Financial Data
- Prime Lending Rate: 10.25%
- SARS Brackets: 2026/2027 tiers (18% to 45% progressive).
- Rebate: Primary (Under 65) is R17,820.
- UIF Cap: R177.12 (1% of R17,712 monthly ceiling).

Tone: Professional South African. Use terms like "Bond," "Bakkie," "SARS," and "RA." Always format currency correctly like R1,500.

Guidelines:
1. Output a short "Bottom Line" summary first.
2. Give a brief, clear breakdown.
3. Add one "Pro Move" (AI-driven suggestion to save money/pay off debt faster).
4. If a user has a balloon >30% or >R100k warn them of negative equity.
5. If PAYE >R5000/mo suggest RA contributions.
6. Keep answers relatively short. Don't write essays.
`;

// Initialize outside component
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function CopilotChat({ initialMessage }: { initialMessage?: string }) {
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: "Howzit! I'm your ZAFinance Copilot. Want to know how to save on tax or crush that car balloon payment?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-send initial message if provided
  useEffect(() => {
    if (initialMessage && messages.length === 1) {
      sendMessage(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      // Build history for Gemini
      const history = newMessages.map(m => ({
         role: m.role,
         parts: [{ text: m.content }]
      }));
      
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7
        }
      });
      
      const response = await chat.sendMessage({ message: text });
      
      setMessages(prev => [...prev, { role: 'model', content: response.text || "Sorry, I couldn't process that." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "Eish, something went wrong. Let's try that again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] border border-border shadow-[0_4px_20px_rgba(30,77,43,0.08)] rounded-2xl overflow-hidden bg-white">
      <CardHeader className="bg-[#ECFDF5] pb-4 border-b border-border">
        <CardTitle className="text-primary flex items-center gap-2 text-lg font-bold">
          <Bot className="w-5 h-5 text-accent" />
          Ask the Copilot
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3 max-w-[90%]", m.role === 'user' ? "self-end flex-row-reverse" : "self-start")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", 
                 m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn("rounded-2xl px-4 py-3 text-sm", 
                 m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                <div className="markdown-body font-sans text-sm">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] self-start">
               <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                 <Bot size={16} />
               </div>
               <div className="rounded-2xl px-4 py-3 bg-muted text-foreground flex items-center">
                 <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
               </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 pt-2 border-t">
         <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-none">
           <Button variant="outline" size="sm" onClick={() => sendMessage("How much tax can I save?")} className="whitespace-nowrap text-xs">
             How much tax can I save?
           </Button>
           <Button variant="outline" size="sm" onClick={() => sendMessage("Can I afford a R500k car?")} className="whitespace-nowrap text-xs">
             Can I afford a R500k car?
           </Button>
           <Button variant="outline" size="sm" onClick={() => sendMessage("How do I pay my bond off 5 years faster?")} className="whitespace-nowrap text-xs">
             Pay bond off 5 years faster
           </Button>
         </div>
         <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Ask anything..." 
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
         </form>
      </div>
    </Card>
  );
}
