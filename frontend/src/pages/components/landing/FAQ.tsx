import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <section id="faq" className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/20 to-background">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="container mx-auto px-4"
      >

        {/* HEADER */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1 text-sm tracking-wide"
          >
            Have Questions?
          </Badge>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Find answers about PulseMonitor easily.
          </p>
        </div>

        {/* SEARCH */}
        <div className="max-w-xl mx-auto mb-12 relative">
          <Search className="absolute left-4 top-3.5 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            placeholder="Search question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border bg-card/70 backdrop-blur
                       focus:ring-4 focus:ring-primary/20 outline-none
                       transition-all shadow-sm"
          />
        </div>

        {/* FAQ LIST */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-5">

            {filteredFaq.length === 0 && (
              <p className="text-center text-muted-foreground">
                No results found.
              </p>
            )}

            {filteredFaq.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-2xl border bg-card/80 backdrop-blur shadow-sm overflow-hidden"
              >

                <AccordionTrigger className="px-6 py-5 hover:no-underline">

                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 rounded-full bg-primary/10">
                      <HelpCircle className="text-primary h-5 w-5" />
                    </div>

                    <span className="font-medium">
                      {item.question}
                    </span>
                  </div>

                </AccordionTrigger>

                <AccordionContent className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>

              </AccordionItem>
            ))}

          </Accordion>
        </div>

      </motion.div>
    </section>
  );
}
