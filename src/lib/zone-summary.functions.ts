import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { createServerFn } from "@tanstack/react-start";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

const SignalInput = z.object({
  zoneName: z.string(),
  district: z.string(),
  population: z.number(),
  severityScore: z.number(),
  trend: z.string(),
  trendPct: z.number(),
  topSignals: z.array(z.object({ label: z.string(), count: z.number() })),
  sources: z.object({
    citizen: z.number(),
    doctor: z.number(),
    volunteer: z.number(),
    lab: z.number(),
    pharmacy: z.number(),
  }),
  weekly: z.array(z.number()),
  recentReports: z.array(z.string()).max(40),
});

export type ZoneSignalInput = z.infer<typeof SignalInput>;

const SummarySchema = z.object({
  disease: z
    .string()
    .describe("Short hedged name for the pattern, e.g. 'Respiratory illness cluster'"),
  summary: z.string().describe("2-3 plain sentences describing what the reports show"),
  possibleReason: z.string().describe("One hedged possible explanation, clearly uncertain"),
  confidence: z.enum(["Low", "Moderate", "High"]),
  affectedEstimate: z.number(),
  precautions: z.array(z.string()),
});

export type ZoneAiSummary = z.infer<typeof SummarySchema>;

export const summarizeZoneSignals = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SignalInput.parse(input))
  .handler(async ({ data }): Promise<ZoneAiSummary> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const prompt = [
      "You are a public-health signal summarizer for a community reporting app.",
      "You never diagnose and never claim an outbreak is confirmed. Hedge all causal language.",
      "Keep at most 4 precautions, each a short imperative sentence.",
      "Give affectedEstimate as a whole number roughly matching the reported counts.",
      "",
      `Area: ${data.zoneName}, ${data.district} (population ${data.population})`,
      `Computed severity: ${data.severityScore}/100, trend ${data.trend} ${data.trendPct}% week-on-week`,
      `Weekly report counts (oldest to newest): ${data.weekly.join(", ")}`,
      `Top reported signals: ${data.topSignals.map((s) => `${s.label} (${s.count})`).join(", ")}`,
      `Reports by source: citizen ${data.sources.citizen}, doctor ${data.sources.doctor}, volunteer ${data.sources.volunteer}, lab ${data.sources.lab}, pharmacy ${data.sources.pharmacy}`,
      data.recentReports.length
        ? `Newest individual reports:\n- ${data.recentReports.join("\n- ")}`
        : "No new individual reports this session.",
    ].join("\n");

    try {
      const result = streamText({
        model: gateway("google/gemini-3.8-flash"),
        output: Output.object({ schema: SummarySchema }),
        prompt,
      });
      return await result.output;
    } catch (error) {
      console.error("AI summary failure", error);
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The AI summary could not be generated. Please try again.");
      }
      throw error;
    }
  });
