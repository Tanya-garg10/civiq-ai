import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set body limit for base64 image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Lazy initializer for Gemini API to prevent crash on boot if key is missing
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets. Please configure it in AI Studio Settings > Secrets.");
    }
    // Set custom User-Agent for telemetry as required
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Ensure the response is always robust and properly structured
const MODEL_NAME = "gemini-3.5-flash";

// Helper function to call generateContent with a list of fallback models
async function generateContentWithFallback(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
  }
) {
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
  ];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      console.log(`[CiviQ AI] Attempting generateContent with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      return response;
    } catch (error: any) {
      console.warn(`[CiviQ AI] Model ${model} failed with error:`, error.message || error);
      lastError = error;
    }
  }
  throw lastError || new Error("All model attempts failed");
}

// API: Vision and Planning Agent to analyze civic reports
app.post("/api/ai/analyze-image", async (req, res) => {
  try {
    const { image, description, category } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const ai = getGemini();

    // The image comes as a base64 string, potentially prefixed with data url header
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
You are the CiviQ AI Multi-Agent Civic Intelligence Engine. 
Analyze this uploaded image, combined with the citizen's description and chosen category.

Citizen Category Choice: "${category || "Unspecified"}"
Citizen Description: "${description || "No description provided"}"

Perform the following tasks:
1. Act as the **Vision Agent**: Confirm if this image represents a real community civic issue (e.g., potholes, garbage accumulation, water leakage, damaged streetlight, broken road, illegal dumping, public hazard). 
2. Act as the **Planning Agent**: Evaluate the severity (Scale 1-10) and priority ('low', 'medium', 'high', 'critical'). Critical priority should be reserved for issues causing immediate safety threats, severe blocking of emergency routes, or severe environmental hazards.
3. Assign the optimal municipal department to handle this (e.g., "Public Works Dept", "Sanitation & Waste", "Water & Sewage", "Electricity Board", "Traffic Police").
4. Provide an estimated resolution time (in days).
5. Generate an objective, detailed explanation ('reasoning') describing why this priority/severity was determined, what specific hazards or problems are observed in the image, and the recommended plan of action.

Output your response STRICTLY as a valid JSON object with the following fields:
{
  "issueType": "Specific label of the issue, e.g. Pothole, Broken Road, Water Leakage",
  "severity": "Severity score from 1 to 10 based on visual scale",
  "priority": "low" | "medium" | "high" | "critical",
  "department": "Name of responsible department",
  "estimatedDays": 1-30,
  "reasoning": "Explainable AI output describing why this priority was chosen and recommended action",
  "confidence": 0.0-1.0
}

Return ONLY the raw JSON object, without any markdown formatting wrappers (like \`\`\`json ... \`\`\`), backticks, or extra commentary. It must parse cleanly.
`;

    const response = await generateContentWithFallback(ai, {
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        },
        {
          text: prompt
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "";
    // Clean potential markdown leftovers
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanedText);

    res.json({ success: true, analysis: result });
  } catch (error: any) {
    console.error("Vision Agent Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to analyze image",
      fallbackAnalysis: {
        issueType: req.body.category || "General Issue",
        severity: "5",
        priority: "medium",
        department: "Municipal Corporation",
        estimatedDays: 7,
        reasoning: "AI analysis was skipped due to temporary service unavailability. Default values applied.",
        confidence: 0.5
      }
    });
  }
});

// API: Validation Agent to check for duplicate reports
app.post("/api/ai/validate-duplicate", async (req, res) => {
  try {
    const { currentReport, existingReports } = req.body;
    if (!currentReport || !existingReports || !Array.isArray(existingReports)) {
      return res.status(400).json({ error: "Missing reports data" });
    }

    if (existingReports.length === 0) {
      return res.json({ isDuplicate: false, duplicates: [] });
    }

    const ai = getGemini();

    const prompt = `
You are the CiviQ AI Validation Agent. Your goal is to detect duplicate community reports to prevent administrative overload and automatically merge complaints.

New Report Description: "${currentReport.description}"
New Report Category: "${currentReport.category}"

Here is a list of existing nearby reports:
${existingReports.map((r, i) => `${i + 1}. ID: ${r.id}, Category: ${r.category}, Status: ${r.status}, Description: "${r.description}"`).join("\n")}

Compare the new report with each existing report. Determine if any of them are likely the exact same physical issue (e.g. same pothole, same garbage pile).
If a duplicate is found, recommend which Report ID it should be merged into and justify your decision.

Output your response STRICTLY as a valid JSON object with the following fields:
{
  "isDuplicate": true | false,
  "matchReportId": "ID of the existing report that this matches, or null if none",
  "confidence": 0.0-1.0,
  "reason": "Brief, helpful explanation of why they match or why they are distinct"
}

Return ONLY the raw JSON object, without markdown wrappers. It must parse cleanly.
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const cleanedText = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanedText);

    res.json({ success: true, result });
  } catch (error: any) {
    console.error("Validation Agent Error:", error);
    res.json({ success: false, result: { isDuplicate: false, matchReportId: null, confidence: 0, reason: "Duplicate detection skipped due to server error." } });
  }
});

// API: AI Assistant Chat Interface
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, chatHistory, reportsContext } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing user message" });
    }

    const ai = getGemini();

    const systemInstruction = `
You are the CiviQ AI Community Assistant. You are a helpful, expert civic liaison helping citizens and administrators navigate municipal problems.
Your goal is to answer questions, analyze complaints, identify trends, explain prioritizations, and recommend community action.

Below is the real-time context of community issues currently logged in the platform:
${JSON.stringify(reportsContext || [], null, 2)}

Instructions:
- Use this context to answer questions specifically and accurately.
- If they ask for "nearby unresolved issues", look at the reports where status is not 'resolved' and list them with their priority, category, and department.
- If they ask "Which issue is most urgent?", highlight any reports with 'critical' or 'high' priority and explain why.
- If they ask for future hotspots or daily summaries, act as the **Analytics Agent** to provide professional predictive insight based on category density and timestamps.
- Be concise, objective, empathetic, and professional. Provide multilingual support if the user prompts you in Hindi or requests translation.
- Keep recommendations realistic and actionable.
`;

    // Construct the Gemini chat contents array
    const contents: any[] = [];
    
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const turn of chatHistory) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.content }]
        });
      }
    }
    
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await generateContentWithFallback(ai, {
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    res.json({ success: true, reply: response.text || "No reply generated." });
  } catch (error: any) {
    console.error("AI Chat Assistant Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to process chat",
      reply: "Hello, I am having trouble connecting to my cognitive processing engine. Please ensure your GEMINI_API_KEY is properly set in Secrets."
    });
  }
});

// API: Analytics Agent for predictive hotspots and department recommendations
app.post("/api/ai/generate-analytics", async (req, res) => {
  try {
    const { reports } = req.body;
    if (!reports || !Array.isArray(reports)) {
      return res.status(400).json({ error: "Missing reports list" });
    }

    const ai = getGemini();

    const prompt = `
You are the CiviQ AI Analytics Agent. Provide high-level municipal optimization summaries, hotspot predictions, and recommendations.

Here is the full dataset of community issues:
${JSON.stringify(reports.map(r => ({
  category: r.category,
  status: r.status,
  priority: r.priority,
  date: r.date,
  ward: r.ward,
  latitude: r.latitude,
  longitude: r.longitude
})), null, 2)}

Provide an automated intelligence dispatch report in JSON format with:
1. "dailySummary": A concise 2-sentence executive summary of the state of community issues.
2. "weeklyTrendsSummary": A summary of progress, resolved versus pending, and active municipal departments.
3. "predictionsSummary": Predictive analysis of future civic hotspots (e.g. predicting waste collection overflows or storm drainage blockages based on seasonal trends or complaint volume).
4. "recommendations": A list of 3 structured resource allocation recommendations for the municipality. Each recommendation must have:
   - "title": string
   - "description": string
   - "department": string
   - "priority": "low" | "medium" | "high"

Output STRICTLY as a valid JSON object matching these instructions, without any markdown formatting wrappers.
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const cleanedText = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanedText);

    res.json({ success: true, analytics: result });
  } catch (error: any) {
    console.error("Analytics Agent Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to generate AI analytics",
      fallbackAnalytics: {
        dailySummary: "Community activity remains stable with active tracking. Resolve times are normal.",
        weeklyTrendsSummary: "Waste management and sanitation are experiencing higher report counts.",
        predictionsSummary: "Slight hotspot risk predicted in Ward-3 and Ward-5 due to local municipal construction patterns.",
        recommendations: [
          {
            title: "Optimize Waste Routines",
            description: "Direct sanitation trucks to Ward-3 on weekends to prevent garbage pile-ups.",
            department: "Sanitation & Waste",
            priority: "high"
          },
          {
            title: "Road Inspections",
            description: "Schedule visual pothole checks on main intersections in Ward-1.",
            department: "Public Works Dept",
            priority: "medium"
          }
        ]
      }
    });
  }
});

// Serve frontend assets and listen
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CiviQ AI server running on http://localhost:${PORT}`);
  });
}

bootstrap();
