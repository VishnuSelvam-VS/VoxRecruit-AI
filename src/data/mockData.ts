import { SampleCandidateResponse, CompanyConfig } from "../types";

// A standard 1-second silent WAV base64 file to satisfy the raw audio processing requirement.
// This is a valid, well-formed 8kHz mono 8-bit silent WAV stream.
const TINY_SILENT_WAV_BASE64 = 
  "UklGRigAAABXQVZFRm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YQQAAAAAAA==";

export const SAMPLE_CANDIDATE_RESPONSES: SampleCandidateResponse[] = [
  {
    name: "Nervous Fresher Style",
    description: "Speaks with frequent fillers ('uh', 'like', 'basically') and grammatical stumbles.",
    transcript: "Uh, my project is, like, a web app using React, and, uh, basically it connects to a database... and I, uh, had some issues with state management...",
    audioBase64: TINY_SILENT_WAV_BASE64,
    mimeType: "audio/wav"
  },
  {
    name: "Confident Consultant Style",
    description: "Crisp, fluent delivery with professional vocabulary and smooth transitions.",
    transcript: "I built a collaborative project management system using React, TypeScript, and Tailwind. I implemented a modular Redux state engine and structured our Express middleware to handle tokenized OAuth requests securely.",
    audioBase64: TINY_SILENT_WAV_BASE64,
    mimeType: "audio/wav"
  },
  {
    name: "Hesitant Thinker Style",
    description: "Contains noticeable long pauses, stutters, and highly fragmented sentences.",
    transcript: "So... we used Node.js for... the backend... [long pause] ...and we... stored user sessions in... Redis... but... it was... challenging...",
    audioBase64: TINY_SILENT_WAV_BASE64,
    mimeType: "audio/wav"
  }
];

export const COMPANIES: CompanyConfig[] = [
  {
    id: "Cognizant",
    name: "Cognizant (CTS)",
    logoColor: "from-blue-600 to-indigo-600",
    tagline: "CTS GenC & GenC Elevate Assessment Series",
    focus: "Formal HR behavioral alignment, project technology stacks defense, state management, and real-time situational problem resolution.",
    defaultQuestions: [
      "Welcome to the Cognizant (CTS) Placement drive. To begin, could you introduce yourself and walk me through your technical projects, explaining the primary architecture and stack decisions you made?",
      "Can you describe an instance where your team faced a blocking bug during development, and how you collaborated to debug and maintain project delivery timelines?",
      "Cognizant operates heavily with enterprise clients. How would you handle a situation where a client requests a feature modification that compromises your system's database schema design?",
      "If you are assigned to a business unit utilizing a legacy stack you are unfamiliar with, what is your strategic roadmap to master it and deliver production-ready code in 2 weeks?"
    ]
  },
  {
    id: "TCS",
    name: "TCS",
    logoColor: "from-teal-600 to-emerald-600",
    tagline: "TCS Ninja & Digital Direct Entry Prep",
    focus: "Deep computer science fundamentals including DBMS transaction states, OOP concepts, Operating Systems threads, and Data Structures scaling.",
    defaultQuestions: [
      "Welcome to your TCS Digital Evaluation. Let's start with your technical foundation. Can you explain the difference between SQL indexing methods and how they impact query performance on heavy transactional tables?",
      "Describe how you structured encapsulation and polymorphism in your main software project. Why was this choice superior to a procedural approach?",
      "In a high-concurrency system, how do you prevent database deadlocks? Walk me through any concurrency controls you have implemented.",
      "TCS values versatile engineers. How do you assess the performance complexity of an algorithm, and when would you trade space complexity for run-time execution speed?"
    ]
  },
  {
    id: "Infosys",
    name: "Infosys",
    logoColor: "from-cyan-600 to-blue-600",
    tagline: "Infosys Systems Engineer (SE/SES) Track",
    focus: "Logical thinking, continuous training adaptation, algorithms analysis, agile software lifecycles, and testing patterns.",
    defaultQuestions: [
      "Welcome to the Infosys Systems Engineer technical panel. Could you explain the exact life-cycle of a feature from client requirement gathering to production deployment under an Agile framework?",
      "How did you perform unit testing or integration testing on your academic projects? Detail the mock strategies or frameworks you chose.",
      "At Infosys, continuous training is mandatory. If you are placed on a machine learning track tomorrow, how would you self-regulate your study sessions to bridge the skill gap?",
      "Walk me through how you optimize web rendering times. What strategies would you recommend to prevent cumulative layout shifts in customer-facing portals?"
    ]
  },
  {
    id: "Accenture",
    name: "Accenture",
    logoColor: "from-purple-600 to-pink-600",
    tagline: "Accenture Technology Consulting Assessment",
    focus: "Cloud paradigm scaling (AWS/Azure), serverless logic, API gateway integrations, DevOps automation, and client scenario communication.",
    defaultQuestions: [
      "Welcome to Accenture. Let's start with system architecture. How would you design a highly scalable, fault-tolerant user API on the cloud using serverless functions and managed databases?",
      "Explain your strategy for handling secure API authentication. What are the key differences between session token caches and OAuth JWT implementations?",
      "How do you automate continuous integration and deployment (CI/CD) pipelines to prevent bad code builds from hitting production environments?",
      "If a client demands an immediate release of a feature that has not been completely security-tested, how do you consult them on the risks while maintaining a trusted relationship?"
    ]
  }
];

export const SAMPLE_RESUMES = [
  {
    title: "MERN Stack Web Developer",
    text: `ARJUN SHARMA
Email: arjun.sharma@gmail.com | Phone: +91 98765 43210
B.E. in Computer Science & Engineering (GPA: 8.7/10)

TECHNICAL SKILLS:
- Languages: JavaScript, TypeScript, Python, HTML/CSS
- Frontend: React, Redux, Tailwind CSS, Next.js
- Backend: Node.js, Express.js, REST APIs, JSON Web Tokens
- Databases: MongoDB, PostgreSQL, Redis
- Tools: Git, Docker, Postman, AWS S3

PROJECTS:
1. COLLABORATIVE TASK MANAGER (React, Express, MongoDB)
- Built a multi-tenant task workspace with dynamic kanban boards and real-time state updates using Socket.io.
- Implemented Redux Toolkit for complex state management, reducing component re-render overhead by 30%.
- Authored tokenized route-protection middlewares using JWT, securing personal credentials in environment variables.

2. SECURE PORTFOLIO GATEWAY (Node, PostgreSQL, Redis)
- Created a server-side high-throughput payment proxy connecting third-party checkout gateways securely.
- Optimized slow index searches on transactional SQL schemas, lowering API response latency from 450ms to 90ms.`
  },
  {
    title: "Cloud & Python Developer",
    text: `KAVITHA NAIR
Email: kavitha.nair@outlook.com | Phone: +91 88990 11223
B.Tech in Information Technology (GPA: 9.1/10)

TECHNICAL SKILLS:
- Languages: Python, Java, SQL, Go
- Cloud & DevOps: AWS (EC2, Lambda, S3, RDS), Docker, GitHub Actions CI/CD
- Backends: Django, FastAPI, PostgreSQL, Gunicorn
- Concepts: RESTful Microservices, Serverless Computing, Object-Oriented Design

PROJECTS:
1. AUTO-SCALING LOG ANALYZER (FastAPI, AWS Lambda, Python)
- Engineered a serverless ingestion pipeline evaluating live operational system telemetry.
- Utilized AWS Lambda and S3 storage triggers, reducing overall infrastructure compute costs by 45%.
- Formulated custom clean log parsers in Python that extract high-density error trends.

2. STUDENT DBMS INTEGRATION (Django, PostgreSQL)
- Designed a relational student information portal handling 15,000 active records.
- Formulated optimized subqueries, cascading tables, and multi-table joins to compute performance percentiles instantly.`
  }
];
