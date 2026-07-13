import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable large payloads for base64 audio streams
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy-loaded Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CTS-Prep & Placement SaaS Platform server is healthy" });
});

// Analyze interview response with customizable Company Profiles and Resume Parsing
app.post("/api/interview/analyze", async (req, res) => {
  try {
    const { history, company, resumeText } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Missing or invalid interview history payload." });
    }

    const ai = getGeminiClient();

    // Map client conversation history to Gemini Content parts
    const contents = history.map((item: any) => {
      if (item.role === "user") {
        if (item.audio) {
          return {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: item.audio,
                  mimeType: item.mimeType || "audio/webm",
                },
              },
            ],
          };
        } else {
          return {
            role: "user",
            parts: [{ text: item.content || "" }],
          };
        }
      } else {
        return {
          role: "model",
          parts: [{ text: item.content || "" }],
        };
      }
    });

    // 1. Dynamic Company Characterizations
    let companyFocus = "";
    const selectedCompany = company || "Cognizant (CTS)";
    if (selectedCompany === "TCS") {
      companyFocus = `Act as a TCS Technical & Managerial Round (TCS Digital/Ninja) panelist. Focus deeply on core computer science foundations (DBMS, OOPs, OS, DSA), standard SQL queries, logical coding, and general managerial adaptability. Maintain a encouraging but highly technical tone.`;
    } else if (selectedCompany === "Infosys") {
      companyFocus = `Act as an Infosys Systems Engineer interviewer. Focus on core logical problem-solving, algorithms, technical design patterns, unit testing, agile software lifecycles, and training adaptability. Maintain a highly structured and analytical approach.`;
    } else if (selectedCompany === "Accenture") {
      companyFocus = `Act as an Accenture Technology Consulting interviewer. Focus on modern cloud paradigms (AWS, Azure, serverless), microservices, system design concepts, consulting-style scenario responses, team alignment, and client value generation.`;
    } else {
      // Cognizant (CTS)
      companyFocus = `Act as a professional Cognizant (CTS) Human Resources and Technical panelist. Keep your tone formal, professional, yet observant. Maintain a structured interview flow: introductions, project tech stack defense, architecture choices, and standard CTS behavioral or situational questions.`;
    }

    // 2. Dynamic Resume Parsing integration
    let resumeInstruction = "";
    if (resumeText && resumeText.trim()) {
      resumeInstruction = `The candidate has provided their Resume. Carefully review their listed technical skills, projects, certifications, and experience:
--- CANDIDATE RESUME ---
${resumeText.trim()}
------------------------
YOUR CONVERSATIONAL CORE:
Formulate challenging, highly specific technical and architectural questions explicitly tailored to their resume. If they mention a React application, ask about hooks, state management, or deployment. If they list SQL, ask about complex joins or indexing. Ask exactly ONE question at a time. Follow up on weak answers or vague architecture explanations rather than skipping blindly to new topics. Reference their past responses to make the interview feel like a continuous, natural live conversation.`;
    } else {
      resumeInstruction = `Since the candidate has not uploaded a resume, conduct a general software engineering fresher interview focusing on standard web technologies, backend databases, and software design principles. Help them define their stack as they respond. Ask exactly ONE question at a time.`;
    }

    const SYSTEM_PROMPT = `You are the advanced intelligence engine for "CTS-Prep Platform" (or the Placement SaaS Platform). You evaluate freshers preparing for corporate placement drives (specifically ${selectedCompany}) using their uploaded resume and live voice data.

YOUR CONVERSATIONAL CORE:
1. ${companyFocus}
2. ${resumeInstruction}
3. Keep the interview interactive. Formulate challenging, highly specific interview questions tailored to their resume or technical major.

YOUR ANALYTICAL CORE:
Listen to the user's audio input. Track linguistic patterns, conceptual technical correctness, communication clarity, and structural weaknesses.
- filler words check: listen for filler words ("uhm", "like", "uh", "ah", "basically").
- fluency: evaluate sentence stumbles, grammar errors, sentence structural faults, and noticeable long pauses or stutters.
- technical accuracy: evaluate how correct their tech stack description, database selection, or project details are.

OUTPUT STRUCTURAL INSTRUCTIONS:
You must reply exclusively in a single JSON block. Do not include any markdown formatting, conversational filler, or text outside of the JSON block. Use this layout:

{
  "next_interview_question": "Your next conversational question or project drill-down as the interviewer.",
  "turn_metrics": {
    "fluency_score_out_of_10": 0.0,
    "technical_accuracy_score_out_of_10": 0.0,
    "filler_words_detected": ["uhm", "like"],
    "filler_word_count": 0,
    "grammar_corrections": ["List out explicit grammatical mistakes or awkward phrasing found in their response."]
  },
  "long_term_tracking": {
    "primary_weakness_identified": "A concise label of what went wrong this turn (e.g., 'Vague explanation of backend logic', 'High filler usage', 'Weak grasp of indexing').",
    "personalized_improvement_tip": "A highly targeted, actionable tip detailing HOW they can speak better or what concept they need to study immediately before the next question."
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            next_interview_question: {
              type: Type.STRING,
              description: "Your next question or follow-up response in your character as the recruiter.",
            },
            turn_metrics: {
              type: Type.OBJECT,
              properties: {
                filler_words_detected: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of detected fillers (e.g. uhm, like, basically).",
                },
                filler_word_count: {
                  type: Type.INTEGER,
                  description: "Total number of filler words detected in the current voice response.",
                },
                grammar_corrections: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Explicit grammatical mistakes or awkward phrasing found in their response.",
                },
                fluency_score_out_of_10: {
                  type: Type.NUMBER,
                  description: "Fluency score out of 10 based on grammar, flow, confidence, filler words, and pauses.",
                },
                technical_accuracy_score_out_of_10: {
                  type: Type.NUMBER,
                  description: "Technical correctness and depth score out of 10 for the concepts explained.",
                },
              },
              required: [
                "filler_words_detected",
                "filler_word_count",
                "grammar_corrections",
                "fluency_score_out_of_10",
                "technical_accuracy_score_out_of_10",
              ],
            },
            long_term_tracking: {
              type: Type.OBJECT,
              properties: {
                primary_weakness_identified: {
                  type: Type.STRING,
                  description: "A concise label of what went wrong this turn (e.g., 'Vague explanation of backend logic', 'High filler usage').",
                },
                personalized_improvement_tip: {
                  type: Type.STRING,
                  description: "A highly targeted, actionable tip detailing HOW they can speak better or what concept they need to study immediately.",
                },
              },
              required: [
                "primary_weakness_identified",
                "personalized_improvement_tip"
              ]
            }
          },
          required: ["next_interview_question", "turn_metrics", "long_term_tracking"],
        },
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from the Gemini model.");
    }

    const result = JSON.parse(text.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Gemini interview analysis error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while communicating with the evaluation model.",
    });
  }
});

// Configure Vite middleware in development or static hosting in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
    console.log(`[CTS-Prep AI Server] Running at http://localhost:${PORT}`);
  });
}

setupServer();
