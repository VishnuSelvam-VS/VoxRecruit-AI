export interface EvaluationMetrics {
  filler_words_detected: string[];
  filler_word_count: number;
  fluency_score_out_of_10: number;
  technical_accuracy_score_out_of_10: number;
  primary_weakness_identified: string;
  personalized_improvement_tip: string;
  grammar_corrections?: string[]; // Optional backward compatibility or extra notes
}

export interface InterviewMessage {
  id: string;
  role: "user" | "model";
  content: string;
  audio?: string; // Base64 audio representation
  mimeType?: string;
  timestamp: string;
  metrics?: EvaluationMetrics; // Evaluator metrics for user responses
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  company: "Cognizant (CTS)" | "TCS" | "Infosys" | "Accenture";
  status: "idle" | "interviewing" | "completed";
  history: InterviewMessage[];
  currentQuestion: string;
  lastMetrics?: EvaluationMetrics;
  averageFluency: number;
  averageTechnical: number;
  totalFillers: number;
  resumeText?: string;
}

export interface SampleCandidateResponse {
  name: string;
  description: string;
  transcript: string;
  audioBase64: string; // pre-encoded base64 audio representation of standard speaking styles
  mimeType: string;
}

export interface CompanyConfig {
  id: string;
  name: string;
  logoColor: string;
  tagline: string;
  focus: string;
  defaultQuestions: string[];
}
