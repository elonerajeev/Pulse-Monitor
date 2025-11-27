import React, { useState } from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Search } from "lucide-react";

const faqItems = [
  { question: "How does PulseMonitor work?", answer: "PulseMonitor checks your services globally every few seconds and alerts you instantly on failure." },
  { question: "Is a credit card required to sign up?", answer: "No, free plan is available without any card." },
  { question: "What kinds of services can I monitor?", answer: "You can monitor websites, APIs, servers, ports, and cron jobs." },
  { question: "How does multi-location monitoring work?", answer: "Your service is checked from multiple global data centers." },
  { question: "Can I customize alert notifications?", answer: "Yes, via email, Slack, Telegram and more." },
  { question: "What happens if I exceed my plan limits?", answer: "We notify you. Services pause until upgrade or renewal." }
];

export default function FAQ() {
  const [search, setSearch] = useState("");

  const filteredFaq = faqItems.filter(item =>
    item.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="faq" className="py-20 md:py-32 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Have Questions?</Badge>
          <h2 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-3">
            Find answers about PulseMonitor easily.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            placeholder="Search question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaq.length === 0 && (
              <p className="text-center text-muted-foreground">No results found.</p>
            )}

            {filteredFaq.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl"
              >
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <HelpCircle className="text-primary h-5 w-5" />
                    {item.question}
                  </div>
                </AccordionTrigger>

                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.div>
    </section>
  );
}
