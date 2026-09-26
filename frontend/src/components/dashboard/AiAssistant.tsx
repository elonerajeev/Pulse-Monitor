import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/utils/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How are my monitors doing?",
  "Any incidents in the last 24 hours?",
  "Which service is slowest right now?",
];

const GREETING =
  "Hi! I can answer questions about your monitors, incidents, uptime and account. What would you like to know?";

// The assistant replies in a small markdown subset — **bold** and "- " bullets.
// Rendering just that keeps the bundle free of a full markdown parser.
const renderInline = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );

const FormattedReply = ({ text }: { text: string }) => (
  <div className="space-y-1">
    {text.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-1" />;
      if (/^[-*]\s+/.test(trimmed)) {
        return (
          <div key={i} className="flex gap-2">
            <span className="text-muted-foreground">•</span>
            <span>{renderInline(trimmed.replace(/^[-*]\s+/, ""))}</span>
          </div>
        );
      }
      return <p key={i}>{renderInline(trimmed)}</p>;
    })}
  </div>
);

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // null while unknown; false means no API key is configured server-side. The
  // launcher stays visible either way — only the composer is disabled.
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Re-checked every time the panel opens, so configuring a key and restarting
  // the server takes effect without a full page reload.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    api
      .get("/ai/status")
      .then(({ data }) => {
        if (!cancelled) setIsEnabled(Boolean(data?.data?.enabled));
      })
      .catch(() => {
        if (!cancelled) setIsEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || isSending || isEnabled === false) return;

    // Send the history the model needs, but keep the request bounded — the API
    // rejects anything longer than 30 messages.
    const history: ChatMessage[] = [...messages, { role: "user", content: question }].slice(-29);

    setMessages(history);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const { data } = await api.post("/ai/chat", { messages: history });
      setMessages([...history, { role: "assistant", content: data.data.reply }]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Could not reach the assistant. Check your connection and try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-24 right-4 z-50 flex h-[min(32rem,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-xl border bg-background shadow-2xl md:right-6"
          >
            <header className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary/10 p-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">PulseMonitor Assistant</p>
                  <p className="text-xs text-muted-foreground">Answers from your own data</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close assistant">
                <X className="h-4 w-4" />
              </Button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
              <div className="flex gap-2">
                <Bot className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="rounded-lg bg-muted px-3 py-2">{GREETING}</div>
              </div>

              {messages.map((message, i) =>
                message.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-primary px-3 py-2 text-primary-foreground">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-2">
                    <Bot className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2">
                      <FormattedReply text={message.content} />
                    </div>
                  </div>
                )
              )}

              {isSending && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Checking your monitoring data…</span>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}

              {isEnabled === false && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs">
                  The assistant isn't set up on this server yet, so it can't answer
                  questions right now. Once it's configured, reopen this panel and
                  it will be ready.
                </div>
              )}

              {messages.length === 0 && !isSending && isEnabled !== false && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => send(suggestion)}
                      className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder={isEnabled === false ? "Assistant unavailable" : "Ask about your monitors…"}
                  disabled={isEnabled === false}
                  rows={1}
                  maxLength={4000}
                  className="max-h-32 min-h-[2.5rem] resize-none"
                />
                <Button
                  size="icon"
                  onClick={() => send(input)}
                  disabled={isSending || !input.trim() || isEnabled === false}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Reads your monitoring data. It can't change your settings.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen((open) => !open)}
        size="icon"
        className="fixed bottom-6 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:right-6"
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </Button>
    </>
  );
};

export default AiAssistant;
