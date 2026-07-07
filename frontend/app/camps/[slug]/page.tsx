'use client';

import { use, useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, CheckCircle2, BookOpen, Code2, Star, Clock, Cpu, Shield, Bug, Layers, Rocket, Briefcase, HelpCircle, Terminal, Zap } from 'lucide-react';

const WA = '201023460370';

/* ─── AOSPCamp full curriculum ─────────────────────────────────── */
const AOSP_COURSES = [
    {
        num: '00', icon: '🛠️', title: 'Android Studio & Dev Environment',
        duration: '3 hrs', color: 'violet',
        desc: 'Set up your professional development environment for AOSP and Android platform engineering work.',
        modules: [
            'Android Studio Installation & Configuration',
            'ADB & Fastboot Setup and Commands',
            'Emulator & QEMU Configuration',
            'SDK, NDK & Platform Tools Overview',
        ],
        labs: [
            'Lab 0.1: Environment Verification & First ADB Commands',
            'Lab 0.2: Device Connection, Shell & Debugging',
        ],
        skills: ['ADB', 'Fastboot', 'Android SDK', 'NDK', 'Emulator'],
    },
    {
        num: '01', icon: '🔧', title: 'AOSP Fundamentals',
        duration: '8 hrs', color: 'violet',
        desc: 'Master the AOSP codebase structure, build system (Soong & Make), repo tool, and flash your first custom build.',
        modules: [
            'Introduction to AOSP & Android History',
            'Android Architecture Layers (Application, Framework, HAL, Kernel)',
            'Source Code Structure: system/, frameworks/, hardware/, packages/',
            'Repo & Git Tools: repo init, sync, forall, branches',
            'Build System: Soong, Blueprints, Android.bp & Makefiles',
        ],
        labs: [
            'Lab 1.1: Environment Setup & Prerequisites',
            'Lab 1.2: Source Code Download & Repo Sync',
            'Lab 1.3: Building AOSP from Scratch',
            'Lab 1.4: Source Code Exploration (find, grep in AOSP)',
            'Lab 1.5: Build Variants & Lunch Targets (eng, userdebug, user)',
        ],
        skills: ['Soong/Blueprint', 'repo tool', 'lunch targets', 'adb flash', 'build variants', 'fastboot'],
    },
    {
        num: '02', icon: '⚙️', title: 'AOSP Internals',
        duration: '10 hrs', color: 'violet',
        desc: 'Deep dive into Android boot process, Binder IPC, Zygote spawning, system services, and package management internals.',
        modules: [
            'Android Boot Flow: Bootloader → Kernel → init → Zygote → SystemServer',
            'Init System & RC Files (init.rc, service declarations, properties)',
            'Binder IPC Architecture & AIDL Interface Definition',
            'Zygote Process & Application Spawning Mechanism',
            'System Services Architecture (ServiceManager, SystemServer)',
            'Package Manager & App Installation Flow',
        ],
        labs: [
            'Lab 2.1: Boot Flow Tracing with Logcat',
            'Lab 2.2: Creating Custom Init Services',
            'Lab 2.3: Binder IPC Client-Server Communication',
            'Lab 2.4: Writing a Custom System Service',
            'Lab 2.5: Package Installation Deep Dive',
            'Lab 2.6: App Launch Profiling & Timing',
        ],
        skills: ['Binder', 'AIDL', 'Zygote', 'ServiceManager', 'init.rc', 'SystemServer'],
    },
    {
        num: '03', icon: '🔍', title: 'Debugging & Tracing',
        duration: '6 hrs', color: 'violet',
        desc: 'Master the complete Android debugging toolkit: advanced ADB, logcat, tombstones, ANR analysis, Perfetto & systrace.',
        modules: [
            'Advanced ADB Techniques & Shell Scripting',
            'Logcat Deep Dive: filters, buffers, log analysis at scale',
            'Native Crash Analysis: Tombstones, coredumps, addr2line',
            'Memory Leak Detection: Heaptrack, AddressSanitizer, Meminfo',
            'Perfetto & Systrace: performance profiling and trace analysis',
        ],
        labs: [
            'Lab 3.1: Advanced ADB Scripting & Automation',
            'Lab 3.2: Crash Analysis & Tombstone Reading',
            'Lab 3.3: Perfetto Profiling & Trace Visualization',
            'Lab 3.4: Memory Leak Detection with Heaptrack',
            'Lab 3.5: Native Debugging with LLDB',
        ],
        skills: ['ADB scripting', 'Perfetto', 'Systrace', 'LLDB', 'AddressSanitizer', 'addr2line'],
    },
    {
        num: '04', icon: '🔒', title: 'Security, Boot & OTA',
        duration: '8 hrs', color: 'violet',
        desc: 'Implement full Android security stack: SELinux policies, verified boot chain, dm-verity, FBE, and A/B OTA system.',
        modules: [
            'Android Security Model & Sandboxing Architecture',
            'SELinux Policy Writing, Auditing & audit2allow',
            'Verified Boot Chain & dm-verity Configuration',
            'File-Based Encryption (FBE) & Credential Encrypted Storage',
            'A/B Seamless OTA Update System & Update Engine',
        ],
        labs: [
            'Lab 4.1: SELinux Policy Writing & Debugging',
            'Lab 4.2: OTA Update Package Creation',
            'Lab 4.3: Verified Boot Configuration & Testing',
            'Lab 4.4: File-Based Encryption Setup',
        ],
        skills: ['SELinux', 'dm-verity', 'A/B OTA', 'Keymaster', 'FBE', 'Strongbox', 'audit2allow'],
    },
    {
        num: '05', icon: '🏗️', title: 'System Design for Platform Engineers',
        duration: '7 hrs', color: 'violet',
        desc: 'Design production-grade Android platform systems: HAL architecture, Vehicle HAL (VHAL), Treble, and performance patterns.',
        modules: [
            'Requirements Engineering for Embedded & Automotive Systems',
            'HAL Architecture: HIDL vs AIDL HAL (Treble compliance)',
            'Clean Architecture & MVVM for Android Platform Apps',
            'Vehicle HAL (VHAL) Design for Automotive Android',
            'Performance Optimization: jank, frame drops, boot time',
        ],
        labs: [
            'Lab 5.1: System Requirements Document',
            'Lab 5.2: HAL Architecture Design & Documentation',
            'Lab 5.3: AIDL HAL Implementation on Raspberry Pi',
            'Lab 5.4: System Integration & VTS Testing',
        ],
        skills: ['HAL design', 'HIDL/AIDL', 'VHAL', 'VTS testing', 'Treble architecture', 'GKI'],
    },
    {
        num: '06', icon: '🎓', title: 'Graduation Projects',
        duration: '10+ hrs', color: 'fuchsia',
        desc: 'Choose and complete one of 30 professional-grade projects to build your portfolio and prove your skills.',
        modules: [
            'Project Selection Framework & Evaluation Criteria',
            'Automotive HUD Dashboard (AOSP + VHAL + CarService)',
            'Custom LED HAL Implementation (AIDL HAL)',
            'A/B OTA Update Engine with Rollback',
            'Enterprise MDM Security System',
            'Android TV Smart Launcher',
            'Custom System Service with Binder IPC',
            'WearOS Health Watch Face',
            '+ 22 more professional projects',
        ],
        labs: [
            'Individual project implementation (guided)',
            'Code review & peer feedback sessions',
            'Final demo presentation & documentation',
        ],
        skills: ['End-to-end AOSP projects', 'Documentation', 'Code review', 'Demo skills', 'GitHub portfolio'],
    },
    {
        num: '07', icon: '💼', title: 'Career Coaching',
        duration: '5 hrs', color: 'violet',
        desc: 'Land your dream embedded Android role: master technical interviews, system design, resume, and salary negotiation.',
        modules: [
            'Technical Interview Preparation Framework for Platform Engineers',
            'System Design Interviews: AOSP component design on the whiteboard',
            'Coding Challenges Specific to Embedded & Platform Roles',
            'Resume & GitHub Portfolio Building for AOSP Engineers',
            'Career Roadmap, Offer Evaluation & Salary Negotiation',
        ],
        labs: [
            'Recorded mock technical interview with feedback',
            'Resume review & LinkedIn profile optimization',
            'Live mock system design session',
        ],
        skills: ['Interview technique', 'Salary negotiation', 'Portfolio building', 'System design communication'],
    },
    {
        num: '08', icon: '📋', title: 'Interview Questions Bank',
        duration: '4 hrs', color: 'violet',
        desc: '100+ real Android platform interview questions with detailed answers — theory, debugging, design, implementation, behavioral.',
        modules: [
            'Theory Q&A: AOSP architecture, Binder, Security, Boot flow',
            'Debugging Scenario Questions: How would you debug X?',
            'System Design Questions: Design a custom HAL for Y',
            'Implementation & Coding Challenges',
            'Behavioral Questions: STAR Method for Engineering Roles',
        ],
        labs: [
            'Self-assessment tests per topic',
            'Timed mock Q&A sessions',
            'Peer interview practice pairs',
        ],
        skills: ['Comprehensive AOSP knowledge', 'Technical communication', 'Problem-solving under pressure'],
    },
];

/* ─── Coming-soon camp curricula ─────────────────────────────── */
const PCODE_COURSES = [
    {
        num: '00', icon: '🧮', title: 'Programming Foundations & Complexity Analysis',
        duration: '4 hrs',
        desc: 'Build a rock-solid foundation: recursion, time/space complexity, Big-O analysis, and the mindset to approach any problem systematically.',
        modules: ['Recursion & Iteration Deep Dive', 'Time & Space Complexity (Big-O)', 'Mathematical Foundations for CS', 'Problem-Solving Framework (Read → Explore → Plan → Code → Test)'],
        labs: ['Lab 0.1: 20 Warm-Up Problems on Arrays & Strings', 'Lab 0.2: Complexity Analysis Exercises'],
        skills: ['Big-O analysis', 'Recursion', 'Problem decomposition'],
    },
    {
        num: '01', icon: '🌲', title: 'Data Structures Mastery',
        duration: '8 hrs',
        desc: 'Master every essential data structure — arrays, linked lists, stacks, queues, trees, heaps, tries, and graphs — with hands-on implementation.',
        modules: ['Arrays, Strings & Two-Pointer Technique', 'Linked Lists (singly, doubly, circular)', 'Stacks, Queues & Monotonic Stack', 'Binary Trees & Binary Search Trees', 'Heaps & Priority Queues', 'Tries & Segment Trees', 'Graphs: Representation, BFS, DFS'],
        labs: ['Lab 1.1: Implement LinkedList, Stack, Queue from scratch', 'Lab 1.2: BST operations & balancing', 'Lab 1.3: Graph adjacency list & matrix', 'Lab 1.4: Heap sort & k-th largest element'],
        skills: ['Trees', 'Heaps', 'Graphs', 'Tries', 'Hash Maps'],
    },
    {
        num: '02', icon: '🔍', title: 'Algorithm Patterns & Techniques',
        duration: '8 hrs',
        desc: 'Learn the 15 core algorithm patterns that solve 90% of LeetCode problems. Stop re-inventing the wheel — recognize patterns instantly.',
        modules: ['Sliding Window & Two Pointers', 'Binary Search & its Variants', 'BFS, DFS & Backtracking', 'Greedy Algorithms', 'Divide & Conquer', 'Union-Find (Disjoint Set)', 'Bit Manipulation'],
        labs: ['Lab 2.1: Sliding Window problems (Easy→Hard)', 'Lab 2.2: Binary search variants (rotated arrays, search space)', 'Lab 2.3: Graph traversal challenges', 'Lab 2.4: Backtracking puzzles (N-Queens, Sudoku Solver)'],
        skills: ['Sliding Window', 'Binary Search', 'BFS/DFS', 'Backtracking', 'Union-Find'],
    },
    {
        num: '03', icon: '⚡', title: 'Dynamic Programming & Backtracking',
        duration: '10 hrs',
        desc: 'Conquer the hardest category in interviews. Build intuition for DP from first principles: overlapping subproblems, memoization, and tabulation.',
        modules: ['DP Fundamentals: Memoization vs Tabulation', '1D DP: Fibonacci, Climbing Stairs, House Robber', '2D DP: Grid Paths, Longest Common Subsequence', 'Knapsack Variants (0/1, Unbounded, Bounded)', 'String DP: Edit Distance, Palindromes, Partitioning', 'Interval & State Machine DP', 'Backtracking: Subsets, Permutations, Combinations'],
        labs: ['Lab 3.1: Classic DP problems (Coin Change, LCS, Edit Distance)', 'Lab 3.2: Knapsack variants', 'Lab 3.3: DP on strings', 'Lab 3.4: Backtracking challenges'],
        skills: ['Memoization', 'Tabulation', 'Knapsack', 'LCS/LIS', 'Backtracking'],
    },
    {
        num: '04', icon: '🏆', title: 'LeetCode Mastery — 150+ Problems by Pattern',
        duration: '12 hrs',
        desc: 'Work through 150+ curated problems organized by pattern. Speed, accuracy, and pattern recognition — the three skills that win coding interviews.',
        modules: ['Easy: Pattern Recognition & Speed (50 problems)', 'Medium: Core Interview Problems (70 problems)', 'Hard: FAANG Challenges (30+ problems)', 'Contest Strategy & Time Management', 'Code Quality & Clean Solutions'],
        labs: ['Daily problem sets with timed conditions', 'Weekly mock contests', 'Peer solution reviews'],
        skills: ['Pattern recognition', 'Speed coding', 'Edge case handling', 'Clean code'],
    },
    {
        num: '05', icon: '🏗️', title: 'System Design Fundamentals',
        duration: '8 hrs',
        desc: 'Design scalable distributed systems that handle millions of users. Cover the full HLD toolkit: load balancing, caching, databases, and more.',
        modules: ['Scalability & CAP Theorem', 'Load Balancing & Horizontal Scaling', 'Caching Strategies (Redis, CDN, Write-Through)', 'Database Design: SQL vs NoSQL, Sharding, Replication', 'Message Queues & Event-Driven Architecture (Kafka)', 'API Design: REST, GraphQL, Rate Limiting', 'Designing Famous Systems (Twitter, YouTube, WhatsApp)'],
        labs: ['Lab 5.1: Design URL Shortener (bit.ly)', 'Lab 5.2: Design Twitter Feed', 'Lab 5.3: Design a Distributed Cache', 'Lab 5.4: Design WhatsApp messaging system'],
        skills: ['Load balancing', 'Caching', 'Database sharding', 'Message queues', 'API design'],
    },
    {
        num: '06', icon: '⚙️', title: 'Embedded & Mobile System Design',
        duration: '6 hrs',
        desc: 'System design for hardware-constrained environments. Learn to design real-time OS schedulers, sensor data pipelines, and mobile app backends.',
        modules: ['Embedded Constraints: Memory, CPU, Power', 'RTOS Scheduler Design', 'IoT Data Pipeline Architecture', 'OTA Update System Design', 'Mobile Backend Architecture (offline-first, sync)', 'Low-latency Systems for Automotive & Robotics'],
        labs: ['Lab 6.1: Design an OTA update system', 'Lab 6.2: IoT sensor data pipeline', 'Lab 6.3: Mobile offline-first architecture'],
        skills: ['RTOS design', 'IoT architecture', 'OTA systems', 'Mobile backend'],
    },
    {
        num: '07', icon: '💼', title: 'Mock Interviews & Career Coaching',
        duration: '6 hrs',
        desc: 'Simulate real FAANG interviews — live coding, system design, and behavioral rounds — with structured feedback and improvement plans.',
        modules: ['Live Coding Mock Rounds (timed, recorded)', 'System Design Mock Interviews (1-hour sessions)', 'Behavioral Interview (STAR Method)', 'Resume & LinkedIn Optimization for Engineers', 'Offer Evaluation & Salary Negotiation'],
        labs: ['5 full mock coding interviews with feedback', '2 full system design sessions', 'Resume review & LinkedIn rewrite'],
        skills: ['Interview technique', 'STAR method', 'Salary negotiation', 'Portfolio building'],
    },
];

const AI_COURSES = [
    {
        num: '00', icon: '🐍', title: 'Python for AI & ML',
        duration: '4 hrs',
        desc: 'Get production-ready with Python for AI: NumPy, Pandas, Matplotlib, and Jupyter for data science workflows.',
        modules: ['Python Refresher & Type Hints', 'NumPy: Arrays, Broadcasting, Vectorization', 'Pandas: DataFrames, Cleaning, EDA', 'Matplotlib & Seaborn: Visualization', 'Jupyter Notebooks Best Practices'],
        labs: ['Lab 0.1: EDA on a real dataset', 'Lab 0.2: Data cleaning & feature engineering pipeline'],
        skills: ['NumPy', 'Pandas', 'Matplotlib', 'EDA'],
    },
    {
        num: '01', icon: '🤖', title: 'Machine Learning Fundamentals',
        duration: '8 hrs',
        desc: 'Build ML intuition from scratch — supervised, unsupervised, and ensemble methods. Implement and evaluate models on real datasets.',
        modules: ['Linear & Logistic Regression from Scratch', 'Decision Trees, Random Forest, XGBoost', 'Clustering: K-Means, DBSCAN, Hierarchical', 'Dimensionality Reduction: PCA, t-SNE', 'Model Evaluation: Cross-validation, ROC, AUC', 'Feature Engineering & Selection', 'Scikit-learn Production Patterns'],
        labs: ['Lab 1.1: Build a churn prediction model', 'Lab 1.2: Credit fraud detection', 'Lab 1.3: Recommendation system with collaborative filtering'],
        skills: ['Scikit-learn', 'XGBoost', 'Feature engineering', 'Model evaluation'],
    },
    {
        num: '02', icon: '🧠', title: 'Deep Learning & Neural Networks',
        duration: '10 hrs',
        desc: 'Master neural networks from backpropagation to transformers. Build CNNs, RNNs, and LSTMs with PyTorch.',
        modules: ['Neural Network Fundamentals & Backpropagation', 'Convolutional Neural Networks (CNNs)', 'Recurrent Networks (RNN, LSTM, GRU)', 'Attention Mechanism & Self-Attention', 'Regularization: Dropout, Batch Norm, Weight Decay', 'Transfer Learning & Pre-trained Models', 'PyTorch Training Loop Patterns'],
        labs: ['Lab 2.1: Image classifier (CIFAR-10)', 'Lab 2.2: Text sentiment with LSTM', 'Lab 2.3: Transfer learning with ResNet'],
        skills: ['PyTorch', 'CNNs', 'LSTMs', 'Transfer learning', 'Backpropagation'],
    },
    {
        num: '03', icon: '📖', title: 'LLMs, Transformers & Fine-Tuning',
        duration: '10 hrs',
        desc: 'Deep dive into how LLMs work — attention, tokenization, pre-training, RLHF — and fine-tune open-source models for custom tasks.',
        modules: ['Transformer Architecture (Attention is All You Need)', 'Tokenization & Embeddings', 'GPT Architecture & Autoregressive Generation', 'BERT, T5, and Encoder-Decoder Models', 'Fine-Tuning with Hugging Face Transformers', 'PEFT: LoRA & QLoRA for Efficient Fine-Tuning', 'Evaluation: BLEU, ROUGE, Perplexity, Human Eval'],
        labs: ['Lab 3.1: Fine-tune LLaMA 3 for Q&A', 'Lab 3.2: Sentiment classifier with BERT', 'Lab 3.3: Code generation with CodeLlama'],
        skills: ['Transformers', 'Hugging Face', 'LoRA/QLoRA', 'Fine-tuning', 'LLM evaluation'],
    },
    {
        num: '04', icon: '🔗', title: 'LangChain, RAG & Vector Databases',
        duration: '8 hrs',
        desc: 'Build production RAG systems that give LLMs memory and access to your private data. Connect to any document store, database, or API.',
        modules: ['LangChain Core: Chains, Prompts, Parsers', 'Vector Databases: Pinecone, Chroma, FAISS', 'RAG Pipeline: Chunking, Embedding, Retrieval', 'Hybrid Search: BM25 + Semantic Search', 'LangChain Document Loaders & Splitters', 'Evaluation: Faithfulness, Relevance, Context Recall', 'Production RAG Patterns & Pitfalls'],
        labs: ['Lab 4.1: Build a PDF Q&A system', 'Lab 4.2: Company knowledge base chatbot', 'Lab 4.3: Multi-document RAG with re-ranking'],
        skills: ['LangChain', 'RAG', 'Vector DBs', 'Semantic search', 'Prompt engineering'],
    },
    {
        num: '05', icon: '🕵️', title: 'AI Agents & Agentic Workflows',
        duration: '8 hrs',
        desc: 'Build autonomous AI agents that plan, use tools, and complete multi-step tasks. From ReAct agents to full LangGraph workflows.',
        modules: ['Agent Architecture: ReAct, Plan-and-Execute', 'Tool Use & Function Calling (OpenAI, Anthropic)', 'LangGraph: State Machines for AI Workflows', 'Multi-Agent Systems & Crew AI', 'Memory Systems: Short-term, Long-term, Episodic', 'Agent Evaluation & Safety Guardrails', 'Browser & Code Execution Agents'],
        labs: ['Lab 5.1: Build a ReAct agent with web search', 'Lab 5.2: Code writing & debugging agent', 'Lab 5.3: Multi-agent research pipeline'],
        skills: ['LangGraph', 'Tool calling', 'Multi-agent systems', 'Agent evaluation'],
    },
    {
        num: '06', icon: '🎨', title: 'Generative AI & Computer Vision',
        duration: '6 hrs',
        desc: 'Build generative models for images, video, and multimodal applications. Work with Stable Diffusion, DALL·E, and vision-language models.',
        modules: ['Diffusion Models: DDPM, DDIM, Stable Diffusion', 'Image Generation with ControlNet & LoRA', 'Vision-Language Models (CLIP, LLaVA, GPT-4V)', 'Multimodal RAG: Images + Text', 'Video Generation Fundamentals', 'Prompt Engineering for Image Generation'],
        labs: ['Lab 6.1: Custom image generation pipeline', 'Lab 6.2: Multimodal chatbot with image understanding', 'Lab 6.3: Document OCR + LLM extraction'],
        skills: ['Stable Diffusion', 'CLIP', 'LLaVA', 'ControlNet', 'Multimodal AI'],
    },
    {
        num: '07', icon: '🚀', title: 'MLOps, APIs & Model Deployment',
        duration: '8 hrs',
        desc: 'Take your models from notebook to production: REST APIs, Docker containers, CI/CD pipelines, and monitoring for ML systems.',
        modules: ['FastAPI for ML Model Serving', 'Docker & Container Packaging for Models', 'Model Registries & Versioning (MLflow)', 'CI/CD for ML Pipelines (GitHub Actions)', 'Monitoring: Drift Detection, Latency, Cost', 'Streaming Inference & Batch Processing', 'Cloud Deployment: AWS, GCP, Azure'],
        labs: ['Lab 7.1: Deploy sentiment model as REST API', 'Lab 7.2: Dockerize a RAG app', 'Lab 7.3: Full MLOps pipeline with MLflow + CI/CD'],
        skills: ['FastAPI', 'Docker', 'MLflow', 'CI/CD', 'Model monitoring'],
    },
];

const EN_COURSES = [
    {
        num: '00', icon: '📝', title: 'Technical English Foundations',
        duration: '4 hrs',
        desc: 'Build the vocabulary, grammar, and sentence patterns engineers need — focus on precision, clarity, and professional tone.',
        modules: ['Engineering Vocabulary & Technical Terms', 'Sentence Structure for Technical Writing', 'Active vs Passive Voice in Technical Docs', 'Punctuation & Formatting Rules', 'Common ESL Mistakes Engineers Make'],
        labs: ['Lab 0.1: Rewrite 10 vague technical sentences', 'Lab 0.2: Vocabulary quiz — 200 engineering terms'],
        skills: ['Technical vocabulary', 'Clear sentence structure', 'Professional tone'],
    },
    {
        num: '01', icon: '📧', title: 'Email, Slack & Async Writing',
        duration: '5 hrs',
        desc: 'Write emails and Slack messages that get responses, convey urgency correctly, and keep cross-timezone teams aligned.',
        modules: ['Email Structure: Subject, Opening, Body, CTA', 'Writing Bug Reports & Feature Requests', 'Escalation Emails: How to be direct without being rude', 'Slack Etiquette & Channel Communication', 'Status Update Templates for Engineering Teams', 'Writing RFCs & Architecture Proposals'],
        labs: ['Lab 1.1: Rewrite 5 bad emails into professional ones', 'Lab 1.2: Write a bug report, RFC, and status update'],
        skills: ['Email writing', 'Slack communication', 'RFC writing', 'Status updates'],
    },
    {
        num: '02', icon: '🎤', title: 'Engineering Presentations & Demos',
        duration: '6 hrs',
        desc: 'Present technical topics to mixed audiences — from a 5-minute standup to a 30-minute architecture walkthrough — with confidence.',
        modules: ['Presentation Structure for Technical Topics', 'How to Explain Complex Systems Simply', 'Live Demo Best Practices (and backup plans)', 'Slide Design for Engineers', 'Handling Q&A and Pushback', 'Recording Async Video Explanations (Loom)'],
        labs: ['Lab 2.1: Record a 5-minute technical demo', 'Lab 2.2: Present an architecture diagram to a non-technical audience'],
        skills: ['Public speaking', 'Technical demos', 'Slide design', 'Async video'],
    },
    {
        num: '03', icon: '💼', title: 'Technical Interviews in English',
        duration: '8 hrs',
        desc: 'Think out loud, explain your reasoning, and handle coding interviews — all in English. Reduce anxiety by building the right language patterns.',
        modules: ['Thinking Aloud: Narrating Your Problem-Solving', 'Clarifying Questions & Assumptions', 'Explaining Code Complexity in Plain English', 'Behavioral Questions (STAR in English)', 'Handling "I Don\'t Know" Gracefully', 'Cross-cultural Interview Differences (US, UK, EU)'],
        labs: ['Lab 3.1: 3 mock coding interviews recorded in English', 'Lab 3.2: STAR story practice — 10 behavioral questions'],
        skills: ['Think-aloud technique', 'STAR stories', 'Clarifying questions', 'Interview English'],
    },
    {
        num: '04', icon: '🤝', title: 'Meeting Leadership & Discussion',
        duration: '5 hrs',
        desc: 'Run effective standups, design reviews, and retrospectives in English. Interrupt politely, drive consensus, and close action items.',
        modules: ['Running a Standup & Sprint Planning', 'Design Review Facilitation', 'How to Disagree Professionally in English', 'Interrupting & Taking the Floor Politely', 'Closing a Meeting with Clear Action Items', 'Remote Meeting Etiquette (async & sync)'],
        labs: ['Lab 4.1: Facilitate a 15-minute mock design review', 'Lab 4.2: Write meeting minutes and action items'],
        skills: ['Meeting facilitation', 'Professional disagreement', 'Action items', 'Remote communication'],
    },
    {
        num: '05', icon: '📄', title: 'Resume, LinkedIn & Career Docs',
        duration: '6 hrs',
        desc: 'Write a resume and LinkedIn profile that gets you past ATS filters and impresses hiring managers at international companies.',
        modules: ['Engineering Resume Structure & ATS Optimization', 'Writing Impactful Bullet Points (STAR for Resume)', 'LinkedIn Profile Optimization for Engineers', 'GitHub Portfolio & README Writing', 'Cover Letter Templates for Tech Roles', 'Personal Branding for Engineers'],
        labs: ['Lab 5.1: Full resume rewrite with feedback', 'Lab 5.2: LinkedIn profile optimization', 'Lab 5.3: Write 3 professional GitHub READMEs'],
        skills: ['Resume writing', 'LinkedIn optimization', 'ATS strategies', 'GitHub portfolio'],
    },
];

/* ─── Coming-soon camp stubs ─────────────────────────────────── */
type CourseItem = { num: string; icon: string; title: string; duration: string; desc: string; modules: string[]; labs: string[]; skills: string[] };
const CAMP_META: Record<string, {
    name: string; icon: string; tagline: string; desc: string; status: 'live' | 'coming-soon';
    color: { border: string; bg: string; text: string; btn: string; glow: string };
    stats: Record<string, string>;
    topics: string[];
    courses?: CourseItem[];
    faqs?: { q: string; a: string }[];
}> = {
    aosp: {
        name: 'AOSPCamp', icon: '⚙️', status: 'live',
        tagline: 'Android Platform Engineering Bootcamp',
        desc: '',
        stats: {},
        topics: [],
        color: { border: 'border-violet-500/30', bg: 'bg-violet-500/5', text: 'text-violet-400', btn: 'bg-violet-600 hover:bg-violet-500', glow: 'rgba(139,92,246,0.12)' },
    },
    pcode: {
        name: 'PCodeCamp', icon: '🧩', status: 'coming-soon',
        tagline: 'DSA, Problem Solving & System Design',
        desc: 'Master data structures, algorithm patterns, and system design through 150+ real interview problems. Built for engineers targeting FAANG, MAANG, and top-tier companies.',
        stats: { Courses: '8', Hours: '50+', Problems: '150+', Mocks: '10+' },
        color: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', btn: 'bg-amber-600 hover:bg-amber-500', glow: 'rgba(245,158,11,0.08)' },
        topics: ['Data Structures & Algorithms', 'LeetCode Mastery', 'Dynamic Programming', 'System Design (HLD + LLD)', 'FAANG Interview Prep', 'Mock Interviews', 'Graph Algorithms', 'Backtracking'],
        courses: PCODE_COURSES,
        faqs: [
            { q: 'Do I need prior competitive programming experience?', a: 'No. We start from foundations — complexity analysis, recursion, and basic data structures — and build up to FAANG-level challenges. You need solid programming knowledge in any language.' },
            { q: 'Which programming language do we use?', a: 'Python for most problems (cleanest for pattern learning), but solutions are also shown in C++ and Java. You can code in any language you\'re comfortable with.' },
            { q: 'How many live mock interviews are included?', a: '10+ live mock sessions — 5 coding rounds and 5 system design rounds — with recorded video and written feedback each time.' },
            { q: 'Is this useful for engineers, not just CS graduates?', a: 'Absolutely. It was designed specifically for working engineers (embedded, Android, backend) who need to learn algorithms for job changes, not competitive programming olympiads.' },
        ],
    },
    ai: {
        name: 'AICamp', icon: '🤖', status: 'coming-soon',
        tagline: 'ML, Deep Learning, LLMs & AI Agents',
        desc: 'Build production AI systems — LLMs, RAG pipelines, AI agents, and deployed ML models. Not just notebooks. Every course ends with a deployed, working system.',
        stats: { Courses: '8', Hours: '60+', Labs: '25+', Projects: '10' },
        color: { border: 'border-sky-500/30', bg: 'bg-sky-500/5', text: 'text-sky-400', btn: 'bg-sky-600 hover:bg-sky-500', glow: 'rgba(14,165,233,0.08)' },
        topics: ['Python for AI & ML', 'Deep Learning & Neural Networks', 'LLMs & Transformers', 'LangChain & RAG', 'AI Agents & Orchestration', 'Generative AI', 'MLOps & Deployment', 'AI System Design'],
        courses: AI_COURSES,
        faqs: [
            { q: 'Do I need a math background?', a: 'Basic linear algebra and calculus helps for the deep learning sections, but we cover the math you need as we go. Focus is on building systems, not academic proofs.' },
            { q: 'What hardware do I need?', a: 'Any modern laptop works. We use free-tier GPUs on Google Colab and Kaggle for training. For local inference, 16GB RAM is recommended.' },
            { q: 'Will I deploy real AI systems, not just notebooks?', a: 'Yes — every course module ends with a deployable system (REST API, Docker container, or cloud endpoint). MLOps and deployment are first-class topics, not an afterthought.' },
            { q: 'Is this suitable for backend engineers with no ML background?', a: 'Yes. The first two courses build ML and DL foundations. You don\'t need prior AI experience — just Python proficiency.' },
        ],
    },
    en: {
        name: 'EnglishFluencyCamp', icon: '🌍', status: 'coming-soon',
        tagline: 'Business English & Technical Communication for Engineers',
        desc: 'Speak and write English with confidence at work. Every lesson uses real engineering contexts — email threads, code reviews, design docs, and technical interviews. No generic grammar drills.',
        stats: { Courses: '6', Hours: '34+', Projects: '20+', Level: 'All' },
        color: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500', glow: 'rgba(16,185,129,0.08)' },
        topics: ['Technical Writing & Docs', 'Email & Slack Communication', 'Engineering Presentations', 'Technical Interviews in English', 'Meeting Leadership', 'Resume & LinkedIn Writing', 'Code Review Language', 'Cross-cultural Communication'],
        courses: EN_COURSES,
        faqs: [
            { q: 'What level of English do I need to start?', a: 'Intermediate (B1) or above. You should be able to read and understand English technical content. The camp focuses on production fluency — speaking and writing — not beginner grammar.' },
            { q: 'Is this useful even if I already speak good English?', a: 'Yes. Most engineers can read English fine but struggle with professional writing, presentations, and interviews. This camp targets those specific engineering-context skills.' },
            { q: 'Is everything in English?', a: 'Instructions and explanations are in both English and Arabic (transliterated) to help with context. All practice output — writing, speaking, recordings — is in English.' },
            { q: 'Do I get feedback on my writing and speaking?', a: 'Yes. All lab submissions (emails, presentations, recorded demos) receive written feedback with specific corrections and improvement suggestions.' },
        ],
    },
};

/* ─── Icon helper ─────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
    '00': Terminal, '01': Terminal, '02': Cpu, '03': Bug, '04': Shield,
    '05': Layers, '06': Rocket, '07': Briefcase, '08': HelpCircle,
};

export default function CampDetailPage({ params }: { params: any }) {
    const { slug } = use(params) as { slug: string };
    const meta = CAMP_META[slug];
    const [dbCamp, setDbCamp] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/camps/slug/${slug}`)
            .then(r => setDbCamp(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07050e] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If slug not in CAMP_META but exists in DB — render generic page
    if (!meta) {
        if (!dbCamp) {
            return (
                <div className="min-h-screen bg-[#07050e] flex flex-col items-center justify-center text-white">
                    <p className="text-gray-400 mb-4">Camp not found.</p>
                    <Link href="/" className="text-violet-400 hover:text-violet-300 flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />Back to Home
                    </Link>
                </div>
            );
        }
        return <GenericCampPage camp={dbCamp} />;
    }

    if (meta.status === 'coming-soon') {
        return <ComingSoonPage slug={slug} meta={meta} />;
    }

    return <AOSPCampPage meta={meta} dbCamp={dbCamp} />;
}


/* ─── Generic Camp Page (DB-only camps not in CAMP_META) ──── */
function GenericCampPage({ camp }: { camp: any }) {
    const WA_NUM = '201023460370';
    const enrollMsg = encodeURIComponent(`Hi! I want to enroll in ${camp.title}. Please send me the payment details.`);
    const sessions = camp.campSessions ?? [];
    const totalMaterials = sessions.reduce((s: number, cs: any) => s + (cs.masterSession?.materials?.length ?? 0), 0);
    const totalLabs = sessions.reduce((s: number, cs: any) => s + (cs.masterSession?.labs?.length ?? 0), 0);

    return (
        <div className="min-h-screen bg-[#07050e] text-white">
            <div className="border-b border-white/5 bg-[#0a0812]">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
                        <ArrowLeft className="w-4 h-4" />Back to EmbeddedCamps
                    </Link>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                <h1 className="text-3xl font-bold">{camp.title}</h1>
                                {camp.status === 'ACTIVE' && <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">● ENROLLING NOW</span>}
                            </div>
                            {camp.brand && <p className="text-violet-400 mb-3">{camp.brand.icon} {camp.brand.name}</p>}
                            <p className="text-gray-400 max-w-2xl leading-relaxed mb-6">{camp.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                {sessions.length > 0 && <div className="flex items-center gap-1.5 text-gray-400"><BookOpen className="w-4 h-4 text-violet-400" />{sessions.length} sessions</div>}
                                {totalMaterials > 0 && <div className="flex items-center gap-1.5 text-gray-400"><Clock className="w-4 h-4 text-violet-400" />{totalMaterials} materials</div>}
                                {totalLabs > 0 && <div className="flex items-center gap-1.5 text-gray-400"><Code2 className="w-4 h-4 text-violet-400" />{totalLabs} labs</div>}
                                <div className="flex items-center gap-1.5 text-gray-400"><Star className="w-4 h-4 text-violet-400" />{camp.level}</div>
                            </div>
                        </div>
                        <div className="lg:w-72 bg-[#111113] border border-violet-500/20 rounded-2xl p-6 shrink-0">
                            <div className="text-3xl font-bold mb-1">{Number(camp.price).toLocaleString()} EGP</div>
                            <p className="text-sm text-gray-400 mb-5">{camp.language} · {camp.level}</p>
                            <a href={`https://wa.me/${WA_NUM}?text=${enrollMsg}`} target="_blank" rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all text-sm">
                                <MessageCircle className="w-4 h-4" />Enroll via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {sessions.length > 0 && (
                <div className="max-w-5xl mx-auto px-6 py-16">
                    <h2 className="text-2xl font-bold mb-8">Curriculum</h2>
                    <div className="space-y-4">
                        {sessions.map((cs: any) => (
                            <div key={cs.id} className="rounded-2xl border border-white/5 bg-[#0f0b1a] p-5">
                                <h3 className="font-semibold text-white">{cs.masterSession?.title}</h3>
                                {cs.masterSession?.description && <p className="text-sm text-gray-400 mt-1">{cs.masterSession.description}</p>}
                                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                                    {cs.masterSession?.materials?.length > 0 && <span>{cs.masterSession.materials.length} materials</span>}
                                    {cs.masterSession?.labs?.length > 0 && <span>{cs.masterSession.labs.length} labs</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Coming Soon Page — full professional curriculum ──────── */
function ComingSoonPage({ slug, meta }: { slug: string; meta: typeof CAMP_META[string] }) {
    const [openCourse, setOpenCourse] = useState<string | null>('00');
    const toggle = (num: string) => setOpenCourse(o => o === num ? null : num);
    const notifyMsg = encodeURIComponent(`Hi! I'm interested in ${meta.name} (${meta.tagline}). Please notify me when it launches.`);
    const totalModules = meta.courses?.reduce((s, c) => s + c.modules.length, 0) ?? 0;
    const totalLabs = meta.courses?.reduce((s, c) => s + c.labs.length, 0) ?? 0;

    return (
        <div className="min-h-screen bg-[#07050e] text-white">
            {/* ── Hero ── */}
            <div className={`border-b border-white/5 ${meta.color.bg}`}
                style={{ boxShadow: `0 0 80px ${meta.color.glow}` }}>
                <div className="max-w-5xl mx-auto px-6 py-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
                        <ArrowLeft className="w-4 h-4" />Back to all camps
                    </Link>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-5 text-xs font-bold text-amber-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />Coming Soon — 50% OFF at launch
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-5xl">{meta.icon}</span>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold">{meta.name}</h1>
                                    <p className={`text-sm ${meta.color.text} mt-1`}>{meta.tagline}</p>
                                </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed max-w-2xl mb-6">{meta.desc}</p>

                            {/* Stats row */}
                            <div className="flex flex-wrap gap-6 text-sm mb-6">
                                {Object.entries(meta.stats).map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-2 text-gray-300">
                                        <CheckCircle2 className={`w-4 h-4 ${meta.color.text}`} />
                                        <span className="font-bold">{v}</span><span className="text-gray-500">{k}</span>
                                    </div>
                                ))}
                                {totalModules > 0 && (
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <BookOpen className={`w-4 h-4 ${meta.color.text}`} />
                                        <span className="font-bold">{totalModules}</span><span className="text-gray-500">modules</span>
                                    </div>
                                )}
                                {totalLabs > 0 && (
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Code2 className={`w-4 h-4 ${meta.color.text}`} />
                                        <span className="font-bold">{totalLabs}</span><span className="text-gray-500">labs</span>
                                    </div>
                                )}
                            </div>

                            {/* Topic tags */}
                            <div className="flex flex-wrap gap-2">
                                {meta.topics.map(t => (
                                    <span key={t} className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${meta.color.bg} ${meta.color.border} ${meta.color.text}`}>{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Sticky notify card */}
                        <div className="lg:w-72 bg-[#111113] border border-white/10 rounded-2xl p-6 shrink-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 mb-4">
                                50% OFF at launch
                            </div>
                            <p className="text-2xl font-bold text-white mb-1">Reserved pricing</p>
                            <p className="text-sm text-gray-400 mb-5">Lock in 50% off by joining the waitlist now. Price rises at launch.</p>
                            <a href={`https://wa.me/${WA}?text=${notifyMsg}`} target="_blank" rel="noopener noreferrer"
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all text-sm text-white ${meta.color.btn}`}>
                                <MessageCircle className="w-4 h-4" />Join Waitlist on WhatsApp
                            </a>
                            <Link href="/" className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">
                                ← See all camps
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Curriculum ── */}
            {meta.courses && meta.courses.length > 0 && (
                <div className="max-w-5xl mx-auto px-6 py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">Complete {meta.courses.length}-Course Curriculum</h2>
                        <p className="text-gray-400 mt-3 text-sm">Click any course to see modules, labs, and skills covered.</p>
                    </div>
                    <div className="space-y-3">
                        {meta.courses.map((course) => {
                            const isOpen = openCourse === course.num;
                            return (
                                <div key={course.num}
                                    className={`rounded-2xl border transition-all overflow-hidden ${isOpen ? `${meta.color.border} ${meta.color.bg}` : 'border-white/5 bg-[#0f0b1a]'}`}>
                                    <button
                                        onClick={() => toggle(course.num)}
                                        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-colors"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono text-sm font-bold ${meta.color.bg} ${meta.color.text}`}>
                                            {course.num}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-lg">{course.icon}</span>
                                                <span className="font-semibold">{course.title}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{course.duration} · {course.modules.length} modules · {course.labs.length} labs</p>
                                        </div>
                                        <span className={`text-lg shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>›</span>
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-6 pt-1 border-t border-white/5">
                                            <p className="text-sm text-gray-400 mb-5 leading-relaxed">{course.desc}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Modules</p>
                                                    <ul className="space-y-2">
                                                        {course.modules.map((m, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                                <CheckCircle2 className={`w-3.5 h-3.5 ${meta.color.text} shrink-0 mt-0.5`} />
                                                                {m}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Labs & Exercises</p>
                                                    <ul className="space-y-2">
                                                        {course.labs.map((l, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                                <Zap className={`w-3.5 h-3.5 ${meta.color.text} shrink-0 mt-0.5`} />
                                                                {l}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="mt-4">
                                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Skills You'll Gain</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {course.skills.map((s, i) => (
                                                                <span key={i} className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${meta.color.bg} ${meta.color.border} ${meta.color.text}`}>{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── FAQ ── */}
            {meta.faqs && meta.faqs.length > 0 && (
                <div className="border-t border-white/5 bg-[#0a0812]">
                    <div className="max-w-3xl mx-auto px-6 py-16">
                        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {meta.faqs.map(({ q, a }) => (
                                <div key={q} className="rounded-2xl border border-white/5 bg-[#111113] p-6">
                                    <h3 className="font-semibold mb-2 flex items-start gap-2">
                                        <HelpCircle className={`w-4 h-4 ${meta.color.text} shrink-0 mt-0.5`} />
                                        {q}
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed pl-6">{a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Bottom CTA ── */}
            <div className="border-t border-white/5 py-20 px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6 text-xs font-semibold text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />50% OFF for waitlist members at launch
                </div>
                <h2 className="text-3xl font-bold mb-4">Reserve your spot in {meta.name}</h2>
                <p className="text-gray-400 max-w-lg mx-auto mb-8">Join the waitlist. When we launch, you'll get 50% off and early access — before the price goes up.</p>
                <a href={`https://wa.me/${WA}?text=${notifyMsg}`} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold transition-all text-white ${meta.color.btn}`}>
                    <MessageCircle className="w-5 h-5" />Join Waitlist on WhatsApp
                </a>
            </div>
        </div>
    );
}

/* ─── AOSPCamp Full Detail Page ────────────────────────────── */
function AOSPCampPage({ meta, dbCamp }: { meta: typeof CAMP_META[string]; dbCamp?: any }) {
    const [openCourse, setOpenCourse] = useState<string | null>('01');
    const toggle = (num: string) => setOpenCourse(o => o === num ? null : num);

    const totalModules = AOSP_COURSES.reduce((s, c) => s + c.modules.length, 0);
    const totalLabs = AOSP_COURSES.reduce((s, c) => s + c.labs.length, 0);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'AOSPCamp — Android Platform Engineering Bootcamp',
        description: 'The most intensive hands-on bootcamp for engineers who want to work on Android internals, HAL development, automotive systems, and embedded Android.',
        provider: { '@type': 'Organization', name: 'EmbeddedCamps', url: 'https://embeddedcamps.com' },
        url: 'https://embeddedcamps.com/camps/aosp',
        hasCourseInstance: [{
            '@type': 'CourseInstance',
            courseMode: 'online',
            courseWorkload: 'PT55H',
            offers: {
                '@type': 'Offer',
                price: '100',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
            },
        }],
        teaches: ['AOSP Build System', 'Binder IPC', 'Android Boot Flow', 'HAL Development', 'SELinux Policy', 'A/B OTA Updates', 'System Services'],
        numberOfCredits: 9,
        educationalLevel: 'Intermediate',
        inLanguage: 'en',
        image: 'https://embeddedcamps.com/og-aosp.jpg',
    };

    return (
        <div className="min-h-screen bg-[#07050e] text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* ─── Header ─── */}
            <div className="border-b border-white/5 bg-[#0a0812]">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
                        <ArrowLeft className="w-4 h-4" />Back to EmbeddedCamps
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-5xl">{meta.icon}</span>
                                <div>
                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                        <h1 className="text-3xl font-bold">{meta.name}</h1>
                                        {dbCamp?.status === 'ACTIVE'
                                        ? <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">● ENROLLING NOW</span>
                                        : dbCamp?.status === 'COMPLETED'
                                            ? <span className="px-3 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs font-bold border border-gray-500/20">● COMPLETED</span>
                                            : <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/20">● UPCOMING</span>
                                    }
                                        <span className="px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20">50% OFF</span>
                                    </div>
                                    <p className="text-violet-400">{meta.tagline}</p>
                                </div>
                            </div>
                            <p className="text-gray-400 max-w-2xl leading-relaxed mb-6">
                                The most intensive hands-on bootcamp for engineers who want to work on Android internals, HAL development, automotive systems, and embedded Android. Go from fundamentals to interview-ready in one structured program.
                            </p>
                            {/* Stats row */}
                            <div className="flex flex-wrap gap-4 text-sm">
                                {[
                                    { icon: BookOpen, label: '9 Courses' },
                                    { icon: Clock, label: '55+ Hours' },
                                    { icon: Code2, label: `${totalLabs} Labs` },
                                    { icon: Star, label: `${totalModules} Modules` },
                                    { icon: Cpu, label: 'RPi4 Hardware' },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-1.5 text-gray-400">
                                        <Icon className="w-4 h-4 text-violet-400" />{label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="lg:w-72 bg-[#111113] border border-violet-500/20 rounded-2xl p-6 shrink-0"
                            style={{ boxShadow: '0 0 40px rgba(139,92,246,0.1)' }}>
                            <div className="flex items-baseline gap-2 mb-1">
                                {dbCamp ? (
                                    <span className="text-4xl font-bold">{Number(dbCamp.price).toLocaleString()} EGP</span>
                                ) : (
                                    <>
                                        <span className="text-4xl font-bold">$100</span>
                                        <span className="text-gray-500 line-through text-lg">$200</span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 mb-4">{dbCamp ? dbCamp.level : '🇪🇬 5,500 EGP'} {!dbCamp && <span className="line-through text-gray-600">10,500 EGP</span>}</p>
                            <ul className="space-y-2 mb-5 text-sm">
                                {['All 9 courses', '1-year access', 'RPi4 hardware labs', 'Career coaching', 'Certificate'].map(i => (
                                    <li key={i} className="flex items-center gap-2 text-gray-300">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />{i}
                                    </li>
                                ))}
                            </ul>
                            <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I want to enroll in AOSPCamp (Android Platform Engineering). Please send me the payment details.')}`}
                                target="_blank" rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all text-sm mb-2">
                                <MessageCircle className="w-4 h-4" />Enroll via WhatsApp
                            </a>
                            <p className="text-center text-xs text-gray-600">7-day money back guarantee</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Curriculum ─── */}
            <div className="max-w-5xl mx-auto px-6 py-16">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-2">Full Curriculum</h2>
                    <p className="text-gray-400 text-sm">Click any course to expand modules, labs, and skills.</p>
                </div>

                <div className="space-y-4">
                    {AOSP_COURSES.map((course) => {
                        const Icon = ICON_MAP[course.num] ?? Terminal;
                        const isOpen = openCourse === course.num;
                        return (
                            <div key={course.num}
                                className={`rounded-2xl border transition-all overflow-hidden ${isOpen ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/5 bg-[#0f0b1a] hover:border-white/10'}`}>
                                {/* Header */}
                                <button
                                    onClick={() => toggle(course.num)}
                                    className="w-full flex items-center gap-4 p-5 text-left"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${isOpen ? 'bg-violet-500/20' : 'bg-white/5'} flex items-center justify-center shrink-0 transition-all`}>
                                        <Icon className={`w-5 h-5 ${isOpen ? 'text-violet-400' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap mb-0.5">
                                            <span className="text-xs font-mono text-gray-500">Course {course.num}</span>
                                            <span className="text-sm">{course.icon}</span>
                                            <span className="text-xs text-gray-500">{course.duration}</span>
                                        </div>
                                        <h3 className="font-semibold text-base text-white">{course.title}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{course.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-xs text-gray-500">{course.modules.length} modules</div>
                                            <div className="text-xs text-violet-600">{course.labs.length} labs</div>
                                        </div>
                                        {isOpen ? <ChevronUp className="w-4 h-4 text-violet-400" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isOpen && (
                                    <div className="px-5 pb-6 border-t border-violet-500/10">
                                        <p className="text-sm text-gray-400 mt-4 mb-6 leading-relaxed">{course.desc}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Modules */}
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1.5">
                                                    <BookOpen className="w-3.5 h-3.5" />Modules
                                                </h4>
                                                <ul className="space-y-2">
                                                    {course.modules.map((m, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                            <span className="text-violet-500 font-mono text-xs mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                                            <span>{m}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Labs */}
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1.5">
                                                    <Code2 className="w-3.5 h-3.5" />Hands-on Labs
                                                </h4>
                                                <ul className="space-y-2">
                                                    {course.labs.map((l, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1.5 shrink-0" />
                                                            <span>{l}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Skills */}
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1.5">
                                                    <Zap className="w-3.5 h-3.5" />Skills Gained
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {course.skills.map(s => (
                                                        <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center bg-[#0f0b1a] border border-violet-500/20 rounded-3xl p-12"
                    style={{ boxShadow: '0 0 60px rgba(139,92,246,0.08)' }}>
                    <Zap className="w-10 h-10 text-violet-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3">Ready to Master Android Platform Engineering?</h2>
                    <p className="text-gray-400 mb-2">{totalModules} modules · {totalLabs} labs · 55+ hours · Raspberry Pi 4 hardware</p>
                    <p className="text-gray-500 text-sm mb-8">{dbCamp ? <><strong className="text-white">{Number(dbCamp.price).toLocaleString()} EGP</strong></> : <>50% launch discount — <strong className="text-white">$100 USD</strong> / <strong className="text-white">5,500 EGP</strong></>}</p>
                    <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I want to enroll in AOSPCamp (Android Platform Engineering). Please send me the payment details.')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-lg transition-all">
                        <MessageCircle className="w-5 h-5" />Enroll Now via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
