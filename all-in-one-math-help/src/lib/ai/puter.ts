import { createRequire } from "node:module";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GenerateWithPuterOptions = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Ask the model for JSON; Puter has no native response_format — prompts must request JSON. */
  responseFormatJson?: boolean;
  testMode?: boolean;
};

type PuterChatResponse = {
  message?: {
    content?: unknown;
  };
};

type PuterInstance = {
  ai: {
    chat: (
      messages: ChatMessage[],
      testModeOrOptions?: boolean | Record<string, unknown>,
      options?: Record<string, unknown>,
    ) => Promise<PuterChatResponse>;
  };
};

let puterSingleton: PuterInstance | null = null;

function getAuthToken(): string {
  const token =
    process.env.PUTER_AUTH_TOKEN ?? process.env.puterAuthToken ?? "";

  if (!token || token === "your_puter_auth_token") {
    throw new Error("PUTER_AUTH_TOKEN is not configured");
  }

  return token;
}

function getPuter(): PuterInstance {
  if (puterSingleton) {
    return puterSingleton;
  }

  const require = createRequire(import.meta.url);
  const { init } = require("@heyputer/puter.js/src/init.cjs") as {
    init: (authToken?: string) => PuterInstance;
  };

  puterSingleton = init(getAuthToken());
  return puterSingleton;
}

function extractTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof (part as { text: unknown }).text === "string"
        ) {
          return (part as { text: string }).text;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

/**
 * Strip optional markdown fences so JSON.parse stays reliable.
 */
export function unwrapJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

/**
 * Server-only Puter.js text generation helper.
 * Do not import this module from Client Components.
 *
 * Uses Puter's Node init with PUTER_AUTH_TOKEN (user-pays / account credits).
 * Docs: https://docs.puter.com/llms.txt
 */
export async function generateWithPuter(
  options: GenerateWithPuterOptions,
): Promise<string> {
  const puter = getPuter();

  const messages: ChatMessage[] = options.responseFormatJson
    ? [
        ...options.messages,
        {
          role: "system",
          content:
            "Respond with valid JSON only. No markdown fences, no commentary.",
        },
      ]
    : options.messages;

  // Signature for message arrays: chat(messages, testMode, options)
  const response = await puter.ai.chat(messages, options.testMode ?? false, {
    model: options.model ?? "gpt-5-nano",
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    normalize: true,
  });

  const content = extractTextContent(response.message?.content);

  if (!content) {
    throw new Error("Puter returned empty content");
  }

  return options.responseFormatJson ? unwrapJsonPayload(content) : content;
}
