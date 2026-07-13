import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { 
  Mic, 
  Square, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  User, 
  BookOpen, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Play, 
  Send,
  UserCheck,
  Award,
  History,
  FileText,
  Building,
  Target,
  ArrowRight,
  Brain,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  Lock,
  ArrowLeft,
  XCircle,
  HelpCircle,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { COMPANIES, SAMPLE_CANDIDATE_RESPONSES, SAMPLE_RESUMES } from "./data/mockData";
import { InterviewMessage, EvaluationMetrics, CompanyConfig } from "./types";

export default function App() {
  // Setup & Config states
  const [candidateName, setCandidateName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyConfig>(COMPANIES[0]);
  const [resumeText, setResumeText] = useState("");
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Conversation history
  const [history, setHistory] = useState<InterviewMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Input forms & audio states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [textInput, setTextInput] = useState("");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(-1);

  // Settings & Utilities
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<"dashboard" | "resume">("dashboard");

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const historyEndRef = useRef<HTMLDivElement | null>(null);

  // Dynamic colors helper mapping based on the selected company
  const getAccentColors = (id: string) => {
    switch (id) {
      case "TCS":
        return {
          text: "text-emerald-400",
          textLight: "text-emerald-300",
          textDark: "text-emerald-500",
          bg: "bg-emerald-500",
          bgLight: "bg-emerald-500/10",
          bgHover: "hover:bg-emerald-500/20",
          border: "border-emerald-500/30",
          borderStrong: "border-emerald-500/60",
          focusRing: "focus:border-emerald-500/80 focus:ring-emerald-500/20",
          gradient: "from-teal-500 to-emerald-500",
          gradientBg: "bg-gradient-to-br from-teal-950/40 to-emerald-950/40",
          gradientText: "bg-gradient-to-r from-teal-400 to-emerald-400",
          glow: "shadow-emerald-500/20",
          ring: "ring-emerald-500/20",
          badge: "bg-emerald-950/60 text-emerald-400 border-emerald-500/30",
          glowBg: "from-emerald-500/5 to-teal-500/5"
        };
      case "Infosys":
        return {
          text: "text-cyan-400",
          textLight: "text-cyan-300",
          textDark: "text-cyan-500",
          bg: "bg-cyan-500",
          bgLight: "bg-cyan-500/10",
          bgHover: "hover:bg-cyan-500/20",
          border: "border-cyan-500/30",
          borderStrong: "border-cyan-500/60",
          focusRing: "focus:border-cyan-500/80 focus:ring-cyan-500/20",
          gradient: "from-cyan-500 to-blue-500",
          gradientBg: "bg-gradient-to-br from-cyan-950/40 to-blue-950/40",
          gradientText: "bg-gradient-to-r from-cyan-400 to-blue-400",
          glow: "shadow-cyan-500/20",
          ring: "ring-cyan-500/20",
          badge: "bg-cyan-950/60 text-cyan-400 border-cyan-500/30",
          glowBg: "from-cyan-500/5 to-blue-500/5"
        };
      case "Accenture":
        return {
          text: "text-purple-400",
          textLight: "text-purple-300",
          textDark: "text-purple-500",
          bg: "bg-purple-500",
          bgLight: "bg-purple-500/10",
          bgHover: "hover:bg-purple-500/20",
          border: "border-purple-500/30",
          borderStrong: "border-purple-500/60",
          focusRing: "focus:border-purple-500/80 focus:ring-purple-500/20",
          gradient: "from-purple-500 to-pink-500",
          gradientBg: "bg-gradient-to-br from-purple-950/40 to-pink-950/40",
          gradientText: "bg-gradient-to-r from-purple-400 to-pink-400",
          glow: "shadow-purple-500/20",
          ring: "ring-purple-500/20",
          badge: "bg-purple-950/60 text-purple-400 border-purple-500/30",
          glowBg: "from-purple-500/5 to-pink-500/5"
        };
      default: // Cognizant (CTS)
        return {
          text: "text-indigo-400",
          textLight: "text-indigo-300",
          textDark: "text-indigo-500",
          bg: "bg-indigo-500",
          bgLight: "bg-indigo-500/10",
          bgHover: "hover:bg-indigo-500/20",
          border: "border-indigo-500/30",
          borderStrong: "border-indigo-500/60",
          focusRing: "focus:border-indigo-500/80 focus:ring-indigo-500/20",
          gradient: "from-blue-500 to-indigo-500",
          gradientBg: "bg-gradient-to-br from-blue-950/40 to-indigo-950/40",
          gradientText: "bg-gradient-to-r from-blue-400 to-indigo-400",
          glow: "shadow-indigo-500/20",
          ring: "ring-indigo-500/20",
          badge: "bg-indigo-950/60 text-indigo-400 border-indigo-500/30",
          glowBg: "from-blue-500/5 to-indigo-500/5"
        };
    }
  };

  const activeColors = getAccentColors(selectedCompany.id);

  // Speak incoming question through standard text-to-speech
  const speakQuestion = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean string representation
    const cleanedText = text.replace(/["""]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en-") && v.name.includes("Google")) || 
                         voices.find(v => v.lang.startsWith("en-")) || 
                         voices[0];
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleReplayQuestion = () => {
    if (currentQuestion) {
      speakQuestion(currentQuestion);
    }
  };

  // Trigger speech when a new question arrives
  useEffect(() => {
    if (currentQuestion && isSessionStarted) {
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion, isSessionStarted]);

  // Handle recording timer countdown
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Keep chat scrolls pinned to bottom
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, isAnalyzing]);

  // Load standard voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Initialize placing session
  const handleStartSession = () => {
    const finalName = candidateName.trim() || "Fresher Candidate";
    const initialQuestion = selectedCompany.defaultQuestions[0];
    
    setCurrentQuestion(initialQuestion);
    setHistory([
      {
        id: "start-hr-initial",
        role: "model",
        content: initialQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    
    setIsSessionStarted(true);
    setCurrentStep(1);
    setErrorMessage("");
  };

  // Start micro recording
  const startRecording = async () => {
    setSelectedPresetIndex(-1);
    setErrorMessage("");
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setMicPermissionDenied(false);
    } catch (err) {
      console.error("Mic access failed:", err);
      setMicPermissionDenied(true);
      setErrorMessage("Microphone access is locked. Please try utilizing the Pre-loaded Voice Simulators below to test high-accuracy raw voice processing instantly!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload custom resume file (.txt only)
  const handleResumeFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setResumeText(text);
    };
    reader.readAsText(file);
  };

  // Core API Submission Proxy
  const submitResponse = async (audioBlobToUse: Blob | null, textFallback: string, isPresetMode: boolean = false) => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    setErrorMessage("");

    let base64Audio = "";
    let mimeType = "audio/webm";

    try {
      // 1. Process Raw Audio Blob conversion
      if (audioBlobToUse) {
        base64Audio = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const resultStr = reader.result as string;
            const base64Data = resultStr.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioBlobToUse);
        });
      } else if (isPresetMode && selectedPresetIndex >= 0) {
        base64Audio = SAMPLE_CANDIDATE_RESPONSES[selectedPresetIndex].audioBase64;
        mimeType = SAMPLE_CANDIDATE_RESPONSES[selectedPresetIndex].mimeType;
      }

      const displayTranscript = isPresetMode && selectedPresetIndex >= 0 
        ? SAMPLE_CANDIDATE_RESPONSES[selectedPresetIndex].transcript
        : (textFallback || "[Audio speech response submitted]");

      // 2. Append User response to history log
      const userMsgId = `msg-${Date.now()}-user`;
      const newUserMessage: InterviewMessage = {
        id: userMsgId,
        role: "user",
        content: displayTranscript,
        audio: base64Audio || undefined,
        mimeType: mimeType,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const updatedHistory = [...history, newUserMessage];
      setHistory(updatedHistory);
      setTextInput("");
      setRecordedBlob(null);

      // 3. Dispatch to Gemini Corporate Evaluation API
      const response = await fetch("/api/interview/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: updatedHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
            audio: msg.audio,
            mimeType: msg.mimeType
          })),
          company: selectedCompany.name,
          resumeText: resumeText || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to contact corporate analysis service.");
      }

      const rawResult = await response.json();

      // 4. Extract structured parameters with safe defaults
      const turnMetrics = rawResult.turn_metrics || {};
      const tracking = rawResult.long_term_tracking || {};

      const metrics: EvaluationMetrics = {
        filler_words_detected: turnMetrics.filler_words_detected || [],
        filler_word_count: turnMetrics.filler_word_count ?? 0,
        fluency_score_out_of_10: turnMetrics.fluency_score_out_of_10 ?? 7.0,
        technical_accuracy_score_out_of_10: turnMetrics.technical_accuracy_score_out_of_10 ?? 7.0,
        primary_weakness_identified: tracking.primary_weakness_identified || "None identified",
        personalized_improvement_tip: tracking.personalized_improvement_tip || "Maintain your confidence.",
        grammar_corrections: turnMetrics.grammar_corrections || []
      };

      const nextQuestionText = rawResult.next_interview_question || "Let's proceed with further technical aspects.";

      // 5. Update user message with metrics
      setHistory(prev => 
        prev.map(msg => msg.id === userMsgId ? { ...msg, metrics } : msg)
      );

      // 6. Append recruiter reply
      const modelMsgId = `msg-${Date.now()}-model`;
      setHistory(prev => [
        ...prev,
        {
          id: modelMsgId,
          role: "model",
          content: nextQuestionText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      setCurrentQuestion(nextQuestionText);
      setCurrentStep(prev => prev + 1);
      setSelectedPresetIndex(-1);

    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage(err.message || "Communication pipeline timed out. Please try again or toggle backup text options.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecordSubmit = () => {
    if (recordedBlob) {
      submitResponse(recordedBlob, "", false);
    }
  };

  const handleTextSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    submitResponse(null, textInput.trim(), false);
  };

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setRecordedBlob(null);
  };

  const handleSubmitPreset = () => {
    if (selectedPresetIndex >= 0) {
      submitResponse(null, SAMPLE_CANDIDATE_RESPONSES[selectedPresetIndex].transcript, true);
    }
  };

  const handleResetSession = () => {
    setHistory([]);
    setCurrentQuestion("");
    setIsSessionStarted(false);
    setCurrentStep(0);
    setRecordedBlob(null);
    setIsRecording(false);
    setSelectedPresetIndex(-1);
    setErrorMessage("");
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Metrics aggregates
  const userMessages = history.filter(m => m.role === "user");
  const gradedMessages = userMessages.filter(m => m.metrics !== undefined);

  const lastMetrics = gradedMessages.length > 0 
    ? gradedMessages[gradedMessages.length - 1].metrics 
    : undefined;

  const averageFluency = gradedMessages.length > 0
    ? Number((gradedMessages.reduce((sum, m) => sum + (m.metrics?.fluency_score_out_of_10 || 0), 0) / gradedMessages.length).toFixed(1))
    : 0;

  const averageTechnical = gradedMessages.length > 0
    ? Number((gradedMessages.reduce((sum, m) => sum + (m.metrics?.technical_accuracy_score_out_of_10 || 0), 0) / gradedMessages.length).toFixed(1))
    : 0;

  const totalFillers = gradedMessages.reduce((sum, m) => sum + (m.metrics?.filler_word_count || 0), 0);

  // Compile weaknesses history for long-term tracking
  const compiledWeaknesses = gradedMessages
    .map(m => m.metrics?.primary_weakness_identified)
    .filter((w): w is string => !!w && w !== "None identified" && w !== "None");

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100 font-sans flex flex-col antialiased relative overflow-x-hidden">
      
      {/* Decorative Blur Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      
      {/* SaaS Dashboard Top Bar */}
      <header className="h-20 border-b border-slate-800/80 bg-[#080d1a]/80 backdrop-blur-md px-6 flex items-center justify-between shadow-2xl z-30 sticky top-0">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-gradient-to-tr ${activeColors.gradient} rounded-2xl flex items-center justify-center shadow-lg ${activeColors.glow} transition-all duration-500`}>
            <Brain className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white uppercase font-display">
                VoxRecruit AI
              </span>
              <span className={`bg-gradient-to-r ${activeColors.gradient} text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm`}>
                PRO
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
              Corporate Recruitment Simulator
            </span>
          </div>
        </div>

        {isSessionStarted && (
          <div className="flex items-center gap-4">
            {/* Quick stats in header */}
            <div className="hidden md:flex items-center gap-5 text-xs bg-slate-900/80 border border-slate-800/80 px-4 py-2 rounded-2xl">
              <div className="flex flex-col items-start">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-mono font-bold">Target Company</span>
                <span className={`font-bold ${activeColors.text} text-sm transition-colors duration-500`}>{selectedCompany.name}</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800"></div>
              <div className="flex flex-col items-start">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-mono font-bold">Fluency Avg</span>
                <span className="font-extrabold text-emerald-400 text-sm font-mono">{averageFluency > 0 ? `${averageFluency}/10` : "—"}</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800"></div>
              <div className="flex flex-col items-start">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-mono font-bold">Tech Accuracy</span>
                <span className="font-extrabold text-indigo-400 text-sm font-mono">{averageTechnical > 0 ? `${averageTechnical}/10` : "—"}</span>
              </div>
            </div>

            <button 
              onClick={handleResetSession}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:border-slate-700 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Drill
            </button>
          </div>
        )}
      </header>

      {/* Main Container Workspace */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col justify-center relative z-20">
        
        {!isSessionStarted ? (
          /* ================= ONBOARDING CONFIGURATION PANEL ================= */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#090e1a]/95 rounded-[32px] p-6 md:p-10 border border-slate-800/80 shadow-3xl relative overflow-hidden"
          >
            {/* Elegant glass design accents */}
            <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${activeColors.glowBg} rounded-full filter blur-[100px] pointer-events-none transition-all duration-500`}></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>

            {/* Left Column: Profile Selector (7 columns) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
                  <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                  Adaptive Generative AI Cockpit
                </div>
                <h1 className="text-4xl font-extrabold font-display mt-4 tracking-tight text-white leading-tight">
                  VoxRecruit <br />
                  <span className={`bg-gradient-to-r ${activeColors.gradient} bg-clip-text text-transparent transition-all duration-500`}>
                    AI Recruiter
                  </span>
                </h1>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed max-w-lg">
                  Deploy corporate assessment benchmarks with multimodal speech parameters. Track your filler word frequency, communication fluency, and software architectural defenses instantly.
                </p>
              </div>

              {/* 1. Candidate Parameters */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    Candidate's Full Name
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Enter your name (e.g., Arjun Sharma)..."
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full bg-[#121829]/90 border border-slate-800/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none rounded-xl py-3 px-4 text-xs text-white placeholder-slate-500 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* 2. Company Benchmarks Card grid */}
                <div className="flex flex-col gap-3 pt-1">
                  <label className="text-[10px] font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    Target Corporate Benchmark
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {COMPANIES.map((company) => {
                      const isSelected = selectedCompany.id === company.id;
                      const companyColors = getAccentColors(company.id);
                      return (
                        <button
                          key={company.id}
                          onClick={() => setSelectedCompany(company)}
                          className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative flex flex-col justify-between h-24 group ${
                            isSelected 
                              ? `bg-[#101930] ${companyColors.borderStrong} shadow-lg shadow-indigo-500/5 text-white` 
                              : "bg-[#0b101f] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {isSelected && (
                            <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${companyColors.bg} animate-pulse shadow-md`}></span>
                          )}
                          <div>
                            <span className="font-extrabold text-sm block font-display tracking-tight text-slate-100 group-hover:text-white transition-colors">
                              {company.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate mt-1">
                              {company.tagline}
                            </span>
                          </div>
                          
                          <span className={`text-[8px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-md mt-2 w-max text-xs ${
                            isSelected 
                              ? `${companyColors.badge}` 
                              : "bg-slate-900 text-slate-500"
                          }`}>
                            {company.id} Track
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Focus parameters explanation */}
              <div className={`p-4 bg-slate-900/40 border ${activeColors.border} rounded-2xl transition-colors duration-500 flex gap-3`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${activeColors.gradient} flex items-center justify-center shrink-0`}>
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className={`text-[9px] font-black tracking-wider uppercase font-mono block ${activeColors.text}`}>
                    {selectedCompany.name} Assessment Focus Mode
                  </span>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {selectedCompany.focus}
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartSession}
                className={`w-full py-4 bg-gradient-to-r ${activeColors.gradient} hover:opacity-95 text-white rounded-2xl font-bold text-xs shadow-xl ${activeColors.glow} transition-all flex items-center justify-center gap-2 cursor-pointer group uppercase tracking-wider`}
              >
                Launch Professional Placement Drill
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

            {/* Right Column: Resume Parsing Board (5 columns) */}
            <div className="lg:col-span-5 bg-[#0b101f]/80 border border-slate-800/80 rounded-[28px] p-5 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 font-mono flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-indigo-400" />
                    Resume Customization
                  </span>
                  <span className="bg-indigo-950/80 text-indigo-400 border border-indigo-900/40 text-[9px] font-mono font-black px-2 py-0.5 rounded">
                    TXT FILE
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Upload or paste your professional resume so the Gemini model can customize questions for your specific framework choices, DBMS stacks, and project designs.
                </p>

                {/* Pre-loaded resume presets */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-wider block">
                    Choose Template Profile:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {SAMPLE_RESUMES.map((resPreset, idx) => {
                      const isPresetSelected = resumeText === resPreset.text;
                      return (
                        <button
                          key={idx}
                          onClick={() => setResumeText(resPreset.text)}
                          className={`text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between group ${
                            isPresetSelected
                              ? "bg-indigo-950/30 border-indigo-500/60 text-indigo-300"
                              : "bg-[#0f1426]/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="truncate">
                            <span className={`font-bold block text-xs ${isPresetSelected ? "text-white" : "text-slate-300 group-hover:text-slate-100"}`}>
                              {resPreset.title}
                            </span>
                            <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                              {idx === 0 ? "MERN Stack • Redux • socket.io" : "FastAPI • Python • AWS Cloud"}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isPresetSelected ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-800 text-transparent"}`}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct text area pasting */}
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-wider block">
                    Or Paste Resume Plain-Text:
                  </span>
                  <textarea
                    placeholder="Pasting technical skills, languages, tools and college project descriptions here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full h-44 bg-[#0a0d17] border border-slate-800/80 rounded-xl p-3 text-[11px] font-mono text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none resize-none placeholder-slate-700 leading-relaxed"
                  />
                </div>
              </div>

              {/* Upload input button */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                <span className="text-[9px] font-bold text-slate-500 font-mono uppercase">
                  Load Custom TXT Resume:
                </span>
                <label className="px-3 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-[10px] text-slate-300 font-bold tracking-wider font-mono cursor-pointer transition-all">
                  Choose File
                  <input 
                    type="file" 
                    accept=".txt" 
                    onChange={handleResumeFileUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

          </motion.div>
        ) : (
          /* ================= ACTIVE INTERACTIVE SAAS WORKSPACE ================= */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Active session top status indicator bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#090e1a]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800/60 shadow-xl">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isSpeaking ? "bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" : "bg-emerald-500 shadow-[0_0_8px_#10b981]"}`}></div>
                <span className="text-xs text-slate-300 font-mono tracking-wider uppercase font-bold flex items-center gap-1.5">
                  Placement Session Active 
                  <span className="text-slate-500">•</span> 
                  <span className="text-indigo-400">{selectedCompany.name} Assessment</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
                <div className="bg-slate-950 border border-slate-800/60 px-2.5 py-1 rounded-lg text-slate-400">
                  ROUND TRACK: <strong className="text-white">TURN {currentStep}</strong>
                </div>
                <div className="bg-slate-950 border border-slate-800/60 px-2.5 py-1 rounded-lg text-slate-400">
                  FILLERS CAPTURED: <strong className="text-amber-400">{totalFillers}</strong>
                </div>
              </div>
            </div>
            
            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-auto">
              
              {/* Box 1: Virtual Panelist Avatar (Span 8) */}
              <div id="bento-panelist-card" className="col-span-1 lg:col-span-8 bg-[#090e1a]/95 rounded-[32px] p-6 border border-slate-800/60 shadow-2xl flex flex-col justify-between relative overflow-hidden h-[320px] group transition-all duration-300 hover:border-slate-700/80">
                {/* Visual Backdrop */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0d1428] via-[#090e1a] to-[#04060c] opacity-90 z-0"></div>
                
                {/* Header elements inside panel */}
                <div className="flex items-center justify-between relative z-10 w-full">
                  <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-3 py-1 rounded-full">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-red-500 animate-ping" : "bg-emerald-500"}`}></span>
                    <span className="text-[9px] text-slate-300 font-mono tracking-wider uppercase font-bold">
                      {isSpeaking ? "MOCK AUDITOR TRANSMITTING" : "HR AUDITOR ACTIVE"}
                    </span>
                  </div>

                  {/* Audio read-back */}
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-slate-400 font-mono">Panelist Voice</span>
                    <button 
                      onClick={() => setTtsEnabled(!ttsEnabled)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm flex items-center justify-center ${
                        ttsEnabled 
                          ? `${activeColors.badge}` 
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                      }`}
                      title={ttsEnabled ? "Mute panelist audio" : "Unmute panelist audio"}
                    >
                      {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Avatar Visual stage */}
                <div className="flex flex-col items-center justify-center relative z-10 my-auto">
                  <div className="relative">
                    {/* Ring ping overlay */}
                    <div className={`absolute -inset-4 rounded-full bg-indigo-500/10 filter blur-md transition-all duration-1000 ${
                      isSpeaking ? "animate-ping scale-125 opacity-80" : "scale-100 opacity-0"
                    }`}></div>
                    
                    <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center p-1.5 transition-all duration-500 ${
                      isSpeaking ? `${activeColors.borderStrong} shadow-[0_0_15px_rgba(99,102,241,0.2)]` : "border-slate-800"
                    }`}>
                      <div className="w-full h-full rounded-full bg-[#0a0f1d] flex items-center justify-center border border-slate-850 overflow-hidden relative">
                        <UserCheck className={`w-12 h-12 transition-transform duration-500 ${isSpeaking ? `${activeColors.text} scale-110` : "text-slate-400"}`} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <h3 className="text-white font-extrabold text-base font-display">Rajesh Kumar</h3>
                    <p className="text-slate-400 text-xs font-mono font-bold mt-0.5">
                      Senior Talent Partner • <span className={`${activeColors.text} transition-colors duration-500`}>{selectedCompany.name} Benchmarks</span>
                    </p>
                  </div>
                </div>

                {/* Wave dynamic simulation */}
                <div className="h-8 flex items-end justify-center gap-1.5 relative z-10 w-full px-8">
                  {isSpeaking ? (
                    Array.from({ length: 28 }).map((_, i) => {
                      // Generate some rhythmic wave heights
                      const duration = 0.5 + Math.random() * 0.8;
                      return (
                        <motion.div 
                          key={i}
                          className={`w-1 rounded-full ${activeColors.bg}`}
                          initial={{ height: 4 }}
                          animate={{ height: [4, 12 + Math.random() * 20, 4] }}
                          transition={{ repeat: Infinity, duration: duration, ease: "easeInOut", delay: i * 0.05 }}
                        />
                      );
                    })
                  ) : isAnalyzing ? (
                    <div className="flex items-center gap-2.5 text-[11px] text-indigo-400 font-mono font-bold bg-indigo-950/40 px-4 py-1.5 rounded-full border border-indigo-900/40 animate-pulse mb-1">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                      <span>Auditing linguistic structures and project parameters...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mb-1">
                      <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                      <span>Panelist silent. Deliver your response via Mic or Preset Simulators below.</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Box 2: Placement SaaS Progress Gauges (Span 4) */}
              <div id="bento-fluency-gauge" className="col-span-1 lg:col-span-4 bg-[#090e1a]/95 rounded-[32px] p-6 border border-slate-800/60 shadow-2xl flex flex-col justify-between items-center text-center h-[320px] transition-all duration-300 hover:border-slate-700/80">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Dual Rating Analytics
                </span>

                {/* Gauges arrangement side by side */}
                <div className="flex items-center justify-around w-full my-auto gap-4">
                  
                  {/* Gauge A: Fluency */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center w-26 h-26">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="52" cy="52" r="42" stroke="#0e1424" strokeWidth="7" fill="transparent" />
                        <motion.circle 
                          cx="52" cy="52" r="42" 
                          stroke={averageFluency >= 8.0 ? "#10b981" : averageFluency >= 6.5 ? "#3b82f6" : "#f59e0b"} 
                          strokeWidth="7" fill="transparent" 
                          strokeDasharray="264" 
                          initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * (averageFluency || 0)) / 10 }}
                          transition={{ duration: 1.0, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center flex flex-col justify-center items-center">
                        <span className="text-2xl font-black text-white font-mono tracking-tight">{averageFluency > 0 ? averageFluency : "—"}</span>
                        <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest font-bold">Fluency</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-bold mt-2 font-mono">Speech Flow</span>
                  </div>

                  {/* Gauge B: Tech Accuracy */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center w-26 h-26">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="52" cy="52" r="42" stroke="#0e1424" strokeWidth="7" fill="transparent" />
                        <motion.circle 
                          cx="52" cy="52" r="42" 
                          stroke={averageTechnical >= 8.0 ? "#10b981" : averageTechnical >= 6.5 ? "#6366f1" : "#f59e0b"} 
                          strokeWidth="7" fill="transparent" 
                          strokeDasharray="264" 
                          initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * (averageTechnical || 0)) / 10 }}
                          transition={{ duration: 1.0, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center flex flex-col justify-center items-center">
                        <span className="text-2xl font-black text-white font-mono tracking-tight">{averageTechnical > 0 ? averageTechnical : "—"}</span>
                        <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest font-bold">Tech</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-bold mt-2 font-mono">Accuracy</span>
                  </div>

                </div>

                <div className="w-full bg-[#0c1222] py-2.5 px-4 border border-slate-850 rounded-2xl text-center">
                  {gradedMessages.length > 0 ? (
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Benchmark score steady. Achieve <strong className="text-indigo-400 font-mono">8.0+</strong> overall to clear corporate talent acquisition thresholds.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-normal italic">
                      Performance rating curves will compute immediately after first voice submission.
                    </p>
                  )}
                </div>
              </div>

              {/* Box 3: Recruiter interrogative Question (Span 8) */}
              <div id="bento-question-box" className="col-span-1 lg:col-span-8 bg-[#090e1a]/95 rounded-[32px] p-6 border border-indigo-950/40 shadow-xl flex flex-col justify-center relative min-h-[160px] transition-all duration-300 hover:border-indigo-900/40">
                <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
                  <button 
                    onClick={handleReplayQuestion}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer border border-slate-800/80 shadow-md flex items-center justify-center"
                    title="Speak current question aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <span className={`text-[10px] font-black uppercase tracking-widest ${activeColors.text} font-mono mb-3 block`}>
                  Incoming Recruiter Interrogative Question
                </span>
                <h2 className="text-lg md:text-xl font-serif text-slate-100 italic leading-relaxed pr-10 font-medium">
                  "{currentQuestion}"
                </h2>
              </div>

              {/* Box 4: Filler Auditor & Linguistic corrections (Span 4) */}
              <div id="bento-filler-card" className="col-span-1 lg:col-span-4 bg-[#090e1a]/95 rounded-[32px] p-6 border border-slate-800/60 shadow-xl flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                    Linguistic Auditor
                  </span>
                  <span className="px-2.5 py-0.5 bg-red-950/60 border border-red-900/40 text-red-400 text-[9px] font-mono font-black rounded-lg uppercase">
                    {totalFillers} Fillers
                  </span>
                </div>

                {lastMetrics ? (
                  <div className="space-y-3.5 my-auto">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-slate-400 font-mono block w-full">Linguistic Slip-ups:</span>
                      {lastMetrics.filler_words_detected.length > 0 ? (
                        lastMetrics.filler_words_detected.map((fl, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-950/40 border border-amber-900/30 text-amber-400 text-[10px] font-mono rounded-lg font-bold">
                            "{fl}"
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> No filler words detected in last response!
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 border-t border-slate-850 pt-3">
                      <span className="font-extrabold text-red-400/90 block uppercase tracking-wider text-[9px] font-mono">Grammar & Phrasing Check:</span>
                      <p className="italic mt-1 leading-relaxed text-slate-300 font-sans">
                        {lastMetrics.grammar_corrections && lastMetrics.grammar_corrections.length > 0 
                          ? `"${lastMetrics.grammar_corrections[0]}"` 
                          : "Flawless sentence structure detected. Great job!"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 leading-relaxed my-auto italic">
                    Linguistic speech habits ("uh", "like", "basically") and sentence improvement recommendations will appear here in real-time.
                  </p>
                )}
              </div>

              {/* Box 5: Long-Term Weakness & Personalized Feedback card (Span 12) */}
              <div id="bento-tracking-tracker" className={`col-span-1 lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 bg-indigo-950/30 border ${activeColors.border} rounded-[32px] p-6 shadow-2xl text-white relative overflow-hidden transition-all duration-300 hover:border-indigo-900/40`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-xl pointer-events-none"></div>

                {/* Column A (Primary Weakness - 4 Cols) */}
                <div className="col-span-1 md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-indigo-900/20 pb-4 md:pb-0 md:pr-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 font-mono flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-400 animate-pulse" />
                      Critical Weakness Highlight
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-3 leading-snug">
                      {lastMetrics ? lastMetrics.primary_weakness_identified : "Awaiting response data..."}
                    </h4>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono mt-4 uppercase tracking-wider block font-bold">
                    Refreshed every interview turn
                  </span>
                </div>

                {/* Column B (Actionable Tip - 8 Cols) */}
                <div className="col-span-1 md:col-span-8 flex flex-col justify-between md:pl-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 font-mono flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-indigo-400" />
                      Personalized Study Roadmap Tip
                    </span>
                    <p className="text-xs text-indigo-200 leading-relaxed mt-3 italic font-sans">
                      {lastMetrics ? `"${lastMetrics.personalized_improvement_tip}"` : "Please submit a voice response or simulate a mock style above to generate high-fidelity corporate placement recommendations."}
                    </p>
                  </div>
                  
                  {/* Aggregated progress status bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-indigo-900/20 text-[11px] text-indigo-300 font-mono font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Benchmark Clearance Status: <strong className="text-white">{averageFluency >= 7.5 ? "ELIGIBLE" : "PENDING TRAINING"}</strong>
                    </span>
                    <span className="text-indigo-400">
                      Assessment Stack: {resumeText ? "Customized (Resume Matched)" : "General Engineering"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Box 6: Live Input Controls Deck (Span 8) */}
              <div id="bento-input-dock" className="col-span-1 lg:col-span-8 bg-[#0b101f]/95 rounded-[32px] p-6 border border-slate-800/80 shadow-2xl flex flex-col gap-5 transition-all duration-300 hover:border-slate-700/80">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono">
                    Candidate Response Terminal
                  </span>
                  {recordedBlob && (
                    <span className="px-3 py-0.5 bg-emerald-950/80 border border-emerald-900/40 text-emerald-400 text-[9px] font-mono font-bold rounded-full">
                      AUDIO BLOB BUFFER READY
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Mic Panel */}
                  <div className="bg-[#060913] rounded-2xl p-5 border border-slate-800/60 flex flex-col justify-between gap-4 min-h-[160px]">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                        <Mic className="w-4.5 h-4.5 text-indigo-400" />
                        Microphone Audio Input
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Speak your response. We will capture and analyze the raw audio stream.
                      </p>
                    </div>

                    {micPermissionDenied && (
                      <span className="text-[10px] text-amber-400 leading-relaxed bg-amber-950/40 border border-amber-900/30 p-2.5 rounded-xl">
                        Mic access blocked. Please use the Voice Simulator profiles below.
                      </span>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      {!isRecording ? (
                        <button
                          onClick={startRecording}
                          disabled={isAnalyzing}
                          className={`flex-1 py-3 bg-gradient-to-r ${activeColors.gradient} hover:opacity-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${activeColors.glow}`}
                        >
                          <Mic className="w-4 h-4 animate-pulse" />
                          Record Response
                        </button>
                      ) : (
                        <button
                          onClick={stopRecording}
                          className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse shadow-lg shadow-red-500/10"
                        >
                          <Square className="w-4 h-4" />
                          Stop Recording ({recordingSeconds}s)
                        </button>
                      )}

                      {recordedBlob && !isRecording && (
                        <button
                          onClick={handleRecordSubmit}
                          disabled={isAnalyzing}
                          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                        >
                          <Send className="w-4 h-4" />
                          Send
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Simulator Presets */}
                  <div className="bg-[#060913] rounded-2xl p-5 border border-slate-800/60 flex flex-col justify-between gap-4 min-h-[160px]">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                        Speech Preset Simulators
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Rehearse with standard pre-recorded candidate speaking profiles.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      {SAMPLE_CANDIDATE_RESPONSES.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectPreset(idx)}
                          className={`w-full text-left px-3 py-2 rounded-xl border text-[11px] transition-all flex items-center justify-between cursor-pointer ${
                            selectedPresetIndex === idx 
                              ? "bg-indigo-950/50 border-indigo-500/80 text-indigo-200" 
                              : "bg-[#0c0f1c] border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-bold">{preset.name}</span>
                          </div>
                          <Play className={`w-3 h-3 ${selectedPresetIndex === idx ? "text-indigo-400 animate-pulse" : "text-slate-500"}`} />
                        </button>
                      ))}
                    </div>

                    {selectedPresetIndex >= 0 && (
                      <button
                        onClick={handleSubmitPreset}
                        disabled={isAnalyzing}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Submit Simulated Audio
                      </button>
                    )}
                  </div>

                </div>

                {/* Text Backup Box */}
                <form onSubmit={handleTextSubmit} className="flex items-center gap-3 pt-3 border-t border-slate-850">
                  <input 
                    type="text" 
                    placeholder="Provide a backup text response instead..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={isRecording || isAnalyzing}
                    className="flex-1 bg-[#060913] border border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none rounded-xl py-3 px-4 text-xs text-white placeholder-slate-600 disabled:opacity-50 font-sans leading-relaxed"
                  />
                  <button
                    type="submit"
                    disabled={isRecording || isAnalyzing || !textInput.trim()}
                    className="py-3 px-5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-extrabold cursor-pointer transition-all uppercase tracking-wider"
                  >
                    Send Text
                  </button>
                </form>

                {errorMessage && (
                  <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <XCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Box 7: Real-Time SaaS Analytics Dashboard Tab Panel (Span 4) */}
              <div id="bento-analytics-board" className="col-span-1 lg:col-span-4 bg-[#090e1a]/95 rounded-[32px] p-6 border border-slate-800/60 shadow-2xl flex flex-col justify-between h-full min-h-[320px] transition-all duration-300 hover:border-slate-700/80">
                <div className="space-y-5 h-full flex flex-col">
                  
                  {/* Selector tabs inside Box */}
                  <div className="flex border-b border-slate-850 pb-3 gap-4 text-[10px] font-mono uppercase tracking-widest font-black">
                    <button 
                      onClick={() => setActiveTab("dashboard")}
                      className={`pb-1 cursor-pointer transition-all ${activeTab === "dashboard" ? `${activeColors.text} border-b-2 border-indigo-500` : "text-slate-500 hover:text-slate-300"}`}
                    >
                      Trend Curve
                    </button>
                    <button 
                      onClick={() => setActiveTab("resume")}
                      className={`pb-1 cursor-pointer transition-all ${activeTab === "resume" ? `${activeColors.text} border-b-2 border-indigo-500` : "text-slate-500 hover:text-slate-300"}`}
                    >
                      Active Resume
                    </button>
                  </div>

                  {/* Tab A: Learning Trend Graph */}
                  {activeTab === "dashboard" && (
                    <div className="flex-1 flex flex-col justify-between pt-1">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-indigo-400 animate-pulse" />
                          Interactive Performance Curves
                        </span>
                        
                        {/* Custom visual graph representation */}
                        {gradedMessages.length > 0 ? (
                          <div className="h-32 bg-[#060913] border border-slate-850 rounded-2xl p-4 flex items-end justify-between relative mt-2">
                            {/* Grid markers */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-2 opacity-[0.03]">
                              <div className="w-full border-t border-slate-500 text-[7px] font-mono">10</div>
                              <div className="w-full border-t border-slate-500 text-[7px] font-mono">5</div>
                              <div className="w-full border-t border-slate-500 text-[7px] font-mono">0</div>
                            </div>

                            {/* Scoring bars */}
                            <div className="flex justify-around items-end w-full h-full relative z-10">
                              {gradedMessages.map((msg, idx) => {
                                const flVal = msg.metrics?.fluency_score_out_of_10 || 0;
                                const techVal = msg.metrics?.technical_accuracy_score_out_of_10 || 0;
                                return (
                                  <div key={idx} className="flex flex-col items-center gap-1.5">
                                    <div className="flex gap-1.5 items-end h-20">
                                      {/* Fluency bar */}
                                      <div 
                                        className="w-2.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-full transition-all duration-700"
                                        style={{ height: `${flVal * 10}%` }}
                                        title={`Turn ${idx + 1} Fluency: ${flVal}`}
                                      />
                                      {/* Tech bar */}
                                      <div 
                                        className="w-2.5 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-full transition-all duration-700"
                                        style={{ height: `${techVal * 10}%` }}
                                        title={`Turn ${idx + 1} Technical: ${techVal}`}
                                      />
                                    </div>
                                    <span className="text-[8px] font-mono font-bold text-slate-500">T{idx + 1}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 bg-[#060913] border border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-[11px] text-slate-500 italic mt-2">
                            <Info className="w-5 h-5 text-slate-600 mb-2" />
                            <span>A rolling performance trend graph of parameters will visualize here as you proceed.</span>
                          </div>
                        )}

                        <div className="flex justify-center gap-5 mt-4 text-[9px] font-mono font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_6px_#10b981]"></span>
                            Fluency Score
                          </div>
                          <div className="flex items-center gap-1.5 text-indigo-400">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_6px_#6366f1]"></span>
                            Technical Score
                          </div>
                        </div>
                      </div>

                      {/* Weaknesses tag Board summary */}
                      <div className="pt-4 border-t border-slate-850 mt-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2 font-bold">Weakness Aggregator:</span>
                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                          {compiledWeaknesses.length > 0 ? (
                            compiledWeaknesses.map((weakness, i) => (
                              <span key={i} className="px-2 py-0.5 bg-red-950/30 border border-red-900/30 text-red-300 rounded-lg text-[9px] font-mono font-bold uppercase">
                                • {weakness}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 italic">No persistent weaknesses captured. Great job!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab B: Active Resume parser read out */}
                  {activeTab === "resume" && (
                    <div className="flex-1 overflow-y-auto max-h-[240px] bg-[#060913] border border-slate-850 rounded-2xl p-4 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {resumeText ? (
                        <div>
                          <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-850 pb-2 mb-3 font-bold uppercase text-[10px] tracking-widest">
                            <FileText className="w-4.5 h-4.5" />
                            Candidate Custom Resume
                          </div>
                          {resumeText}
                        </div>
                      ) : (
                        <div className="text-slate-600 text-center italic py-16 flex flex-col items-center justify-center gap-2">
                          <Lock className="w-5 h-5" />
                          <span>No custom resume uploaded. Recruiting algorithms are utilizing default fresher matrices.</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Box 8: Full Turn History and Timeline (Span 12) */}
              <div id="bento-history-log" className="col-span-1 lg:col-span-12 bg-[#090e1a]/95 rounded-[32px] p-6 border border-slate-800/60 shadow-2xl flex flex-col gap-5 transition-all duration-300 hover:border-slate-700/80">
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
                    <History className="w-4.5 h-4.5 text-slate-400" />
                    Placement Session Log Timeline
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase bg-slate-950 border border-slate-850 px-3 py-1 rounded-full">
                    {history.length} conversational nodes
                  </span>
                </div>

                <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2">
                  {history.map((msg, index) => {
                    const isModel = msg.role === "model";
                    return (
                      <div 
                        key={msg.id || index}
                        className={`flex gap-4 max-w-4xl ${isModel ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-xs font-mono shadow-md ${
                          isModel 
                            ? `${activeColors.badge}` 
                            : "bg-indigo-950/80 text-indigo-400 border border-indigo-900/40"
                        }`}>
                          {isModel ? "HR" : "YOU"}
                        </div>

                        <div className={`rounded-[22px] p-5 border max-w-2xl shadow-xl transition-all ${
                          isModel 
                            ? "bg-[#0b101f]/90 border-slate-850 text-slate-100" 
                            : "bg-indigo-950/15 border-indigo-900/30 text-indigo-100"
                        }`}>
                          <div className="flex items-center justify-between gap-8 mb-2 text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                            <span>{isModel ? `${selectedCompany.name} Recruiter` : `${candidateName || "Candidate"}`}</span>
                            <span>{msg.timestamp}</span>
                          </div>

                          <p className={`text-sm leading-relaxed ${isModel ? "font-serif italic text-slate-300 font-medium" : "font-sans text-slate-200"}`}>
                            {msg.content}
                          </p>

                          {/* Render associated turn metrics inside chat log */}
                          {!isModel && msg.metrics && (
                            <div className="mt-4 pt-4 border-t border-indigo-950/80 bg-[#060913]/90 p-4 rounded-2xl space-y-3 text-[11px] shadow-inner border border-slate-900">
                              
                              <div className="grid grid-cols-2 gap-3 text-slate-400 font-mono text-[10px] font-bold">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                  <span>Fluency score:</span>
                                  <strong className="text-white text-xs">{msg.metrics.fluency_score_out_of_10}/10</strong>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                  <span>Technical correctness:</span>
                                  <strong className="text-indigo-400 text-xs">{msg.metrics.technical_accuracy_score_out_of_10}/10</strong>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                <span className="text-slate-500 uppercase tracking-wider font-mono font-bold">Fillers Detected:</span>
                                {msg.metrics.filler_words_detected.length > 0 ? (
                                  msg.metrics.filler_words_detected.map((filler, fIdx) => (
                                    <span key={fIdx} className="px-2 py-0.5 bg-amber-950/30 border border-amber-900/30 text-amber-400 rounded-lg font-mono font-bold">
                                      "{filler}"
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-emerald-400 font-bold font-mono bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-900/20">
                                    None
                                  </span>
                                )}
                              </div>

                              {msg.metrics.grammar_corrections && msg.metrics.grammar_corrections.length > 0 && (
                                <div className="text-slate-400 leading-relaxed border-t border-slate-850 pt-3">
                                  <span className="text-red-400 font-black block text-[9px] uppercase tracking-wider font-mono">Suggested Refined Phrasing:</span>
                                  <p className="italic mt-1 text-slate-200">"{msg.metrics.grammar_corrections[0]}"</p>
                                </div>
                              )}

                              <div className="text-slate-300 leading-relaxed border-t border-slate-850 pt-3">
                                <span className="text-indigo-400 font-black block text-[9px] uppercase tracking-wider font-mono">Linguistic Roadmap Tip:</span>
                                <p className="mt-1 text-slate-400 leading-relaxed italic">"{msg.metrics.personalized_improvement_tip}"</p>
                              </div>

                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}

                  {isAnalyzing && (
                    <div className="flex gap-4 max-w-4xl mr-auto">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-indigo-400 border border-indigo-950/80 flex items-center justify-center shrink-0 font-extrabold text-xs font-mono animate-pulse">
                        HR
                      </div>
                      <div className="bg-[#0b101f]/90 border border-slate-850 text-slate-200 rounded-[22px] p-5 max-w-2xl flex items-center gap-4 shadow-xl">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono italic">Auditing conversational logic, technical keywords, and sentence fluency patterns...</span>
                      </div>
                    </div>
                  )}

                  <div ref={historyEndRef} />
                </div>
              </div>

            </div>

          </motion.div>
        )}

      </div>

      <footer className="py-6 border-t border-slate-850 text-center text-[10px] text-slate-500 font-mono tracking-widest mt-auto bg-slate-950/40 relative z-10 uppercase">
        <span>© 2026 Placement SaaS Suite. System powered by Google Gemini Multi-Modal Analysis.</span>
      </footer>
    </div>
  );
}
