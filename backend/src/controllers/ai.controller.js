import Anthropic from "@anthropic-ai/sdk";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { pulseTools, runPulseTool } from "../services/ai/pulseTools.js";

const MODEL = "claude-opus-5";

// How many times the model may call tools before we stop the turn. Each pass
// is one API round-trip, so this caps both latency and spend per message.
const MAX_TOOL_ROUNDS = 6;

// Guardrails on what the client may send us.
const MAX_HISTORY = 30;
const MAX_MESSAGE_CHARS = 4000;

// Lazily construct the client so the server still boots without an API key —
// the AI routes then answer 503 instead of taking the whole process down.
let anthropic = null;
const getAnthropic = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ApiError(503, "The AI assistant is not configured on this server");
  }
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
};

const SYSTEM_INSTRUCTIONS = `You are the PulseMonitor assistant, built into the PulseMonitor dashboard.

PulseMonitor is an uptime and performance monitoring service. Users create monitors
(a website URL or a server) that are checked on an interval; every check is stored
as a log with a status, HTTP status code, response time, connection timing
breakdown, and SSL certificate details.

Your job is to answer questions about the signed-in user's own monitoring data and
account, and to explain what the numbers mean.

How to work:
- Use the tools to look up real data. Never invent monitor names, uptime figures,
  response times, incident counts, or dates — if a tool returns nothing, say so.
- Prefer calling a tool over asking the user for clarification when the answer is
  discoverable. If they name a monitor you have not seen, call list_monitors.
- When a tool returns an error, tell the user plainly what could not be read.
- The tools only ever return this user's own data. If asked about other accounts,
  other users, or the platform's internals, say that is outside what you can see.

How to answer:
- Be concise and concrete. Lead with the answer, then the supporting numbers.
- Use the user's local phrasing for time ("in the last 24 hours") rather than
  raw timestamps, unless an exact time is what was asked for.
- Round response times to whole milliseconds and uptime to two decimals.
- Use short markdown: bold for key figures, bullet lists for more than two items.
  No headings, no tables unless comparing three or more monitors.
- When you spot something worth acting on — an expiring certificate, a monitor
  stuck pending, repeated 5xx — mention it briefly, even if not asked.
- You cannot change anything: creating, editing, pausing, or deleting monitors is
  done by the user in the dashboard. Point them there rather than promising an action.`;

// Turns the client's chat history into Messages API input. Anything malformed
// is rejected rather than quietly dropped, so the UI can surface the problem.
const normalizeHistory = (raw) => {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new ApiError(400, "messages must be a non-empty array");
  }
  if (raw.length > MAX_HISTORY) {
    throw new ApiError(400, `Conversation is too long (max ${MAX_HISTORY} messages)`);
  }

  const messages = raw.map((message, index) => {
    const role = message?.role;
    const content = message?.content;

    if (role !== "user" && role !== "assistant") {
      throw new ApiError(400, `messages[${index}].role must be "user" or "assistant"`);
    }
    if (typeof content !== "string" || !content.trim()) {
      throw new ApiError(400, `messages[${index}].content must be a non-empty string`);
    }
    if (content.length > MAX_MESSAGE_CHARS) {
      throw new ApiError(400, `messages[${index}].content exceeds ${MAX_MESSAGE_CHARS} characters`);
    }

    return { role, content: content.trim() };
  });

  if (messages[0].role !== "user") {
    throw new ApiError(400, "The first message must be from the user");
  }
  if (messages[messages.length - 1].role !== "user") {
    throw new ApiError(400, "The last message must be from the user");
  }

  return messages;
};

export const chat = asyncHandler(async (req, res) => {
  // Validate the request before checking configuration, so a malformed body
  // reports what is actually wrong with it either way.
  const messages = normalizeHistory(req.body?.messages);
  const client = getAnthropic();
  const user = req.user;

  const system = [
    {
      type: "text",
      text: SYSTEM_INSTRUCTIONS,
      cache_control: { type: "ephemeral" },
    },
    {
      // Kept in its own block after the cache breakpoint: it changes per user
      // and per request, and would otherwise invalidate the cached prefix.
      type: "text",
      text: `Signed-in user: ${user.name} (${user.email}), plan: ${user.plan}. Current time: ${new Date().toISOString()}.`,
    },
  ];

  const toolsUsed = [];
  let response;

  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        thinking: { type: "adaptive" },
        output_config: { effort: "medium" },
        system,
        tools: pulseTools,
        messages,
      });

      if (response.stop_reason !== "tool_use") break;

      // Echo the assistant turn back verbatim — thinking and tool_use blocks
      // included — then answer every tool_use block in a single user message.
      messages.push({ role: "assistant", content: response.content });

      const toolCalls = response.content.filter((block) => block.type === "tool_use");
      const results = await Promise.all(
        toolCalls.map(async (call) => {
          toolsUsed.push(call.name);
          const result = await runPulseTool(call.name, call.input, user);
          return {
            type: "tool_result",
            tool_use_id: call.id,
            content: JSON.stringify(result),
            is_error: Boolean(result?.error),
          };
        })
      );

      messages.push({ role: "user", content: results });
    }
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      throw new ApiError(429, "The AI assistant is busy right now. Try again in a moment.");
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic authentication failed:", error.message);
      throw new ApiError(503, "The AI assistant is not configured correctly");
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
      throw new ApiError(502, "The AI assistant could not be reached");
    }
    throw error;
  }

  if (response.stop_reason === "refusal") {
    return res
      .status(200)
      .json(new ApiResponse(200, {
        reply: "I can't help with that request. Ask me about your monitors, incidents, or account instead.",
        toolsUsed,
      }));
  }

  const reply = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!reply) {
    // Only reachable if the model exhausted MAX_TOOL_ROUNDS still wanting tools.
    throw new ApiError(504, "The assistant could not finish that request. Try asking more narrowly.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { reply, toolsUsed: [...new Set(toolsUsed)] }, "Reply generated"));
});

const DIGEST_PROMPT = `Write a short operations digest for the last 24 hours.

Gather the data first: list the user's monitors, then pull the incidents for the
window, and check stats for anything that looks unhealthy.

Structure the digest as:
1. One sentence of overall health — how many monitors, how many had trouble.
2. Any monitor with incidents: what happened, how often, and the pattern if there
   is one (a single blip vs. sustained failure vs. intermittent).
3. Anything worth watching — certificates expiring within 30 days, response times
   that stand out, monitors stuck in pending.
4. If everything is healthy, say so plainly in two sentences and stop.

Be specific and quantitative. No preamble, no sign-off, no invented data. If the
window has few checks, say the sample is small rather than over-reading it.`;

// Same tool loop as chat, driven by a fixed prompt instead of user input.
export const digest = asyncHandler(async (req, res) => {
  const client = getAnthropic();
  const user = req.user;

  const messages = [{ role: "user", content: DIGEST_PROMPT }];
  const system = [
    { type: "text", text: SYSTEM_INSTRUCTIONS, cache_control: { type: "ephemeral" } },
    {
      type: "text",
      text: `Signed-in user: ${user.name} (${user.email}), plan: ${user.plan}. Current time: ${new Date().toISOString()}.`,
    },
  ];

  let response;
  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 8000,
        thinking: { type: "adaptive" },
        output_config: { effort: "medium" },
        system,
        tools: pulseTools,
        messages,
      });

      if (response.stop_reason !== "tool_use") break;

      messages.push({ role: "assistant", content: response.content });
      const toolCalls = response.content.filter((block) => block.type === "tool_use");
      const results = await Promise.all(
        toolCalls.map(async (call) => ({
          type: "tool_result",
          tool_use_id: call.id,
          content: JSON.stringify(await runPulseTool(call.name, call.input, user)),
        }))
      );
      messages.push({ role: "user", content: results });
    }
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      throw new ApiError(429, "The AI assistant is busy right now. Try again in a moment.");
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
      throw new ApiError(502, "Could not generate the digest right now");
    }
    throw error;
  }

  const summary = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!summary) throw new ApiError(504, "Could not generate the digest right now");

  return res
    .status(200)
    .json(new ApiResponse(200, { summary, generatedAt: new Date() }, "Digest generated"));
});

// Lets the UI hide or disable the assistant when no key is configured.
export const aiStatus = asyncHandler(async (_req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { enabled: Boolean(process.env.ANTHROPIC_API_KEY), model: MODEL }));
});
