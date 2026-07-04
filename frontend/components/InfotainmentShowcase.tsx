'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
  Navigation,
  Music,
  Gauge,
  Terminal,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Battery,
  Compass,
  Cpu,
  Database,
  Activity,
  AlertTriangle,
  RefreshCw,
  Sun,
  Moon,
  Sliders,
  Volume2,
  VolumeX,
  Mic,
  Send,
  MessageSquare,
  Eye,
  Bot,
  Car,
  Zap,
  Wrench,
  Users,
  Bike,
  Grid
} from 'lucide-react';


// Simulated log entries for the Logcat Console
const MOCK_LOGS = [
  { level: 'I', tag: 'Init', msg: 'init second stage started!' },
  { level: 'I', tag: 'Init', msg: 'Service \'hal_vehicle_default\' (pid 412) started successfully.' },
  { level: 'I', tag: 'VHAL', msg: 'VehicleHalManager initialized. VHAL API v2.0 Ready.' },
  { level: 'D', tag: 'VHAL', msg: 'Registering vehicle property: 0x11400407 (VEHICLE_SPEED)' },
  { level: 'D', tag: 'VHAL', msg: 'Registering vehicle property: 0x11200400 (GEAR_SELECTION)' },
  { level: 'D', tag: 'VHAL', msg: 'Registering vehicle property: 0x11400301 (FUEL_LEVEL)' },
  { level: 'I', tag: 'SELinux', msg: 'selinux: loaded 120 policy rules from /vendor/etc/selinux/' },
  { level: 'I', tag: 'CarService', msg: 'Connecting to Vehicle HAL at binder interface...' },
  { level: 'I', tag: 'CarService', msg: 'Connected successfully. CarPropertyService active.' },
  { level: 'D', tag: 'CarService', msg: 'Subscribing to VEHICLE_SPEED changes.' },
  { level: 'I', tag: 'AudioHAL', msg: 'Primary audio out stream opened. Mode: Automotive IVI.' },
  { level: 'D', tag: 'SensorService', msg: 'GNSS fixed. Mode: 3D_FIX. Satellite count: 9' },
  { level: 'I', tag: 'ActivityManager', msg: 'Start proc com.android.car.media for broadcast intent...' },
  { level: 'D', tag: 'CarPropertyManager', msg: 'Property VEHICLE_SPEED changed: value=0.0' },
  { level: 'I', tag: 'SystemServer', msg: 'CarService boot phase 500 completed.' },
  { level: 'I', tag: 'WindowManager', msg: 'CarSystemUI window layers configuration loaded.' },
  { level: 'I', tag: 'NavigationService', msg: 'Route calculated successfully: AOSP Camp HQ -> Raspberry Pi Lab' },
];

const EXTRA_LOGS = [
  'D/VHAL: Property VEHICLE_SPEED update: speed_kmh={SPEED}',
  'D/VHAL: Property GEAR_SELECTION update: gear=DRIVE',
  'I/SensorService: Acceleration rate: X=0.04g, Y=0.02g, Z=0.98g',
  'D/CarPropertyManager: Property 0x11400407 notified to subscribers.',
  'I/Binder: Thread pool transaction: transact code 14, size 64 bytes',
  'D/AudioHAL: Active volume stream: STREAM_MUSIC, level=18',
  'I/CpuMonitor: CPU Usage: usr={CPU_USR}%, sys={CPU_SYS}%, idle={CPU_IDLE}%',
  'D/NavigationService: Updated position: lat=30.0594, lon=31.2234 (Heading={HEADING}°)',
];

const FONT_MAP: Record<string, number[]> = {
  'A': [0x7E, 0x11, 0x11, 0x11, 0x7E],
  'B': [0x7F, 0x49, 0x49, 0x49, 0x36],
  'C': [0x3E, 0x41, 0x41, 0x41, 0x22],
  'D': [0x7F, 0x41, 0x41, 0x41, 0x3E],
  'E': [0x7F, 0x49, 0x49, 0x49, 0x41],
  'F': [0x7F, 0x09, 0x09, 0x09, 0x01],
  'G': [0x3E, 0x41, 0x49, 0x49, 0x7A],
  'H': [0x7F, 0x08, 0x08, 0x08, 0x7F],
  'I': [0x00, 0x41, 0x7F, 0x41, 0x00],
  'J': [0x20, 0x40, 0x41, 0x3F, 0x01],
  'K': [0x7F, 0x08, 0x14, 0x22, 0x41],
  'L': [0x7F, 0x40, 0x40, 0x40, 0x40],
  'M': [0x7F, 0x02, 0x0C, 0x02, 0x7F],
  'N': [0x7F, 0x04, 0x08, 0x10, 0x7F],
  'O': [0x3E, 0x41, 0x41, 0x41, 0x3E],
  'P': [0x7F, 0x09, 0x09, 0x09, 0x06],
  'Q': [0x3E, 0x41, 0x51, 0x21, 0x5E],
  'R': [0x7F, 0x09, 0x19, 0x29, 0x46],
  'S': [0x46, 0x49, 0x49, 0x49, 0x31],
  'T': [0x01, 0x01, 0x7F, 0x01, 0x01],
  'U': [0x3F, 0x40, 0x40, 0x40, 0x3F],
  'V': [0x1F, 0x20, 0x40, 0x20, 0x1F],
  'W': [0x7F, 0x20, 0x18, 0x20, 0x7F],
  'X': [0x63, 0x14, 0x08, 0x14, 0x63],
  'Y': [0x07, 0x08, 0x70, 0x08, 0x07],
  'Z': [0x61, 0x51, 0x49, 0x45, 0x43],
  '0': [0x3E, 0x51, 0x49, 0x45, 0x3E],
  '1': [0x00, 0x42, 0x7F, 0x40, 0x00],
  '2': [0x42, 0x61, 0x51, 0x49, 0x46],
  '3': [0x21, 0x41, 0x45, 0x4B, 0x31],
  '4': [0x18, 0x14, 0x12, 0x7F, 0x10],
  '5': [0x27, 0x45, 0x45, 0x45, 0x39],
  '6': [0x3C, 0x4A, 0x49, 0x49, 0x30],
  '7': [0x01, 0x71, 0x09, 0x05, 0x03],
  '8': [0x36, 0x49, 0x49, 0x49, 0x36],
  '9': [0x06, 0x49, 0x49, 0x29, 0x1E],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
  '.': [0x00, 0x60, 0x60, 0x00, 0x00],
  '!': [0x00, 0x00, 0x5F, 0x00, 0x00],
  '?': [0x02, 0x01, 0x51, 0x09, 0x06],
  '-': [0x08, 0x08, 0x08, 0x08, 0x08],
  '+': [0x08, 0x08, 0x3E, 0x08, 0x08],
  '*': [0x2A, 0x1C, 0x3E, 0x1C, 0x2A],
  '/': [0x60, 0x10, 0x08, 0x04, 0x03],
  '=': [0x24, 0x24, 0x24, 0x24, 0x24],
};

export default function InfotainmentShowcase() {
  const toast = useToast();
  // Top-Level Systems: 'ivi' | 'voice' | 'adas' | 'ev' | 'diag' | 'cabin' | 'bike' | 'led'
  const [currentSystem, setCurrentSystem] = useState<'ivi' | 'voice' | 'adas' | 'ev' | 'diag' | 'cabin' | 'bike' | 'led'>('ivi');
  
  // LED Matrix States
  const [ledMode, setLedMode] = useState<'music' | 'env' | 'text'>('music');
  const [ledTheme, setLedTheme] = useState<'fire' | 'ocean' | 'forest' | 'cyberpunk'>('fire');
  const [ledMusicStyle, setLedMusicStyle] = useState<'equalizer' | 'wave' | 'pulse' | 'rainbow'>('equalizer');
  const [ledSpeed, setLedSpeed] = useState<number>(3);
  const [ledBrightness, setLedBrightness] = useState<number>(80);
  const [ledText, setLedText] = useState<string>('AOSP CAMP');
  const [ledTextOffset, setLedTextOffset] = useState<number>(0);
  const [ledTimeVal, setLedTimeVal] = useState<number>(0);
  const [ledTextColor, setLedTextColor] = useState<string>('#d946ef');

  // IVI Sub-Tabs: 'nav' | 'media' | 'telemetry' | 'logcat'
  const [activeTab, setActiveTab] = useState<'nav' | 'media' | 'telemetry' | 'logcat'>('nav');
  
  // Shared Cockpit States
  const [isPlaying, setIsPlaying] = useState(true);
  const [trackProgress, setTrackProgress] = useState(42);
  const [speed, setSpeed] = useState(65);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [binderIpc, setBinderIpc] = useState(840);
  const [temp, setTemp] = useState(38);
  const [cabinTemp, setCabinTemp] = useState(22.5);
  const [sysTime, setSysTime] = useState('10:45 AM');
  
  // Logcat States
  const [logs, setLogs] = useState<{ level: string; tag: string; msg: string; time: string }[]>([]);
  const [isLogStreaming, setIsLogStreaming] = useState(true);
  const [crashState, setCrashState] = useState<'idle' | 'crashing' | 'rebooting'>('idle');

  // AI Voice Assistant States
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'assistant' | 'system'; text: string }[]>([
    { sender: 'system', text: 'Local LLM Agent loaded. NPU Accelerator online.' },
    { sender: 'assistant', text: 'Hello! I am your AOSP Cockpit Assistant. I can scan board diagnostics, optimize memory, or adjust climate. Try asking me something.' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechStatus, setSpeechStatus] = useState('Click sphere to speak');
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ADAS Vision States
  const [adasDistance, setAdasDistance] = useState(35); // distance in meters
  const [adasNightVision, setAdasNightVision] = useState(false);
  const [adasDetectionActive, setAdasDetectionActive] = useState(true);

  // EV Powertrain AI States
  const [evDriveMode, setEvDriveMode] = useState<'eco' | 'normal' | 'sport'>('normal');
  const [evRegen, setEvRegen] = useState<number>(40);
  const [evSoc, setEvSoc] = useState<number>(82);

  // OBD-II AI Diagnostics States
  const [diagSelectedNode, setDiagSelectedNode] = useState<'engine' | 'battery' | 'brakes' | 'camera' | 'ivi' | null>(null);
  const [diagScanProgress, setDiagScanProgress] = useState<number>(0);
  const [diagScanStatus, setDiagScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [diagTerminalOutput, setDiagTerminalOutput] = useState<string>('sh: diagnostics command-line active. Ready.');

  // Cabin AI (DMS/OMS) States
  const [cabinDriverState, setCabinDriverState] = useState<'attentive' | 'distracted' | 'drowsy'>('attentive');
  const [cabinAmbientColor, setCabinAmbientColor] = useState<'blue' | 'purple' | 'orange' | 'cyan'>('blue');
  const [cabinSeatbeltDriver, setCabinSeatbeltDriver] = useState<boolean>(true);
  const [cabinSeatbeltPassenger, setCabinSeatbeltPassenger] = useState<boolean>(false);
  const [cabinDrowsiness, setCabinDrowsiness] = useState<number>(8);
  const [cabinSubTab, setCabinSubTab] = useState<'dms' | 'bcm' | 'cluster'>('dms');
  const [cabinDoorFL, setCabinDoorFL] = useState<boolean>(false);
  const [cabinDoorFR, setCabinDoorFR] = useState<boolean>(false);
  const [cabinDoorRL, setCabinDoorRL] = useState<boolean>(false);
  const [cabinDoorRR, setCabinDoorRR] = useState<boolean>(false);
  const [cabinDoorHood, setCabinDoorHood] = useState<boolean>(false);
  const [cabinDoorTrunk, setCabinDoorTrunk] = useState<boolean>(false);
  const [cabinWindowFL, setCabinWindowFL] = useState<boolean>(false);
  const [cabinWindowFR, setCabinWindowFR] = useState<boolean>(false);
  const [cabinWindowRL, setCabinWindowRL] = useState<boolean>(false);
  const [cabinWindowRR, setCabinWindowRR] = useState<boolean>(false);
  const [cabinAcActive, setCabinAcActive] = useState<boolean>(true);
  const [cabinAcSync, setCabinAcSync] = useState<boolean>(true);
  const [cabinAcFanSpeed, setCabinAcFanSpeed] = useState<'auto' | 'low' | 'med' | 'high'>('auto');
  const [cabinAcMode, setCabinAcMode] = useState<'face' | 'feet' | 'defrost'>('face');
  const [cabinAcRecirc, setCabinAcRecirc] = useState<boolean>(true);
  const [cabinTempPassenger, setCabinTempPassenger] = useState<number>(22.5);
  const [cabinSeatHeaterDriver, setCabinSeatHeaterDriver] = useState<number>(0);
  const [cabinSeatHeaterPassenger, setCabinSeatHeaterPassenger] = useState<number>(0);
  const [cabinHeadlights, setCabinHeadlights] = useState<'off' | 'parking' | 'on'>('off');
  const [cabinHazards, setCabinHazards] = useState<boolean>(false);

  // Smart Bike Cluster States
  const [bikeAssist, setBikeAssist] = useState<number>(2); // Tour mode by default
  const [bikeCadence, setBikeCadence] = useState<number>(75); // 75 RPM
  const [bikeGear, setBikeGear] = useState<number>(5); // 5th Gear
  const [bikeBattery, setBikeBattery] = useState<number>(94);
  const [bikeOdo, setBikeOdo] = useState<number>(342.8);


  const logContainerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // System Clock simulation
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setSysTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Telemetry fluctuation & Throttle interaction
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(() => {
        const base = Math.min(95, Math.max(15, Math.floor(speed * 0.5) + 15));
        const noise = Math.floor(Math.random() * 8) - 4;
        return Math.min(100, Math.max(0, base + noise));
      });
      setBinderIpc(() => {
        const base = speed * 10 + 200;
        const noise = Math.floor(Math.random() * 120) - 60;
        return Math.max(50, base + noise);
      });
      setTemp(() => {
        const base = Math.floor(speed * 0.15) + 32;
        const noise = Math.random() * 0.4 - 0.2;
        return parseFloat((base + noise).toFixed(1));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [speed]);

  // Media Player Playback Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTrackProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // LED Matrix Animation Tick (RequestAnimationFrame)
  useEffect(() => {
    let animId: number;
    const tick = () => {
      if (currentSystem === 'led') {
        setLedTimeVal((prev) => prev + 0.016 * ledSpeed);
        animId = requestAnimationFrame(tick);
      }
    };
    if (currentSystem === 'led') {
      animId = requestAnimationFrame(tick);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [currentSystem, ledSpeed]);

  // Reset text offset when text or mode changes
  useEffect(() => {
    setLedTextOffset(0);
  }, [ledText, ledMode]);

  // LED Scrolling Text Offset Scroll Loop
  useEffect(() => {
    if (currentSystem !== 'led' || ledMode !== 'text') return;

    const textUpper = ledText.toUpperCase();
    const textCols: number[] = [];
    for (let i = 0; i < textUpper.length; i++) {
      const char = textUpper[i];
      const colData = FONT_MAP[char] || FONT_MAP[' '];
      textCols.push(...colData);
      textCols.push(0x00);
    }
    const totalLen = 16 + textCols.length;

    const intervalMs = Math.max(40, 360 - ledSpeed * 70);
    const interval = setInterval(() => {
      setLedTextOffset((prev) => {
        const next = prev + 1;
        return next >= totalLen ? 0 : next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [currentSystem, ledMode, ledSpeed, ledText]);

  // Logcat stream simulation
  useEffect(() => {
    // Initial logs load
    const initialLogs = MOCK_LOGS.map((log) => {
      const now = new Date();
      return {
        ...log,
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${(Math.floor(Math.random() * 900) + 100)}`
      };
    });
    setLogs(initialLogs);

    const interval = setInterval(() => {
      if (!isLogStreaming || crashState !== 'idle') return;

      const randomLogTemplate = EXTRA_LOGS[Math.floor(Math.random() * EXTRA_LOGS.length)];
      const headingVal = Math.floor(Math.random() * 360);
      const cpuVal = Math.max(10, Math.floor(speed * 0.5) + 10);
      const sysVal = Math.floor(cpuVal * 0.3);
      const idleVal = 100 - cpuVal - sysVal;

      const message = randomLogTemplate
        .replace('{SPEED}', speed.toFixed(1))
        .replace('{CPU_USR}', cpuVal.toString())
        .replace('{CPU_SYS}', sysVal.toString())
        .replace('{CPU_IDLE}', idleVal.toString())
        .replace('{HEADING}', headingVal.toString());

      const parts = message.split('/');
      const header = parts[0];
      const level = header.substring(0, 1);
      const tag = header.substring(2);
      const msg = parts.slice(1).join('/');

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${(Math.floor(Math.random() * 900) + 100)}`;

      setLogs((prev) => {
        const next = [...prev, { level, tag, msg, time: timeStr }];
        return next.slice(-40); // cap at last 40 logs
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isLogStreaming, crashState, speed]);

  // Auto-scroll Logcat (Fix scroll jumping)
  useEffect(() => {
    if (activeTab === 'logcat' && currentSystem === 'ivi' && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, activeTab, currentSystem]);

  // Auto-scroll Chat (Fix scroll jumping)
  useEffect(() => {
    if (currentSystem === 'voice' && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, currentSystem]);

  // Web Speech recognition hook initialization & synthesis cleanup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const rec = new SpeechRecognitionClass();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          setSpeechStatus('Listening...');
        };

        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setSpeechStatus('Thinking...');
          executeAiCommand(text);
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setSpeechStatus('Mic permission denied');
          } else {
            setSpeechStatus('Error: ' + event.error);
          }
          setTimeout(() => {
            setSpeechStatus(prev => (prev.startsWith('Error:') || prev === 'Mic permission denied') ? 'Click sphere to speak' : prev);
          }, 3000);
        };

        rec.onend = () => {
          setIsListening(false);
          setTimeout(() => {
            setSpeechStatus(prev => (prev === 'Listening...' || prev === 'Thinking...') ? 'Click sphere to speak' : prev);
          }, 1500);
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cancel speech synthesis and recognition immediately when switching away from 'voice' system
  useEffect(() => {
    if (currentSystem !== 'voice') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Failed to stop speech recognition on system switch:', e);
        }
        setIsListening(false);
      }
      setSpeechStatus('Click sphere to speak');
    }
  }, [currentSystem, isListening]);

  // Cancel speech synthesis immediately when muted
  useEffect(() => {
    if (isMuted) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeechStatus(prev => (prev === 'Speaking...') ? 'Click sphere to speak' : prev);
    }
  }, [isMuted]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast.warning('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    // Insecure origin warning (Speech recognition requires HTTPS or localhost in modern browsers)
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      console.warn('Voice Speech Recognition requires an HTTPS secure connection or localhost. It may fail to access the microphone on this HTTP origin.');
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Failed to stop speech recognition:', err);
      }
      setIsListening(false);
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const speakAssistantReply = (text: string, onEnd?: () => void) => {
    if (isMuted || currentSystem !== 'voice') {
      setSpeechStatus('Click sphere to speak');
      if (onEnd) onEnd();
      return;
    }
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    // Remove emoji icons from reading text to keep speech clean
    const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance; // Keep a strong reference to prevent GC
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setSpeechStatus('Speaking...');
    };

    utterance.onend = () => {
      utteranceRef.current = null;
      setSpeechStatus(prev => prev === 'Speaking...' ? 'Click sphere to speak' : prev);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      const isCancelled = e.error === 'interrupted' || e.error === 'canceled';
      if (isCancelled) {
        utteranceRef.current = null;
        return;
      }
      console.error('Speech synthesis error:', e);
      utteranceRef.current = null;
      setSpeechStatus(prev => prev === 'Speaking...' ? 'Click sphere to speak' : prev);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Simulated ANR Crash trigger
  const triggerCrash = () => {
    if (crashState !== 'idle') return;

    setCrashState('crashing');
    setIsLogStreaming(false);

    // Append Crash logs
    const now = new Date();
    const t = () => `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.000`;

    const crashLogs = [
      { level: 'E', tag: 'AndroidRuntime', msg: '*** FATAL EXCEPTION IN SYSTEM PROCESS: MainThread', time: t() },
      { level: 'E', tag: 'AndroidRuntime', msg: 'java.lang.NullPointerException: Attempt to invoke virtual method \'void android.car.hardware.property.CarPropertyManager.setProperty(int, int, java.lang.Object)\' on a null object reference', time: t() },
      { level: 'E', tag: 'AndroidRuntime', msg: '\tat com.android.car.vehiclehal.VehiclePropertyController.updateVehicleSpeed(VehiclePropertyController.java:184)', time: t() },
      { level: 'E', tag: 'AndroidRuntime', msg: '\tat com.android.car.vehiclehal.VehiclePropertyController.onThrottleChanged(VehiclePropertyController.java:92)', time: t() },
      { level: 'E', tag: 'ProcessManager', msg: 'System Server process crashed due to Exception. Requesting System Reboot.', time: t() },
      { level: 'W', tag: 'Watchdog', msg: 'watchdog: Service vehicle_hal failed to respond. Triggering dump.', time: t() },
      { level: 'E', tag: 'Tombstone', msg: 'Tombstone generated at /data/tombstones/tombstone_02. Write completed.', time: t() },
      { level: 'E', tag: 'Cuttlefish', msg: 'Guest kernel panic. Bootloader resetting virtual machine...', time: t() }
    ];

    setLogs((prev) => [...prev, ...crashLogs]);

    // Stage 2: rebooting state
    setTimeout(() => {
      setCrashState('rebooting');
      setSpeed(0);
    }, 2500);

    // Stage 3: Restore system
    setTimeout(() => {
      setCrashState('idle');
      setIsLogStreaming(true);
      const recoveryLogs = [
        { level: 'I', tag: 'Bootloader', msg: 'Cuttlefish GRUB Bootloader loading...', time: t() },
        { level: 'I', tag: 'Kernel', msg: 'Linux version 5.15.110-android13-gbf64b38d3840 (aosp-builder) (clang version 14.0.6) #1 SMP PREEMPT', time: t() },
        { level: 'I', tag: 'Init', msg: 'init first stage started!', time: t() },
        { level: 'I', tag: 'Init', msg: 'SELinux enabled. Rules compiling...', time: t() },
        { level: 'I', tag: 'Init', msg: 'init second stage started!', time: t() },
        { level: 'I', tag: 'VHAL', msg: 'Vehicle HAL restarted. Recovery successful.', time: t() }
      ];
      setLogs(recoveryLogs);
    }, 6000);
  };

  // AI Voice Assistant suggestion executor
  const executeAiCommand = (commandText: string) => {
    if (isAiTyping) return;

    // Stop recording and active synthesis if active to prevent overlapping input
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setSpeechStatus('Thinking...');

    // 1. Add user message bubble
    setChatMessages((prev) => [...prev, { sender: 'user', text: commandText }]);
    setIsAiTyping(true);

    // 2. Mock processing delay
    setTimeout(() => {
      let reply = "I've received your request, but I couldn't execute it. Please check system configurations.";
      let transitionCallback: (() => void) | undefined = undefined;
      
      const lowerCmd = commandText.toLowerCase();

      // Rule-based controls: LED Matrix Mode
      if (lowerCmd.includes('led mode') || lowerCmd.includes('matrix mode')) {
        if (lowerCmd.includes('music')) {
          setLedMode('music');
          reply = "LED Matrix operational mode updated to Music Sync. Visualizers will now react to active audio streams.";
        } else if (lowerCmd.includes('env') || lowerCmd.includes('ambient') || lowerCmd.includes('mood')) {
          setLedMode('env');
          reply = "LED Matrix operational mode updated to Ambient Mood. Presenting dynamic environment cabin theme.";
        } else if (lowerCmd.includes('text')) {
          setLedMode('text');
          reply = "LED Matrix operational mode updated to Scrolling Text. Type your message on the controller console to see it scroll.";
        }
      }
      // Rule-based controls: LED Text color
      else if (lowerCmd.includes('led color') || lowerCmd.includes('matrix color') || lowerCmd.includes('text color')) {
        if (lowerCmd.includes('cyan')) {
          setLedTextColor('#06b6d4');
          reply = "LED Matrix scrolling text color set to Cyan.";
        } else if (lowerCmd.includes('fuchsia') || lowerCmd.includes('purple')) {
          setLedTextColor('#d946ef');
          reply = "LED Matrix scrolling text color set to Fuchsia.";
        } else if (lowerCmd.includes('emerald') || lowerCmd.includes('green')) {
          setLedTextColor('#10b981');
          reply = "LED Matrix scrolling text color set to Emerald.";
        } else if (lowerCmd.includes('amber') || lowerCmd.includes('orange') || lowerCmd.includes('yellow')) {
          setLedTextColor('#f59e0b');
          reply = "LED Matrix scrolling text color set to Amber.";
        } else if (lowerCmd.includes('crimson') || lowerCmd.includes('red')) {
          setLedTextColor('#ef4444');
          reply = "LED Matrix scrolling text color set to Crimson.";
        } else {
          reply = "LED Matrix text color support is available for Fuchsia, Cyan, Amber, Emerald, and Crimson.";
        }
      }
      // Rule-based controls: LED Text Content change
      else if (lowerCmd.includes('change led text to') || lowerCmd.includes('set led text to')) {
        let newTxt = "";
        if (lowerCmd.includes('change led text to')) {
          newTxt = commandText.substring(lowerCmd.indexOf('change led text to') + 18).trim();
        } else {
          newTxt = commandText.substring(lowerCmd.indexOf('set led text to') + 15).trim();
        }
        if (newTxt) {
          if (newTxt.startsWith('"') && newTxt.endsWith('"')) {
            newTxt = newTxt.substring(1, newTxt.length - 1);
          } else if (newTxt.startsWith("'") && newTxt.endsWith("'")) {
            newTxt = newTxt.substring(1, newTxt.length - 1);
          }
          setLedText(newTxt.toUpperCase());
          setLedMode('text');
          reply = `LED Matrix scrolling text updated to "${newTxt.toUpperCase()}" and mode set to Scrolling Text.`;
        } else {
          reply = "Please specify a text string. Example: 'Set LED text to Hello World'.";
        }
      }
      // Rule-based controls: LED Theme (Environment preset)
      else if (lowerCmd.includes('led theme') || lowerCmd.includes('matrix theme')) {
        if (lowerCmd.includes('fire') || lowerCmd.includes('warm')) {
          setLedTheme('fire');
          setLedMode('env');
          reply = "LED Matrix Environment Preset set to Fire (Warm Thermal Shader). Mode set to Ambient.";
        } else if (lowerCmd.includes('ocean') || lowerCmd.includes('wave') || lowerCmd.includes('cruise')) {
          setLedTheme('ocean');
          setLedMode('env');
          reply = "LED Matrix Environment Preset set to Ocean (Fluid Waves). Mode set to Ambient.";
        } else if (lowerCmd.includes('forest') || lowerCmd.includes('eco')) {
          setLedTheme('forest');
          setLedMode('env');
          reply = "LED Matrix Environment Preset set to Forest (Eco Green). Mode set to Ambient.";
        } else if (lowerCmd.includes('cyberpunk') || lowerCmd.includes('sport')) {
          setLedTheme('cyberpunk');
          setLedMode('env');
          reply = "LED Matrix Environment Preset set to Cyberpunk (Sport Pulse). Mode set to Ambient.";
        }
      }
      // Rule-based controls: LED Style (Music visualizer style)
      else if (lowerCmd.includes('led style') || lowerCmd.includes('matrix style')) {
        if (lowerCmd.includes('equalizer') || lowerCmd.includes('spectrum')) {
          setLedMusicStyle('equalizer');
          setLedMode('music');
          reply = "LED Music Visualizer style set to Spectrum EQ. Mode set to Music Sync.";
        } else if (lowerCmd.includes('wave') || lowerCmd.includes('sine') || lowerCmd.includes('oscilloscope')) {
          setLedMusicStyle('wave');
          setLedMode('music');
          reply = "LED Music Visualizer style set to Sine Oscilloscope. Mode set to Music Sync.";
        } else if (lowerCmd.includes('pulse') || lowerCmd.includes('ring')) {
          setLedMusicStyle('pulse');
          setLedMode('music');
          reply = "LED Music Visualizer style set to Concentric Ring. Mode set to Music Sync.";
        } else if (lowerCmd.includes('rainbow') || lowerCmd.includes('drift')) {
          setLedMusicStyle('rainbow');
          setLedMode('music');
          reply = "LED Music Visualizer style set to Rainbow Drift. Mode set to Music Sync.";
        }
      }
      // Rule-based controls: LED Speed
      else if (lowerCmd.includes('led speed') || lowerCmd.includes('matrix speed')) {
        const match = lowerCmd.match(/(?:led speed|matrix speed)(?: to)?\s*([1-5])/);
        if (match && match[1]) {
          const speedVal = parseInt(match[1]);
          setLedSpeed(speedVal);
          reply = `LED Matrix refresh clock speed frequency adjusted to ${speedVal}x.`;
        } else {
          reply = "Please specify a speed level between 1 and 5. Example: 'Set LED speed to 4'.";
        }
      }
      // Rule-based controls: LED Brightness
      else if (lowerCmd.includes('led brightness') || lowerCmd.includes('matrix brightness')) {
        const match = lowerCmd.match(/(?:led brightness|matrix brightness)(?: to)?\s*(\d+)/);
        if (match && match[1]) {
          const brightnessVal = Math.max(20, Math.min(100, parseInt(match[1])));
          setLedBrightness(brightnessVal);
          reply = `LED Matrix luminance intensity adjusted to ${brightnessVal}%.`;
        } else {
          reply = "Please specify a brightness percentage between 20% and 100%. Example: 'Set LED brightness to 80'.";
        }
      }
      // Rule-based controls: Door Opening/Closing
      else if (lowerCmd.includes('door') && (lowerCmd.includes('open') || lowerCmd.includes('close'))) {
        const action = lowerCmd.includes('open');
        if (lowerCmd.includes('all')) {
          setCabinDoorFL(action);
          setCabinDoorFR(action);
          setCabinDoorRL(action);
          setCabinDoorRR(action);
          reply = `VHAL command issued: ${action ? 'Opening' : 'Closing'} all cabin doors.`;
        } else if (lowerCmd.includes('driver') || lowerCmd.includes('front left') || lowerCmd.includes('left front')) {
          setCabinDoorFL(action);
          reply = `VHAL command issued: Front-Left (Driver) door ${action ? 'opened' : 'closed'}.`;
        } else if (lowerCmd.includes('passenger') || lowerCmd.includes('front right') || lowerCmd.includes('right front')) {
          setCabinDoorFR(action);
          reply = `VHAL command issued: Front-Right (Passenger) door ${action ? 'opened' : 'closed'}.`;
        } else if (lowerCmd.includes('rear left') || lowerCmd.includes('left rear')) {
          setCabinDoorRL(action);
          reply = `VHAL command issued: Rear-Left door ${action ? 'opened' : 'closed'}.`;
        } else if (lowerCmd.includes('rear right') || lowerCmd.includes('right rear')) {
          setCabinDoorRR(action);
          reply = `VHAL command issued: Rear-Right door ${action ? 'opened' : 'closed'}.`;
        } else if (lowerCmd.includes('hood')) {
          setCabinDoorHood(action);
          reply = `VHAL command issued: Hood/Bonnet ${action ? 'opened' : 'closed'}.`;
        } else if (lowerCmd.includes('trunk') || lowerCmd.includes('boot')) {
          setCabinDoorTrunk(action);
          reply = `VHAL command issued: Trunk/Boot ${action ? 'opened' : 'closed'}.`;
        }
      }
      // Rule-based controls: Headlights
      else if (lowerCmd.includes('headlight') || lowerCmd.includes('beam')) {
        if (lowerCmd.includes('off')) {
          setCabinHeadlights('off');
          reply = "VHAL exterior lighting command issued: Headlights toggled OFF.";
        } else if (lowerCmd.includes('parking')) {
          setCabinHeadlights('parking');
          reply = "VHAL exterior lighting command issued: Headlights set to Parking lights.";
        } else {
          setCabinHeadlights('on');
          reply = "VHAL exterior lighting command issued: Headlights toggled ON.";
        }
      }
      // Rule-based controls: Hazards
      else if (lowerCmd.includes('hazard')) {
        const action = !lowerCmd.includes('off');
        setCabinHazards(action);
        reply = `VHAL safety system command: Hazard warning flashers ${action ? 'activated' : 'deactivated'}.`;
      }
      // Rule-based controls: View System Switching
      else if (lowerCmd.includes('switch to') || lowerCmd.includes('show') || lowerCmd.includes('open')) {
        if (lowerCmd.includes('led') || lowerCmd.includes('matrix')) {
          reply = "Switching layout display view to the LED Matrix visualizer system.";
          transitionCallback = () => setCurrentSystem('led');
        } else if (lowerCmd.includes('cabin') || lowerCmd.includes('seat') || lowerCmd.includes('climate')) {
          reply = "Switching layout display view to the Cabin DMS/OMS dashboard.";
          transitionCallback = () => setCurrentSystem('cabin');
        } else if (lowerCmd.includes('map') || lowerCmd.includes('nav') || lowerCmd.includes('route')) {
          reply = "Switching layout display view to IVI Navigation Map.";
          transitionCallback = () => {
            setCurrentSystem('ivi');
            setActiveTab('nav');
          };
        } else if (lowerCmd.includes('media') || lowerCmd.includes('music') || lowerCmd.includes('player')) {
          reply = "Switching layout display view to IVI Media Player.";
          transitionCallback = () => {
            setCurrentSystem('ivi');
            setActiveTab('media');
          };
        } else if (lowerCmd.includes('diag') || lowerCmd.includes('obd') || lowerCmd.includes('errors')) {
          reply = "Switching layout display view to CAN OBD-II Diagnostics console.";
          transitionCallback = () => setCurrentSystem('diag');
        } else if (lowerCmd.includes('bike') || lowerCmd.includes('cycle')) {
          reply = "Switching layout display view to Smart E-Bike Cluster panel.";
          transitionCallback = () => setCurrentSystem('bike');
        } else if (lowerCmd.includes('voice') || lowerCmd.includes('assistant') || lowerCmd.includes('chat')) {
          reply = "Staying on Voice AI Assistant view. Ready for commands!";
        } else {
          reply = "Command received to switch system, but unrecognized screen name target. Try 'show led matrix', 'show cabin', 'show map', 'show diagnostics', or 'show bike'.";
        }
      }
      // Existing presets: Climate Temperature
      else if (lowerCmd.includes('temp') || lowerCmd.includes('climate')) {
        const match = lowerCmd.match(/temp(?:erature)?(?: to)?\s*(\d+(?:\.\d+)?)/);
        if (match && match[1]) {
          const tVal = parseFloat(match[1]);
          setCabinTemp(tVal);
          reply = `Adjusting vehicle Climate Control HAL. The cabin temperature is now set to ${tVal.toFixed(1)}°C.`;
        } else {
          setCabinTemp(21.0);
          reply = "Adjusting vehicle Climate Control HAL. The cabin temperature is now set to 21.0°C.";
        }
      } else if (lowerCmd.includes('optimize') || lowerCmd.includes('memory') || lowerCmd.includes('ram')) {
        setCpuUsage(18);
        setBinderIpc(340);
        reply = "Initiating garbage collection. Releasing cached file nodes in SystemServer... Freed 1.2 GB RAM. CPU load lowered to 18%.";
      } else if (lowerCmd.includes('navigate') || lowerCmd.includes('route') || lowerCmd.includes('location')) {
        reply = "Route calculated: AOSP Camp HQ -> Raspberry Pi Lab (8.4 km). Transferring map layout coordinates to the IVI Center Console Display now...";
        transitionCallback = () => {
          setCurrentSystem('ivi');
          setActiveTab('nav');
        };
      } else if (lowerCmd.includes('diagnose') || lowerCmd.includes('hal') || lowerCmd.includes('scan')) {
        reply = "Executing system diagnostic scan:\n- binder IPC bandwidth: Nominal\n- Vehicle HAL bindings: OK\n- Audio HAL status: Mode IVI active\n- SEPolicy rules checking: Enforcing mode";
      } else if (lowerCmd.includes('hello') || lowerCmd.includes('hey') || lowerCmd.includes('hi')) {
        reply = "Hello! I am your AOSP Cockpit Assistant. You can tell me to: 'open all doors', 'turn on hazards', 'show led matrix', 'set led color to green', 'change led text to HELLO', or 'set temperature to 23'. How can I help you today?";
      } else {
        reply = `Processing query: "${commandText}"...\nLocal LLM inference complete. guest-coprocessor NPU thread execution succeeded in 72ms. System feedback: OK.`;
      }

      setChatMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
      setIsAiTyping(false);
      speakAssistantReply(reply, transitionCallback);
    }, 1200);
  };

  const handleCustomAiSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const txt = aiInput;
    setAiInput('');
    
    // Stop recording and speaking on manual chat input
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
      setIsListening(false);
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    executeAiCommand(txt);
  };

  const getLedState = (x: number, y: number) => {
    let isActive = false;
    let color = '#d946ef';

    if (ledMode === 'music') {
      if (ledMusicStyle === 'equalizer') {
        const phase = ledTimeVal * 2.5 + x * 0.7;
        let baseHeight = 5 + 4 * Math.sin(phase) + 2.5 * Math.sin(phase * 1.6);
        if (!isPlaying) {
          baseHeight = 1.5 + 0.5 * Math.sin(x * 1.2);
        }
        const h = Math.max(0, Math.min(12, baseHeight));
        isActive = (11 - y) < h;
        
        if (y < 3) {
          color = '#ef4444'; // Red
        } else if (y < 7) {
          color = '#f97316'; // Orange
        } else {
          color = '#22c55e'; // Green
        }
      } else if (ledMusicStyle === 'wave') {
        const centerY = 5.5 + (isPlaying ? 3.5 * Math.sin((x + ledTimeVal * 4.5) * 0.4) : 1.0 * Math.sin(x * 0.5));
        isActive = Math.abs(y - centerY) < 1.2;
        const hue = (x * 12 + ledTimeVal * 60) % 360;
        color = `hsl(${hue}, 90%, 60%)`;
      } else if (ledMusicStyle === 'pulse') {
        const dx = x - 7.5;
        const dy = y - 5.5;
        const d = Math.sqrt(dx * dx + dy * dy);
        const val = isPlaying 
          ? Math.sin(d * 0.9 - ledTimeVal * 6.5)
          : Math.sin(d * 0.9 - ledTimeVal * 1.5);
        isActive = val > 0.4;
        const hue = (280 - d * 18 + ledTimeVal * 40) % 360;
        color = `hsl(${hue}, 95%, 65%)`;
      } else if (ledMusicStyle === 'rainbow') {
        isActive = true;
        const hue = (x * 15 + y * 15 + ledTimeVal * 90) % 360;
        color = `hsl(${hue}, 90%, 65%)`;
      }
    } else if (ledMode === 'env') {
      if (ledTheme === 'fire') {
        const noiseVal = Math.sin(x * 1.3 + ledTimeVal * 4.5) * Math.cos(y * 0.9 - ledTimeVal * 3) + Math.sin(x * 0.6 - ledTimeVal * 2.2);
        const heightThreshold = 11 - (y + (noiseVal * 1.8));
        isActive = heightThreshold > 1.2;
        
        const fireHue = Math.max(0, Math.min(60, 15 + (11 - y) * 8 + Math.sin(x * 0.6 + ledTimeVal) * 20));
        color = `hsl(${fireHue}, 100%, 55%)`;
      } else if (ledTheme === 'ocean') {
        const waveHeight = 6.0 + 3.0 * Math.sin(x * 0.45 + ledTimeVal * 1.8) * Math.cos(x * 0.22 - ledTimeVal * 0.9);
        isActive = y >= Math.floor(waveHeight);
        
        const depth = y - waveHeight;
        const oceanHue = 190 + depth * 6.5 + Math.sin(ledTimeVal) * 4;
        color = `hsl(${oceanHue}, 95%, 50%)`;
      } else if (ledTheme === 'forest') {
        const val = Math.sin(x * 0.55 + ledTimeVal) * Math.sin(y * 0.45 - ledTimeVal * 0.8) + Math.cos(x * 0.35 - y * 0.25 + ledTimeVal * 0.4);
        isActive = val > 0.15;
        
        const forestHue = 115 + Math.sin(x * 0.5 + y * 0.5) * 22;
        color = `hsl(${forestHue}, 85%, 48%)`;
      } else if (ledTheme === 'cyberpunk') {
        const stripe1 = Math.sin((x + y) * 0.65 - ledTimeVal * 5.0);
        const stripe2 = Math.cos((x - y) * 0.65 + ledTimeVal * 3.5);
        isActive = stripe1 > 0.45 || stripe2 > 0.45;
        
        const cpVal = (stripe1 > 0.45) ? 310 : (stripe2 > 0.45 ? 180 : 275);
        color = `hsl(${cpVal}, 100%, 60%)`;
      }
    } else if (ledMode === 'text') {
      const textUpper = ledText.toUpperCase();
      const textCols: number[] = [];
      for (let i = 0; i < textUpper.length; i++) {
        const char = textUpper[i];
        const colData = FONT_MAP[char] || FONT_MAP[' '];
        textCols.push(...colData);
        textCols.push(0x00);
      }
      const absoluteColIndex = ledTextOffset + x - 16;
      if (absoluteColIndex >= 0 && absoluteColIndex < textCols.length) {
        const colByte = textCols[absoluteColIndex];
        if (y >= 2 && y <= 8) {
          const fontRow = y - 2;
          const bit = (colByte >> fontRow) & 1;
          isActive = bit === 1;
        }
      }
      color = ledTextColor;
    }

    return { isActive, color };
  };

  const isCollisionWarning = adasDistance < 15;

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flow-route {
          to {
            stroke-dashoffset: -40;
          }
        }
        .route-path-flow {
          stroke-dasharray: 8, 4;
          animation: flow-route 2s linear infinite;
        }
        @keyframes audio-bounce {
          0%, 100% { transform: scaleY(0.15); }
          50% { transform: scaleY(1); }
        }
        .audio-bar-anim {
          transform-origin: bottom;
          animation: audio-bounce 1.2s ease-in-out infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .pulse-ring-anim {
          animation: pulse-ring 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
        @keyframes rotate-disk {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .disk-spin {
          animation: rotate-disk 6s linear infinite;
        }
        @keyframes text-blink {
          50% { opacity: 0.3; }
        }
        .system-crash-blink {
          animation: text-blink 1s step-end infinite;
        }
        @keyframes drive-lanes {
          to { stroke-dashoffset: -60; }
        }
        .drive-lanes-anim {
          stroke-dasharray: 20, 20;
          animation: drive-lanes 1s linear infinite;
        }
        @keyframes sphere-pulse {
          0%, 100% { transform: scale(1); opacity: 0.75; filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.6)); }
          50% { transform: scale(1.1); opacity: 0.95; filter: drop-shadow(0 0 35px rgba(6, 182, 212, 0.9)); }
        }
        .ai-sphere-anim {
          animation: sphere-pulse 3s ease-in-out infinite;
        }
        @keyframes border-flash-red {
          0%, 100% { border-color: rgb(39, 39, 42); }
          50% { border-color: rgba(239, 68, 68, 0.8); box-shadow: 0 0 30px rgba(239, 68, 68, 0.3); }
        }
        .bezel-alert-flash {
          animation: border-flash-red 0.8s ease-in-out infinite;
        }
        @keyframes diagnostic-pulse {
          0%, 100% { r: 5px; opacity: 0.6; }
          50% { r: 10px; opacity: 1; }
        }
        .diag-node-pulse {
          animation: diagnostic-pulse 1.5s ease-in-out infinite;
        }
        @keyframes charge-track {
          to { stroke-dashoffset: -30; }
        }
        .charge-track-anim {
          stroke-dasharray: 6, 6;
          animation: charge-track 1.5s linear infinite;
        }
        @keyframes face-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.95; }
        }
        .face-node-pulse {
          animation: face-pulse 1.8s ease-in-out infinite;
        }
        @keyframes scanline {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .scanline-anim {
          position: absolute;
          left: 0;
          right: 0;
          height: 1.5px;
          background: rgba(16, 185, 129, 0.4);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
          animation: scanline 6s linear infinite;
        }
        @keyframes torque-flow {
          to { stroke-dashoffset: -20; }
        }
        .torque-flow-anim {
          stroke-dasharray: 4, 4;
          animation: torque-flow 1s linear infinite;
        }
        @keyframes hazard-flash {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 1; fill: #f59e0b; filter: drop-shadow(0 0 4px #f59e0b); }
        }
        .hazard-flash-anim {
          animation: hazard-flash 0.8s step-end infinite;
        }
        @keyframes heatwave {
          0% { transform: translateY(0) scaleY(0.9); opacity: 0.15; }
          50% { transform: translateY(-2px) scaleY(1.15); opacity: 0.9; }
          100% { transform: translateY(-5px) scaleY(0.8); opacity: 0; }
        }
        .heatwave-anim {
          animation: heatwave 1.5s ease-in-out infinite;
        }
        @keyframes ac-airflow {
          to { stroke-dashoffset: -12; }
        }
        .ac-airflow-anim {
          stroke-dasharray: 4, 4;
          animation: ac-airflow 0.8s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}} />

      {/* Segmented Cockpit Switcher Tab Control */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-8 max-w-4xl mx-auto bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
        <button
          onClick={() => setCurrentSystem('ivi')}
          className={`flex-1 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            currentSystem === 'ivi'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>IVI Console</span>
        </button>
        <button
          onClick={() => setCurrentSystem('voice')}
          className={`flex-1 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            currentSystem === 'voice'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Voice AI</span>
        </button>
        <button
          onClick={() => setCurrentSystem('adas')}
          className={`flex-1 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            currentSystem === 'adas'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>ADAS Safety</span>
        </button>
        <button
          onClick={() => setCurrentSystem('ev')}
          className={`flex-1 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            currentSystem === 'ev'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>EV Powertrain</span>
        </button>
        <button
          onClick={() => setCurrentSystem('diag')}
          className={`flex-1 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            currentSystem === 'diag'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Diagnostics</span>
        </button>
        <button
          onClick={() => setCurrentSystem('cabin')}
          className={`flex-1 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            currentSystem === 'cabin'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Cabin AI</span>
        </button>
        <button
          onClick={() => setCurrentSystem('bike')}
          className={`flex-1 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            currentSystem === 'bike'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Bike Cluster</span>
        </button>
        <button
          onClick={() => setCurrentSystem('led')}
          className={`flex-1 min-w-[100px] sm:min-w-[120px] flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            currentSystem === 'led'
              ? 'bg-fuchsia-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>LED Matrix</span>
        </button>
      </div>

      {/* Cockpit Shell container bezel */}
      <div className={`relative rounded-[32px] border-[12px] p-1 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[2.1/1] transition-all duration-500 ${
        isCollisionWarning && currentSystem === 'adas'
          ? 'border-red-900 bg-red-950/20 bezel-alert-flash'
          : (cabinDriverState === 'drowsy' || cabinDriverState === 'distracted') && currentSystem === 'cabin'
          ? 'border-red-900 bg-red-950/20 bezel-alert-flash'
          : 'border-zinc-800 bg-zinc-950'
      }`}>
        
        {/* Anti-glare glass reflection layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.04] pointer-events-none z-30" />
        
        {/* Core System Screen Display */}
        {crashState === 'rebooting' ? (
          <div className="w-full h-full bg-black flex flex-col items-center justify-center text-zinc-400">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="font-mono text-xs tracking-widest uppercase animate-pulse">AOSP System Rebooting...</p>
            <p className="font-mono text-[10px] text-zinc-600 mt-2">Checking partitions & Verified Boot (AVB)...</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col text-white font-sans relative overflow-hidden select-none bg-zinc-950">
            
            {/* ───── 1. TOP SYSTEM BAR ───── */}
            <header className="h-10 border-b border-white/5 bg-zinc-950/70 backdrop-blur-md px-6 flex items-center justify-between text-xs text-zinc-400 z-20 shrink-0">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-zinc-200 uppercase tracking-wider">
                  {currentSystem === 'ivi' && 'IVI Display'}
                  {currentSystem === 'voice' && 'Assistant System'}
                  {currentSystem === 'adas' && 'ADAS Safety Active'}
                  {currentSystem === 'ev' && 'EV Powertrain'}
                  {currentSystem === 'diag' && 'CAN OBD-II Diagnostics'}
                  {currentSystem === 'cabin' && 'Cabin DMS/OMS AI'}
                  {currentSystem === 'bike' && 'Smart E-Bike Cluster'}
                  {currentSystem === 'led' && 'LED Matrix Visualizer'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px]">
                  {currentSystem === 'adas' || currentSystem === 'cabin' ? 'NPU Core' : currentSystem === 'bike' ? 'Bike HAL v1.2' : currentSystem === 'led' ? 'LED HAL v1.0' : 'VHAL v2.0'}
                </span>
                {crashState === 'crashing' && (
                  <span className="px-2 py-0.5 rounded bg-red-600/20 border border-red-500/30 text-red-500 font-bold font-mono text-[10px] system-crash-blink flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> CRITICAL DUMP (ANR)
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1 animate-pulse" />
                  GNSS Fixed 3D
                </div>
                <div className="flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono">85%</span>
                </div>
                <div className="h-3 w-[1px] bg-white/10" />
                <span className="font-mono font-semibold text-zinc-300">{sysTime}</span>
              </div>
            </header>

            {/* ───── MAIN DISPLAY VIEWPORT ───── */}
            <div className="flex flex-1 min-h-0 relative">
              
              {/* SYSTEM SCREEN 1: IVI DISPLAY (with Sidebar & Subtabs) */}
              {currentSystem === 'ivi' && (
                <>
                  {/* Left Sidebar */}
                  <nav className="w-16 border-r border-white/5 bg-zinc-950 flex flex-col items-center justify-between py-4 gap-4 z-20 shrink-0">
                    <div className="flex flex-col items-center gap-3 w-full px-2">
                      <button
                        onClick={() => setActiveTab('nav')}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          activeTab === 'nav'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                        title="Navigation Map"
                      >
                        <Navigation className="w-5.5 h-5.5" />
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('media')}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          activeTab === 'media'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                        title="Entertainment / Media"
                      >
                        <Music className="w-5.5 h-5.5" />
                      </button>

                      <button
                        onClick={() => setActiveTab('telemetry')}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          activeTab === 'telemetry'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                        title="Vehicle Telemetry"
                      >
                        <Gauge className="w-5.5 h-5.5" />
                      </button>
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full px-2">
                      <button
                        onClick={() => setActiveTab('logcat')}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${
                          activeTab === 'logcat'
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                        title="AOSP Logcat Stream"
                      >
                        <Terminal className="w-5.5 h-5.5" />
                        {isLogStreaming && crashState === 'idle' && (
                          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </button>
                    </div>
                  </nav>

                  {/* Main Subtab Area */}
                  <div className="flex-1 min-w-0 bg-[#0c0c0e] relative z-10">
                    {activeTab === 'nav' && (
                      <div className="w-full h-full relative flex">
                        {/* Map Background */}
                        <div className="absolute inset-0 bg-[#0e0f12]">
                          <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <pattern id="grid-map" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid-map)" />
                            <path d="M 0 60 H 600 M 0 200 H 600 M 200 0 V 400 M 450 0 V 400" stroke="#1d2026" strokeWidth="6" strokeLinecap="round" />
                            <path d="M 80 0 L 80 400 M 340 0 L 340 400 M 0 320 H 600" stroke="#1d2026" strokeWidth="4" strokeLinecap="round" />
                            
                            <path d="M 200 350 L 200 200 L 450 200 L 450 60" fill="none" stroke="rgba(37, 99, 235, 0.3)" strokeWidth="8" strokeLinecap="round" />
                            <path d="M 200 350 L 200 200 L 450 200 L 450 60" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" className="route-path-flow" strokeDashoffset="0" />
                            
                            <circle cx="200" cy="350" r="6" fill="#10b981" />
                            <circle cx="200" cy="350" r="12" fill="none" stroke="#10b981" strokeWidth="1.5" className="origin-center scale-90" />
                            
                            <g transform="translate(450, 60)">
                              <circle cx="0" cy="0" r="6" fill="#ef4444" />
                              <path d="M -8 -8 L 8 8 M 8 -8 L -8 8" stroke="#ef4444" strokeWidth="2" className="animate-pulse" />
                            </g>

                            <g transform="translate(200, 200)">
                              <circle cx="0" cy="0" r="16" fill="none" stroke="#3b82f6" strokeWidth="2" className="pulse-ring-anim" />
                              <circle cx="0" cy="0" r="24" fill="none" stroke="#3b82f6" strokeWidth="1" className="pulse-ring-anim [animation-delay:0.7s]" />
                              <circle cx="0" cy="0" r="8" fill="#3b82f6" />
                              <path d="M -3 3 L 0 -4 L 3 3 Z" fill="white" transform="rotate(45)" />
                            </g>
                          </svg>
                        </div>

                        <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-62 shadow-xl flex gap-3 z-10">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">→</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] text-zinc-500 uppercase font-mono">In 200 meters</p>
                            <h4 className="font-semibold text-xs text-zinc-100 truncate">Turn right onto AOSP Blvd</h4>
                            <p className="text-[10px] text-zinc-400 mt-0.5 truncate">Route to Raspberry Pi Lab</p>
                          </div>
                        </div>

                        <div className="absolute bottom-4 right-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-4 z-10">
                          <div>
                            <span className="text-[9px] text-zinc-500 block uppercase font-mono leading-none">Location</span>
                            <span className="text-xs font-semibold text-zinc-200 mt-1 block">Device Tree Highway, Sec 4</span>
                          </div>
                          <div className="flex gap-4 items-center">
                            <div className="text-right">
                              <span className="text-base font-bold text-blue-400 block leading-none">{speed} <span className="text-[10px] font-normal text-zinc-400">km/h</span></span>
                              <span className="text-[8px] text-zinc-500 uppercase font-mono mt-1 block">Speed</span>
                            </div>
                            <div className="h-6 w-[1px] bg-white/10" />
                            <div className="text-right">
                              <span className="text-xs font-semibold text-zinc-200 block leading-none">12 min</span>
                              <span className="text-[9px] text-zinc-400 font-mono mt-1 block">8.4 km • 11:02 AM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'media' && (
                      <div className="w-full h-full p-6 flex items-center justify-center">
                        <div className="flex flex-col items-center md:flex-row gap-6 max-w-md w-full">
                          <div className="relative w-28 h-28 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                            <div className={`w-24 h-24 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center relative ${isPlaying ? 'disk-spin' : ''}`}>
                              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                              </div>
                              <div className="absolute inset-2 rounded-full border border-dashed border-zinc-800" />
                              <span className="absolute top-1 text-[5px] font-mono tracking-widest text-indigo-400/50">AOSP MUSIC</span>
                            </div>
                          </div>

                          <div className="flex-1 w-full flex flex-col justify-between py-1 text-center md:text-left">
                            <div>
                              <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-mono font-bold block mb-1">Now Playing</span>
                              <h3 className="text-sm font-bold text-white truncate">AOSP Boot Sequence (Init Dub Mix)</h3>
                              <p className="text-xs text-zinc-400 truncate">The Init Services • System Volume 1</p>
                            </div>

                            <div className="h-6 flex items-end gap-0.5 mt-3 justify-center md:justify-start">
                              {Array.from({ length: 18 }).map((_, idx) => {
                                const delayVal = `${(idx * 0.06).toFixed(2)}s`;
                                const durationVal = `${(0.7 + Math.random() * 0.6).toFixed(2)}s`;
                                const heightPercentage = `${15 + Math.random() * 85}%`;
                                return (
                                  <div
                                    key={idx}
                                    className={`w-1 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-xs transition-all ${isPlaying ? 'audio-bar-anim' : ''}`}
                                    style={{
                                      animationDelay: delayVal,
                                      animationDuration: durationVal,
                                      height: isPlaying ? heightPercentage : '10%',
                                      animationPlayState: isPlaying ? 'running' : 'paused'
                                    }}
                                  />
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                              <button className="text-zinc-500 hover:text-white"><SkipBack className="w-4 h-4" /></button>
                              <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md active:scale-95">
                                {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
                              </button>
                              <button className="text-zinc-500 hover:text-white"><SkipForward className="w-4 h-4" /></button>
                              <div className="flex items-center gap-1 text-zinc-500 text-[9px] font-mono ml-2">
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>18</span>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="h-1 bg-zinc-800 rounded-full w-full relative overflow-hidden">
                                <div className="absolute h-full bg-indigo-500 w-0" style={{ width: `${trackProgress}%` }} />
                              </div>
                              <div className="flex justify-between text-[8px] text-zinc-500 font-mono mt-1">
                                <span>{Math.floor(trackProgress * 0.03)}:{(Math.floor(trackProgress * 2.3) % 60).toString().padStart(2, '0')}</span>
                                <span>3:55</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'telemetry' && (
                      <div className="w-full h-full p-4 flex flex-col justify-between">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between items-center">
                            <span className="text-[9px] font-mono uppercase text-zinc-500">SPEED</span>
                            <div className="relative w-16 h-16 flex items-center justify-center mt-1">
                              <svg className="w-full h-full -rotate-90">
                                <circle cx="32" cy="32" r="26" fill="none" stroke="#27272a" strokeWidth="3.5" />
                                <circle cx="32" cy="32" r="26" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray={163} strokeDashoffset={163 - (163 * Math.min(speed, 180)) / 180} className="transition-all duration-300" />
                              </svg>
                              <div className="absolute flex flex-col items-center leading-none">
                                <span className="text-sm font-bold">{speed}</span>
                                <span className="text-[7px] text-zinc-500 uppercase">km/h</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                              <span>CPU LOAD</span>
                              <Cpu className="w-3 h-3 text-blue-400" />
                            </div>
                            <div className="mt-2">
                              <span className="text-xl font-black text-blue-400 leading-none">{cpuUsage}%</span>
                              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${cpuUsage}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                              <span>BINDER IPC</span>
                              <Activity className="w-3 h-3 text-indigo-400" />
                            </div>
                            <div className="mt-2">
                              <span className="text-xl font-black text-indigo-400 leading-none">{binderIpc}</span>
                              <span className="text-[8px] text-zinc-500 ml-0.5">tps</span>
                              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${Math.min(100, (binderIpc / 2000) * 100)}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
                            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                              <span>BATTERY</span>
                              <Database className="w-3 h-3 text-amber-500" />
                            </div>
                            <div className="mt-2">
                              <span className="text-xl font-black text-amber-500 leading-none">{temp}°C</span>
                              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${Math.min(100, (temp / 80) * 100)}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/30 border border-white/5 rounded-xl p-2 mt-2">
                          <div className="flex-1 w-full flex items-center gap-2.5">
                            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md shrink-0"><Sliders className="w-3.5 h-3.5" /></div>
                            <div className="flex-1">
                              <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 block mb-0.5">Throttle Control</span>
                              <input type="range" min="0" max="160" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-emerald-500" />
                            </div>
                          </div>
                          <div className="flex gap-3 text-[9px] font-mono text-zinc-400 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3 shrink-0">
                            <div><span className="text-zinc-500 block text-[8px] uppercase">VHAL</span><span className="text-emerald-400 font-bold block mt-0.5">● ON</span></div>
                            <div><span className="text-zinc-500 block text-[8px] uppercase">CAN</span><span className="text-emerald-400 font-bold block mt-0.5">● OK</span></div>
                            <div><span className="text-zinc-500 block text-[8px] uppercase">ADB</span><span className="text-blue-400 font-bold block mt-0.5">ONLINE</span></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'logcat' && (
                      <div className="w-full h-full flex flex-col font-mono text-[9px] bg-black text-zinc-300">
                        <div className="h-7 border-b border-white/5 bg-zinc-950 px-3 flex items-center justify-between text-zinc-500">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-400">Terminal - adb logcat</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setIsLogStreaming(!isLogStreaming)} className="hover:text-white flex items-center gap-1 font-bold text-zinc-400">
                              <span className={`w-1 h-1 rounded-full ${isLogStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
                              {isLogStreaming ? 'LIVE' : 'PAUSED'}
                            </button>
                            <button onClick={() => setLogs([])} className="hover:text-white">CLEAR</button>
                            <button onClick={triggerCrash} disabled={crashState !== 'idle'} className="px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 hover:bg-red-900 active:scale-95 transition-all text-[8px] font-bold">
                              ANR CRASH
                            </button>
                          </div>
                        </div>
                        <div ref={logContainerRef} className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
                          {logs.length === 0 ? (
                            <p className="text-zinc-700 text-center py-6">No log logs.</p>
                          ) : (
                            logs.map((log, index) => {
                              let colorClass = 'text-zinc-400';
                              if (log.level === 'E') colorClass = 'text-red-400 font-bold bg-red-950/20 px-1 rounded';
                              if (log.level === 'W') colorClass = 'text-amber-500';
                              if (log.level === 'D') colorClass = 'text-blue-400';
                              return (
                                <div key={index} className="flex gap-2.5 leading-normal">
                                  <span className="text-zinc-600 select-none shrink-0">{log.time}</span>
                                  <span className={`w-3 text-center shrink-0 font-bold select-none ${log.level === 'E' ? 'bg-red-800 text-white rounded-[2px]' : 'text-blue-500'}`}>{log.level}</span>
                                  <span className="text-zinc-500 font-bold shrink-0">[{log.tag}]:</span>
                                  <span className={`break-all ${colorClass}`}>{log.msg}</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* SYSTEM SCREEN 2: VOICE AI ASSISTANT */}
              {currentSystem === 'voice' && (
                <div className="flex-1 flex flex-col md:flex-row h-full min-h-0">
                  
                  {/* Left Side: Pulsing Orb Animation */}
                  <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-white/5 bg-zinc-950/50 flex flex-col items-center justify-center p-4 select-none">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      {/* Floating orb rings */}
                      <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 animate-ping [animation-duration:3s]" />
                      <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600/30 to-cyan-400/30 animate-pulse [animation-duration:1.5s]" />
                      
                      {/* Core interactive neural ball */}
                      <button
                        type="button"
                        onClick={toggleSpeechRecognition}
                        disabled={isAiTyping}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative transition-all duration-500 focus:outline-none ${
                          isListening
                            ? 'bg-gradient-to-tr from-red-600 via-red-500 to-orange-400 shadow-red-500/40 border border-red-400/30 animate-pulse scale-105'
                            : isAiTyping
                            ? 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 shadow-purple-500/40 border border-purple-400/30 animate-pulse'
                            : speechStatus === 'Speaking...'
                            ? 'bg-gradient-to-tr from-emerald-600 via-teal-400 to-cyan-400 shadow-emerald-500/40 border border-emerald-400/30 animate-pulse scale-105'
                            : 'bg-gradient-to-tr from-indigo-600 via-indigo-400 to-cyan-400 shadow-indigo-500/30 hover:scale-105 hover:shadow-indigo-500/50 hover:border hover:border-white/10 active:scale-95'
                        }`}
                      >
                        {/* Ring waves when listening */}
                        {isListening && (
                          <>
                            <span className="absolute -inset-2 rounded-full border border-red-500/50 animate-ping opacity-75" />
                            <span className="absolute -inset-4 rounded-full border border-red-500/30 animate-ping opacity-50" style={{ animationDelay: '0.2s' }} />
                          </>
                        )}
                        {/* Ring waves when speaking */}
                        {speechStatus === 'Speaking...' && (
                          <>
                            <span className="absolute -inset-2 rounded-full border border-emerald-500/50 animate-ping opacity-75" />
                            <span className="absolute -inset-4 rounded-full border border-emerald-500/30 animate-ping opacity-50" style={{ animationDelay: '0.2s' }} />
                          </>
                        )}
                        {isListening ? (
                          <Mic className="w-8 h-8 text-white animate-bounce" />
                        ) : speechStatus === 'Speaking...' ? (
                          <Volume2 className="w-8 h-8 text-white" />
                        ) : isAiTyping ? (
                          <Bot className="w-8 h-8 text-white" />
                        ) : (
                          <Mic className="w-8 h-8 text-white opacity-80" />
                        )}
                      </button>
                    </div>
                    
                    <div className="text-center mt-3">
                      <h4 className="text-xs font-bold text-zinc-300">AOSP Intelligent Assistant</h4>
                      <p className="text-[10px] mt-1 font-mono uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5">
                        {isListening ? (
                          <span className="text-red-400 font-bold flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {speechStatus.toUpperCase()}
                          </span>
                        ) : speechStatus === 'Speaking...' ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            {speechStatus.toUpperCase()}
                          </span>
                        ) : isAiTyping ? (
                          <span className="text-indigo-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                            {speechStatus.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-zinc-500">
                            {speechStatus.toUpperCase()}
                          </span>
                        )}
                      </p>
                      
                      {/* Dynamic waveform simulator when listening or speaking */}
                      {(isListening || speechStatus === 'Speaking...') && (
                        <div className="flex gap-0.5 justify-center mt-2.5 h-3 items-center">
                          <div className={`w-0.5 h-full ${isListening ? 'bg-red-400' : 'bg-emerald-400'} animate-bounce`} style={{ animationDelay: '0.1s' }} />
                          <div className={`w-0.5 h-2/3 ${isListening ? 'bg-red-400' : 'bg-emerald-400'} animate-bounce`} style={{ animationDelay: '0.3s' }} />
                          <div className={`w-0.5 h-1/3 ${isListening ? 'bg-red-400' : 'bg-emerald-400'} animate-bounce`} style={{ animationDelay: '0.5s' }} />
                          <div className={`w-0.5 h-full ${isListening ? 'bg-red-400' : 'bg-emerald-400'} animate-bounce`} style={{ animationDelay: '0.2s' }} />
                          <div className={`w-0.5 h-3/4 ${isListening ? 'bg-red-400' : 'bg-emerald-400'} animate-bounce`} style={{ animationDelay: '0.4s' }} />
                        </div>
                      )}
                      
                      {/* Speaks waveform simulator (fallback for static typing) */}
                      {isAiTyping && !isListening && speechStatus !== 'Speaking...' && (
                        <div className="flex gap-0.5 justify-center mt-2.5 h-3 items-center">
                          <div className="w-0.5 h-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-0.5 h-2/3 bg-indigo-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                          <div className="w-0.5 h-1/3 bg-indigo-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
                          <div className="w-0.5 h-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Conversation Chat Pane */}
                  <div className="flex-1 flex flex-col bg-zinc-950/80 min-h-0">
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0 scrollbar-thin">
                      {chatMessages.map((msg, i) => {
                        if (msg.sender === 'system') {
                          return (
                            <div key={i} className="text-center">
                              <span className="px-2 py-0.5 bg-zinc-900 border border-white/5 text-zinc-500 text-[8px] font-mono rounded">
                                {msg.text}
                              </span>
                            </div>
                          );
                        }
                        
                        const isUser = msg.sender === 'user';
                        return (
                          <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-xl p-2.5 text-xs leading-relaxed ${
                              isUser
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none'
                            }`}>
                              <span className="whitespace-pre-line">{msg.text}</span>
                            </div>
                          </div>
                        );
                      })}
                      {isAiTyping && (
                        <div className="flex justify-start">
                          <div className="bg-zinc-900 border border-white/5 text-zinc-500 rounded-xl rounded-tl-none p-2.5 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Suggestions Buttons */}
                    <div className="p-3 bg-zinc-950/90 border-t border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none select-none">
                      <button
                        onClick={() => executeAiCommand('Scan System HAL Services')}
                        className="shrink-0 px-2.5 py-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-medium transition-all"
                      >
                        ⚡ Scan HAL
                      </button>
                      <button
                        onClick={() => executeAiCommand('Show LED Matrix')}
                        className="shrink-0 px-2.5 py-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-medium transition-all"
                      >
                        ❇️ Show LED Matrix
                      </button>
                      <button
                        onClick={() => executeAiCommand('Set LED color to emerald')}
                        className="shrink-0 px-2.5 py-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-medium transition-all"
                      >
                        🟢 LED Green
                      </button>
                      <button
                        onClick={() => executeAiCommand('Change LED text to AOSP CAMP')}
                        className="shrink-0 px-2.5 py-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-medium transition-all"
                      >
                        ✏️ Change Text
                      </button>
                      <button
                        onClick={() => executeAiCommand('Open driver door')}
                        className="shrink-0 px-2.5 py-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-medium transition-all"
                      >
                        🚗 Open Driver Door
                      </button>
                      <button
                        onClick={() => executeAiCommand('Set temperature to 21°C')}
                        className="shrink-0 px-2.5 py-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-medium transition-all"
                      >
                        ❄️ Set Temp 21°C
                      </button>
                      <button
                        onClick={() => executeAiCommand('Turn on hazard lights')}
                        className="shrink-0 px-2.5 py-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-medium transition-all"
                      >
                        🚨 Hazards ON
                      </button>
                    </div>

                    {/* Custom Input Form */}
                    <form onSubmit={handleCustomAiSend} className="p-3 bg-zinc-950 border-t border-white/5 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type standard command (e.g. Set Temp)..."
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        disabled={isAiTyping || isListening}
                        className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all border ${
                          isMuted
                            ? 'bg-red-950/20 border-red-900/55 text-red-400 hover:bg-red-900/30'
                            : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                        title={isMuted ? "Unmute Voice AI" : "Mute Voice AI"}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="submit"
                        disabled={isAiTyping || isListening || !aiInput.trim()}
                        className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>

                  </div>
                </div>
              )}

              {/* SYSTEM SCREEN 3: ADAS AI COMPUTER VISION */}
              {currentSystem === 'adas' && (
                <div className="flex-1 flex flex-col md:flex-row h-full">
                  
                  {/* Left Side: Front Road Camera View (SVG) */}
                  <div className="flex-1 bg-zinc-950 relative overflow-hidden border-r border-white/5">
                    
                    {/* SVG Highway Layout */}
                    <div className="absolute inset-0 bg-[#07080a] transition-all">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        
                        {/* Night Vision Thermal overlay */}
                        {adasNightVision && (
                          <rect width="100%" height="100%" fill="rgba(16, 185, 129, 0.08)" />
                        )}

                        <defs>
                          <linearGradient id="road-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#111317" />
                            <stop offset="100%" stopColor="#1a1c22" />
                          </linearGradient>
                          <linearGradient id="night-road" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#042211" />
                            <stop offset="100%" stopColor="#0a3f22" />
                          </linearGradient>
                        </defs>

                        {/* Road polygon */}
                        <path
                          d="M 220 70 L 380 70 L 520 280 L 80 280 Z"
                          fill={adasNightVision ? 'url(#night-road)' : 'url(#road-grad)'}
                          stroke={adasNightVision ? '#059669' : '#27272a'}
                          strokeWidth="1.5"
                        />

                        {/* Animated Driving lanes */}
                        <path
                          d="M 300 70 L 300 280"
                          fill="none"
                          stroke={adasNightVision ? '#10b981' : '#ffffff'}
                          strokeWidth="2.5"
                          className="drive-lanes-anim"
                        />

                        <path
                          d="M 255 70 L 180 280"
                          fill="none"
                          stroke={adasNightVision ? '#059669' : '#e2e8f0'}
                          strokeWidth="1.5"
                          strokeDasharray="6, 12"
                        />
                        <path
                          d="M 345 70 L 420 280"
                          fill="none"
                          stroke={adasNightVision ? '#059669' : '#e2e8f0'}
                          strokeWidth="1.5"
                          strokeDasharray="6, 12"
                        />

                        {/* Lane keeping guide overlay */}
                        {adasDetectionActive && (
                          <>
                            {/* Left boundary path */}
                            <path d="M 225 70 L 98 280" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.4" />
                            {/* Right boundary path */}
                            <path d="M 375 70 L 502 280" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.4" />
                          </>
                        )}

                        {/* Pedestrian on the side */}
                        {adasDetectionActive && (
                          <g transform="translate(435, 110)">
                            {/* Bounding box */}
                            <rect x="-8" y="-12" width="16" height="24" fill="none" stroke="#10b981" strokeWidth="1.5" />
                            <text x="-8" y="-15" fill="#10b981" fontSize="7" fontFamily="monospace" fontWeight="bold">Pedestrian: 94%</text>
                            
                            {/* Simple human SVG representation */}
                            <circle cx="0" cy="-6" r="2.5" fill="#10b981" />
                            <line x1="0" y1="-3" x2="0" y2="4" stroke="#10b981" strokeWidth="1.5" />
                            <line x1="-3" y1="0" x2="3" y2="0" stroke="#10b981" strokeWidth="1" />
                            <line x1="0" y1="4" x2="-2" y2="9" stroke="#10b981" strokeWidth="1" />
                            <line x1="0" y1="4" x2="2" y2="9" stroke="#10b981" strokeWidth="1" />
                          </g>
                        )}

                        {/* Ahead Vehicle SVG representation */}
                        {/* y pos maps from 75 to 210, scale from 0.15 to 0.9 based on distance state */}
                        {(() => {
                          const scale = 0.15 + (1 - adasDistance / 100) * 0.75;
                          const yPos = 75 + (1 - adasDistance / 100) * 135;
                          const xPos = 300;
                          
                          const color = isCollisionWarning ? '#ef4444' : '#3b82f6';
                          
                          return (
                            <g transform={`translate(${xPos}, ${yPos}) scale(${scale})`}>
                              
                              {/* Draw back of car */}
                              <rect x="-35" y="-15" width="70" height="30" rx="8" fill="#1f2937" stroke={adasNightVision ? '#10b981' : '#374151'} strokeWidth="1.5" />
                              <rect x="-30" y="-30" width="60" height="18" rx="6" fill="#111827" stroke={adasNightVision ? '#10b981' : '#374151'} strokeWidth="1.5" />
                              {/* Tail lights */}
                              <rect x="-28" y="-10" width="12" height="6" rx="2" fill={isCollisionWarning ? '#ef4444' : '#b91c1c'} className={isCollisionWarning ? 'animate-pulse' : ''} />
                              <rect x="16" y="-10" width="12" height="6" rx="2" fill={isCollisionWarning ? '#ef4444' : '#b91c1c'} className={isCollisionWarning ? 'animate-pulse' : ''} />
                              {/* License plate */}
                              <rect x="-10" y="4" width="20" height="8" fill="#eab308" rx="1" />
                              <text x="0" y="10" fill="black" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">AOSP</text>
                              {/* Tires */}
                              <rect x="-32" y="14" width="10" height="6" rx="1" fill="black" />
                              <rect x="22" y="14" width="10" height="6" rx="1" fill="black" />

                              {/* ADAS tracking overlay */}
                              {adasDetectionActive && (
                                <>
                                  {/* Bounding box around car */}
                                  <rect x="-42" y="-35" width="84" height="58" rx="4" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3, 3" />
                                  <text x="-42" y="-40" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">
                                    Vehicle: {adasDistance}m ({Math.min(99, 100 - adasDistance / 4)}%)
                                  </text>
                                  {/* Target reticle */}
                                  <path d="M -12 -8 L -12 -12 L -8 -12 M 8 -12 L 12 -12 L 12 -8 M 12 8 L 12 12 L 8 12 M -8 12 L -12 12 L -12 8" fill="none" stroke={color} strokeWidth="1.5" />
                                </>
                              )}
                            </g>
                          );
                        })()}
                        
                      </svg>

                      {/* Lane Departure Active Overlay */}
                      {adasDetectionActive && (
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-zinc-950/80 border border-emerald-500/30 text-emerald-400 rounded text-[8px] font-mono tracking-widest uppercase">
                          LKA Active • Lane Center
                        </div>
                      )}
                    </div>

                    {/* Forward Collision Warning Banner */}
                    {isCollisionWarning && (
                      <div className="absolute top-3 left-3 right-3 bg-red-600/90 border border-red-500 text-white rounded-xl p-2 text-center shadow-lg z-10 animate-pulse flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-white" />
                        <span className="text-[10px] font-mono font-black tracking-widest uppercase">
                          FCW WARNING: COLLISION THRESHOLD CRITICAL - BRAKE NOW!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Side: ADAS Parameter Config panel */}
                  <div className="w-full md:w-5/12 bg-zinc-950/70 p-4 flex flex-col justify-between select-none">
                    
                    {/* ADAS Telemetry stats */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 block">ADAS NPU Diagnostic</span>
                        <h4 className="text-xs font-bold text-zinc-300 mt-0.5">Model: YOLOv8-MobileNet-v2 (FP16)</h4>
                      </div>

                      <div className="h-[1px] bg-white/10" />

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="p-2 bg-zinc-900 rounded-lg">
                          <span className="text-zinc-500 block text-[8px] uppercase">FPS (Inference)</span>
                          <span className="text-emerald-400 font-bold block mt-0.5">45.2 fps</span>
                        </div>
                        <div className="p-2 bg-zinc-900 rounded-lg">
                          <span className="text-zinc-500 block text-[8px] uppercase">Latency</span>
                          <span className="text-emerald-400 font-bold block mt-0.5">22.1 ms</span>
                        </div>
                        <div className="p-2 bg-zinc-900 rounded-lg">
                          <span className="text-zinc-500 block text-[8px] uppercase">Tracking ID</span>
                          <span className="text-zinc-300 font-bold block mt-0.5">#TRK-0921</span>
                        </div>
                        <div className="p-2 bg-zinc-900 rounded-lg">
                          <span className="text-zinc-500 block text-[8px] uppercase">Status</span>
                          <span className={`${isCollisionWarning ? 'text-red-500 animate-pulse' : 'text-emerald-400'} font-bold block mt-0.5`}>
                            {isCollisionWarning ? 'ALERTING' : 'SECURE'}
                          </span>
                        </div>
                      </div>

                      <div className="h-[1px] bg-white/10" />

                      {/* Controls */}
                      <div className="space-y-3.5 pt-1">
                        {/* Night vision toggle */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-zinc-300">Infrared Night Vision</span>
                            <span className="text-[8px] text-zinc-500 block">NPU image enhancement</span>
                          </div>
                          <button
                            onClick={() => setAdasNightVision(!adasNightVision)}
                            className={`w-10 h-5.5 rounded-full p-0.5 transition-all ${
                              adasNightVision ? 'bg-emerald-600' : 'bg-zinc-800'
                            }`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-all transform ${
                              adasNightVision ? 'translate-x-4.5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>

                        {/* Overlay tags toggle */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-zinc-300">Object Bounding Boxes</span>
                            <span className="text-[8px] text-zinc-500 block">Overlay AI detection tags</span>
                          </div>
                          <button
                            onClick={() => setAdasDetectionActive(!adasDetectionActive)}
                            className={`w-10 h-5.5 rounded-full p-0.5 transition-all ${
                              adasDetectionActive ? 'bg-blue-600' : 'bg-zinc-800'
                            }`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-all transform ${
                              adasDetectionActive ? 'translate-x-4.5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Proximity Slider control */}
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500">
                          Vehicle Distance (TTC)
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${isCollisionWarning ? 'text-red-400' : 'text-blue-400'}`}>
                          {adasDistance} meters
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={adasDistance}
                        onChange={(e) => setAdasDistance(parseInt(e.target.value))}
                        className={`w-full h-1 rounded appearance-none cursor-pointer ${
                          isCollisionWarning ? 'accent-red-500 bg-red-950/40' : 'accent-emerald-500 bg-zinc-800'
                        }`}
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* SYSTEM SCREEN 4: EV POWERTRAIN */}
              {currentSystem === 'ev' && (
                <div className="flex-1 flex flex-col md:flex-row h-full">
                  {/* Left Side: Battery Cell & Charging Flow visualization */}
                  <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-4 border-r border-white/5 relative overflow-hidden select-none">
                    {/* Glowing battery container */}
                    <div className="w-full max-w-[280px] p-4 bg-zinc-900/40 border border-white/5 rounded-2xl relative flex flex-col items-center">
                      <div className="flex justify-between items-center w-full mb-3">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">HVAC & Battery Temp</span>
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          {Math.max(15, Math.min(48, Math.floor(temp * 0.9)))}°C
                        </span>
                      </div>
                      
                      {/* Interactive Battery cell grid representation */}
                      <div className="grid grid-cols-8 gap-1.5 w-full bg-black/40 p-3 rounded-xl border border-white/5 relative">
                        {Array.from({ length: 24 }).map((_, index) => {
                          const isActive = index < Math.floor((evSoc / 100) * 24);
                          return (
                            <div
                              key={index}
                              className={`h-4.5 rounded-sm transition-all duration-500 ${
                                isActive 
                                  ? evDriveMode === 'sport' 
                                    ? 'bg-amber-500 shadow-md shadow-amber-500/10' 
                                    : 'bg-emerald-500 shadow-md shadow-emerald-500/10' 
                                  : 'bg-zinc-800/40 border border-zinc-800'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Charge arrows flow visualization */}
                      <div className="w-full flex items-center justify-between mt-4">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">Power Distribution</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] font-mono font-bold ${evRegen > 60 ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`}>
                            {evRegen > 0 ? `REGEN +${evRegen}%` : 'COASTING'}
                          </span>
                        </div>
                      </div>

                      {/* Power flow tracks */}
                      <svg className="w-full h-8 mt-2" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 10 15 H 250" fill="none" stroke="#27272a" strokeWidth="2.5" />
                        <path
                          d="M 10 15 H 250"
                          fill="none"
                          stroke={evRegen > 20 ? '#10b981' : evDriveMode === 'sport' ? '#f59e0b' : '#3b82f6'}
                          strokeWidth="2.5"
                          className="charge-track-anim"
                          style={{
                            animationDirection: evRegen > 20 ? 'reverse' : 'normal',
                            animationPlayState: speed > 0 ? 'running' : 'paused'
                          }}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Right Side: EV Power Config & Range Prediction */}
                  <div className="w-full md:w-5/12 bg-zinc-950/70 p-4 flex flex-col justify-between select-none">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 block">EV Power Optimization</span>
                        <h4 className="text-xs font-bold text-zinc-300 mt-0.5">Energy Controller: VHAL Co-Processor</h4>
                      </div>

                      <div className="h-[1px] bg-white/10" />

                      {/* Dynamic Drive Mode selection */}
                      <div>
                        <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 block mb-2">Select Drive Profile</span>
                        <div className="grid grid-cols-3 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
                          {(['eco', 'normal', 'sport'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setEvDriveMode(mode);
                                if (mode === 'eco') {
                                  setSpeed(prev => Math.min(85, prev));
                                  setCpuUsage(22);
                                } else if (mode === 'sport') {
                                  setSpeed(prev => Math.max(90, prev));
                                  setCpuUsage(68);
                                }
                              }}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                evDriveMode === mode
                                  ? mode === 'sport'
                                    ? 'bg-amber-500 text-black font-black'
                                    : mode === 'eco'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-blue-600 text-white shadow-md'
                                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Regenerative braking controller slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500">Regenerative Level</span>
                          <span className="text-[9px] font-mono font-bold text-emerald-400">{evRegen}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={evRegen}
                          onChange={(e) => setEvRegen(parseInt(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>

                      {/* Range details and temperature relationship */}
                      {(() => {
                        const modeFactor = evDriveMode === 'eco' ? 1.15 : evDriveMode === 'sport' ? 0.85 : 1.0;
                        const tempDiff = Math.abs(cabinTemp - 22.0);
                        const tempFactor = Math.max(0.82, 1.0 - (tempDiff * 0.022));
                        const regenFactor = 1.0 + (evRegen / 100) * 0.08;

                        const calculatedRange = Math.round((evSoc / 100) * 480 * modeFactor * tempFactor * regenFactor);
                        const hvacEfficiency = Math.round(tempFactor * 100);

                        return (
                          <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase">Estimated Range</span>
                              <div className="text-right">
                                <span className="text-xl font-black text-amber-400 font-mono tracking-tight">{calculatedRange}</span>
                                <span className="text-[9px] font-semibold text-zinc-400 ml-0.5">km</span>
                              </div>
                            </div>

                            <div className="h-[1px] bg-white/5" />

                            <div className="flex items-center justify-between text-[8px] font-mono">
                              <div className="text-left">
                                <span className="text-zinc-500 block uppercase">HVAC Load Efficiency</span>
                                <span className={`${hvacEfficiency > 90 ? 'text-emerald-400' : hvacEfficiency > 80 ? 'text-amber-400' : 'text-red-400'} font-bold block mt-0.5`}>
                                  {hvacEfficiency}% (AC load: {Math.max(0, 100 - hvacEfficiency)}%)
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-zinc-500 block uppercase">Drive profile multiplier</span>
                                <span className="text-zinc-300 font-bold block mt-0.5">x{modeFactor.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                    </div>

                    {/* Shared Telemetry feedback info */}
                    <div className="text-[8px] font-mono text-zinc-500 border-t border-white/5 pt-2 flex justify-between items-center">
                      <span>PACK HEALTH: 99.4% (EXCELLENT)</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        AOSP CarPowerService Active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SYSTEM SCREEN 5: ECU SENSOR DIAGNOSTICS */}
              {currentSystem === 'diag' && (
                <div className="flex-1 flex flex-col md:flex-row h-full">
                  {/* Left Side: top-down wireframe vehicle outline with sensor nodes */}
                  <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-4 border-r border-white/5 relative select-none">
                    <div className="relative w-full max-w-[150px] aspect-[1/1.6] flex items-center justify-center">
                      
                      {/* Car Chassis wireframe representation */}
                      <svg className="w-full h-full opacity-85" viewBox="0 0 160 260" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="chassis-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1a1c23" />
                            <stop offset="100%" stopColor="#111216" />
                          </linearGradient>
                        </defs>
                        
                        {/* Vehicle Outline */}
                        <path
                          d="M 50 20 C 50 15, 110 15, 110 20 L 125 50 C 130 65, 135 180, 130 220 C 125 240, 110 250, 80 250 C 50 250, 35 240, 30 220 C 25 180, 30 65, 35 50 Z"
                          fill="url(#chassis-grad)"
                          stroke="#3f3f46"
                          strokeWidth="2.5"
                        />
                        
                        {/* Tires */}
                        <rect x="18" y="45" width="12" height="30" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
                        <rect x="130" y="45" width="12" height="30" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
                        <rect x="18" y="175" width="12" height="30" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
                        <rect x="130" y="175" width="12" height="30" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
                        
                        {/* Windshield outlines */}
                        <path d="M 45 75 C 45 75, 80 65, 115 75 L 110 100 H 50 Z" fill="none" stroke="#27272a" strokeWidth="1.5" />
                        <path d="M 50 185 H 110 L 105 210 H 55 Z" fill="none" stroke="#27272a" strokeWidth="1.5" />
                        
                        {/* ───── CLICKABLE ECU SENSOR NODES ───── */}
                        
                        {/* 1. Camera Node (Front ADAS Cam) */}
                        <g 
                          className="cursor-pointer" 
                          onClick={() => setDiagSelectedNode(diagSelectedNode === 'camera' ? null : 'camera')}
                        >
                          <circle 
                            cx="80" 
                            cy="35" 
                            r={diagSelectedNode === 'camera' ? 12 : 7} 
                            fill={diagSelectedNode === 'camera' ? 'rgba(59, 130, 246, 0.2)' : 'transparent'} 
                            className="transition-all duration-300"
                          />
                          <circle 
                            cx="80" 
                            cy="35" 
                            r="5" 
                            fill="#3b82f6" 
                            className="diag-node-pulse"
                            style={{ animationDuration: '2.5s' }}
                          />
                        </g>

                        {/* 2. Engine/Powertrain Node */}
                        <g 
                          className="cursor-pointer" 
                          onClick={() => setDiagSelectedNode(diagSelectedNode === 'engine' ? null : 'engine')}
                        >
                          <circle 
                            cx="80" 
                            cy="90" 
                            r={diagSelectedNode === 'engine' ? 12 : 7} 
                            fill={diagSelectedNode === 'engine' ? 'rgba(239, 68, 68, 0.2)' : 'transparent'} 
                            className="transition-all duration-300"
                          />
                          <circle 
                            cx="80" 
                            cy="90" 
                            r="5" 
                            fill="#ef4444" 
                            className="diag-node-pulse"
                            style={{ animationDuration: '1.2s' }}
                          />
                        </g>

                        {/* 3. Battery Management Node */}
                        <g 
                          className="cursor-pointer" 
                          onClick={() => setDiagSelectedNode(diagSelectedNode === 'battery' ? null : 'battery')}
                        >
                          <circle 
                            cx="80" 
                            cy="150" 
                            r={diagSelectedNode === 'battery' ? 12 : 7} 
                            fill={diagSelectedNode === 'battery' ? 'rgba(16, 185, 129, 0.2)' : 'transparent'} 
                            className="transition-all duration-300"
                          />
                          <circle 
                            cx="80" 
                            cy="150" 
                            r="5" 
                            fill="#10b981" 
                            className="diag-node-pulse"
                            style={{ animationDuration: '3s' }}
                          />
                        </g>

                        {/* 4. Braking Control Node */}
                        <g 
                          className="cursor-pointer" 
                          onClick={() => setDiagSelectedNode(diagSelectedNode === 'brakes' ? null : 'brakes')}
                        >
                          <circle 
                            cx="50" 
                            cy="110" 
                            r={diagSelectedNode === 'brakes' ? 12 : 7} 
                            fill={diagSelectedNode === 'brakes' ? 'rgba(16, 185, 129, 0.2)' : 'transparent'} 
                            className="transition-all duration-300"
                          />
                          <circle 
                            cx="50" 
                            cy="110" 
                            r="5" 
                            fill="#10b981" 
                            className="diag-node-pulse"
                            style={{ animationDuration: '2.1s' }}
                          />
                        </g>

                        {/* 5. Gateway / IVI Node */}
                        <g 
                          className="cursor-pointer" 
                          onClick={() => setDiagSelectedNode(diagSelectedNode === 'ivi' ? null : 'ivi')}
                        >
                          <circle 
                            cx="80" 
                            cy="210" 
                            r={diagSelectedNode === 'ivi' ? 12 : 7} 
                            fill={diagSelectedNode === 'ivi' ? 'rgba(245, 158, 11, 0.2)' : 'transparent'} 
                            className="transition-all duration-300"
                          />
                          <circle 
                            cx="80" 
                            cy="210" 
                            r="5" 
                            fill="#f59e0b" 
                            className="diag-node-pulse"
                            style={{ animationDuration: '1.7s' }}
                          />
                        </g>
                      </svg>
                      
                      {diagScanStatus === 'scanning' && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-3 text-center rounded-[20px]">
                          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-2" />
                          <span className="text-[10px] font-mono text-zinc-300 uppercase font-bold">Scanning Bus...</span>
                          <span className="text-[9px] font-mono text-rose-400 mt-1">{diagScanProgress}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Troubleshooter Diagnosis Output */}
                  <div className="w-full md:w-5/12 bg-zinc-950/70 p-4 flex flex-col justify-between select-none overflow-y-auto">
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 block">ECU Status Diagnostics</span>
                          <h4 className="text-xs font-bold text-zinc-300 mt-0.5">OBD-II CAN Interface</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (diagScanStatus === 'scanning') return;
                            setDiagScanStatus('scanning');
                            setDiagScanProgress(0);
                            setDiagTerminalOutput('Initializing OBD-II bus scanner...\nConnecting to ECUs over CAN gateway...');
                            
                            let progress = 0;
                            const interval = setInterval(() => {
                              progress += 20;
                              setDiagScanProgress(progress);
                              
                              if (progress === 20) {
                                setDiagTerminalOutput(prev => prev + '\n[OK] Found 5 active nodes on CAN gateway.');
                              } else if (progress === 40) {
                                setDiagTerminalOutput(prev => prev + '\n[OK] ADAS Camera initialized successfully.');
                              } else if (progress === 60) {
                                setDiagTerminalOutput(prev => prev + '\n[ERROR] ECU Engine Node reports fault code P0300.');
                              } else if (progress === 80) {
                                setDiagTerminalOutput(prev => prev + '\n[WARNING] Gateway IVI node reports connection warning U0140.');
                              } else if (progress === 100) {
                                setDiagTerminalOutput(prev => prev + '\n[COMPLETE] Scan complete. 2 ECU alerts active. Check details.');
                                setDiagScanStatus('complete');
                                clearInterval(interval);
                              }
                            }, 350);
                          }}
                          disabled={diagScanStatus === 'scanning'}
                          className="px-2 py-1 bg-rose-950 border border-rose-800 text-rose-400 hover:bg-rose-900 disabled:opacity-40 rounded text-[9px] font-bold tracking-wider uppercase transition-all"
                        >
                          Scan System
                        </button>
                      </div>

                      <div className="h-[1px] bg-white/10" />

                      {/* AI Advisor Panel */}
                      <div className="min-h-[110px] bg-zinc-900/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                        {diagSelectedNode ? (
                          <>
                            {diagSelectedNode === 'engine' && (
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase">Engine ECU: FAULT</span>
                                  <span className="text-[9px] font-mono text-zinc-500 font-bold">DTC P0300</span>
                                </div>
                                <p className="text-[10px] text-zinc-300 leading-normal">
                                  Misfires detected in multiple cylinders.
                                </p>
                                <div className="mt-2 p-1.5 bg-black/40 rounded border border-red-500/10 text-[9px] text-zinc-400 font-mono">
                                  <strong className="text-red-400 block mb-0.5">AI Troubleshooting Recommendation:</strong>
                                  1. Test voltage output on spark plugs & ignition coil signals.<br/>
                                  2. Inspect intake manifold gasket and vacuum lines.<br/>
                                  3. Run VHAL diagnostics to test sensor fuel-trim limits.
                                </div>
                              </div>
                            )}
                            {diagSelectedNode === 'camera' && (
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">ADAS Camera: SECURE</span>
                                  <span className="text-[9px] font-mono text-zinc-500 font-bold">DTC C0040</span>
                                </div>
                                <p className="text-[10px] text-zinc-300 leading-normal">
                                  Front vision image-sensor frame capture normal.
                                </p>
                                <div className="mt-2 p-1.5 bg-black/40 rounded border border-blue-500/10 text-[9px] text-zinc-400 font-mono">
                                  <strong className="text-blue-400 block mb-0.5">AI Calibration Advisor:</strong>
                                  No faults detected. Lens temperature nominal (34°C). Frame rate holding steady at 45fps.
                                </div>
                              </div>
                            )}
                            {diagSelectedNode === 'battery' && (
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">BMS Battery: SECURE</span>
                                  <span className="text-[9px] font-mono text-zinc-500 font-bold">DTC P0A7F</span>
                                </div>
                                <p className="text-[10px] text-zinc-300 leading-normal">
                                  Cell block voltage balance within 12mV thresholds.
                                </p>
                                <div className="mt-2 p-1.5 bg-black/40 rounded border border-emerald-500/10 text-[9px] text-zinc-400 font-mono">
                                  <strong className="text-emerald-400 block mb-0.5">AI Health Advisor:</strong>
                                  Battery health nominal. Internal resistance holds below 0.4 mOhm. Pack cool-down fans active.
                                </div>
                              </div>
                            )}
                            {diagSelectedNode === 'brakes' && (
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Brake ECU: SECURE</span>
                                  <span className="text-[9px] font-mono text-zinc-500 font-bold">DTC C1201</span>
                                </div>
                                <p className="text-[10px] text-zinc-300 leading-normal">
                                  Electronic stability control & hydraulic pressure feedback normal.
                                </p>
                                <div className="mt-2 p-1.5 bg-black/40 rounded border border-emerald-500/10 text-[9px] text-zinc-400 font-mono">
                                  <strong className="text-emerald-400 block mb-0.5">AI Safety Advisor:</strong>
                                  Brake pad wear calculated at 14%. Fluid level normal. Proximity emergency stop system (AEB) active.
                                </div>
                              </div>
                            )}
                            {diagSelectedNode === 'ivi' && (
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">Gateway IVI: ALERT</span>
                                  <span className="text-[9px] font-mono text-zinc-500 font-bold">DTC U0140</span>
                                </div>
                                <p className="text-[10px] text-zinc-300 leading-normal">
                                  Lost communication with Body Control Module (BCM).
                                </p>
                                <div className="mt-2 p-1.5 bg-black/40 rounded border border-amber-500/10 text-[9px] text-zinc-400 font-mono">
                                  <strong className="text-amber-500 block mb-0.5">AI Gateway Recovery Advisor:</strong>
                                  Occasional packet drops detected on CAN high link. Recommend checking wiring harnesses or restarting car_service binder loop.
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 py-2">
                            <Wrench className="w-5 h-5 mb-1.5 text-zinc-600" />
                            <span className="text-[10px] font-medium block">Select a pulsing node on the vehicle wireframe to view OBD-II trouble codes and AI diagnostics.</span>
                          </div>
                        )}
                      </div>

                      {/* Mock Diagnostics Terminal log */}
                      <div className="bg-black border border-white/5 rounded-lg p-2 font-mono text-[8px] text-zinc-400 h-16 overflow-y-auto space-y-0.5 scrollbar-thin">
                        {diagTerminalOutput.split('\n').map((line, idx) => (
                          <div key={idx} className={line.startsWith('[ERROR]') ? 'text-red-400' : line.startsWith('[WARNING]') ? 'text-amber-500' : 'text-zinc-500'}>
                            {line}
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* SYSTEM SCREEN 6: CABIN DMS/OMS AI */}
              {currentSystem === 'cabin' && (
                <div className="flex-1 flex flex-col md:flex-row h-full">
                  {/* Left Side: Viewer (DMS Camera, BCM Car status, Dashboard Cluster) */}
                  <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-4 border-r border-white/5 relative overflow-hidden select-none pt-12">
                    
                    {/* Sub-tab navigation inside left viewer */}
                    <div className="absolute top-2 left-3 right-3 flex justify-between items-center z-20">
                      <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${
                          cabinSubTab === 'dms' && (cabinDriverState === 'drowsy' || cabinDriverState === 'distracted') ? 'bg-red-500' : 'bg-emerald-500'
                        }`} />
                        {cabinSubTab === 'dms' && 'Live Feed: DMS_OMS_NPU_CAM'}
                        {cabinSubTab === 'bcm' && 'Body Control: BCM_TELEMETRY'}
                        {cabinSubTab === 'cluster' && 'Instrument Cluster: SECURE_HUD'}
                      </div>
                      <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                        {(['dms', 'bcm', 'cluster'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setCabinSubTab(tab)}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                              cabinSubTab === tab ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {tab === 'dms' ? '👁️ DMS' : tab === 'bcm' ? '🚗 Car' : '📟 Dash'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Left view content based on sub-tab */}

                    {/* SUB-TAB 1: DMS EYE TRACKING CAMERA */}
                    {cabinSubTab === 'dms' && (
                      <div className="w-full flex-1 flex flex-col items-center justify-center relative">
                        {/* Scan line overlays for camera simulation */}
                        <div className="scanline-anim pointer-events-none" />
                        
                        <div className="relative w-full max-w-[190px] aspect-square flex items-center justify-center">
                          {/* Driver face & seat tracking wireframe SVG */}
                          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            {/* Driver Seat Silhouette */}
                            <path
                              d="M 20 85 Q 25 55 35 40 L 45 40 Q 55 40 65 40 L 75 40 Q 85 55 90 85 Z"
                              fill="none"
                              stroke="#27272a"
                              strokeWidth="1"
                              strokeDasharray="2, 2"
                            />

                            {/* Head & Neck silhouette */}
                            <circle cx="50" cy="30" r="12" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
                            <path d="M 44 41 L 44 48 M 56 41 L 56 48" fill="none" stroke="#3f3f46" strokeWidth="1.5" />
                            
                            {/* Dynamic Face Mesh points based on driver state */}
                            {(() => {
                              const isAlert = cabinDriverState === 'drowsy' || cabinDriverState === 'distracted';
                              const color = isAlert ? '#ef4444' : '#10b981';
                              
                              // Face tracking coordinates
                              const points = [
                                { x: 50, y: 30 }, // Nose
                                { x: 45, y: 26 }, // Left eye
                                { x: 55, y: 26 }, // Right eye
                                { x: 50, y: 35 }, // Mouth
                                { x: 50, y: 19 }, // Forehead
                                { x: 39, y: 30 }, // Left cheek
                                { x: 61, y: 30 }, // Right cheek
                                { x: 50, y: 41 }, // Chin
                              ];

                              // Gaze offset points
                              let gazeX = 50;
                              let gazeY = 26;
                              if (cabinDriverState === 'distracted') {
                                gazeX = 35; // Looking down/aside
                                gazeY = 38;
                              } else if (cabinDriverState === 'drowsy') {
                                gazeY = 28; // Head dropping
                              }

                              return (
                                <>
                                  {/* Draw mesh lines */}
                                  <line x1="45" y1="26" x2="55" y2="26" stroke={color} strokeWidth="0.5" opacity="0.4" />
                                  <line x1="50" y1="19" x2="45" y2="26" stroke={color} strokeWidth="0.5" opacity="0.4" />
                                  <line x1="50" y1="19" x2="55" y2="26" stroke={color} strokeWidth="0.5" opacity="0.4" />
                                  <line x1="45" y1="26" x2="50" y2="30" stroke={color} strokeWidth="0.5" opacity="0.4" />
                                  <line x1="55" y1="26" x2="50" y2="30" stroke={color} strokeWidth="0.5" opacity="0.4" />
                                  <line x1="50" y1="30" x2="50" y2="35" stroke={color} strokeWidth="0.5" opacity="0.4" />
                                  <line x1="50" y1="35" x2="50" y2="41" stroke={color} strokeWidth="0.5" opacity="0.4" />
                                  <line x1="39" y1="30" x2="45" y2="26" stroke={color} strokeWidth="0.5" opacity="0.4" />
                                  <line x1="39" y1="30" x2="50" y2="41" stroke={color} strokeWidth="0.5" opacity="0.4" />
                                  <line x1="61" y1="30" x2="55" y2="26" stroke={color} strokeWidth="0.5" opacity="0.4" />
                                  <line x1="61" y1="30" x2="50" y2="41" stroke={color} strokeWidth="0.5" opacity="0.4" />

                                  {/* Landmark dots */}
                                  {points.map((p, idx) => (
                                    <circle
                                      key={idx}
                                      cx={p.x}
                                      cy={p.y}
                                      r="1.5"
                                      fill={color}
                                      className="face-node-pulse"
                                      style={{ animationDelay: `${idx * 0.15}s` }}
                                    />
                                  ))}

                                  {/* Gaze tracking vector lines */}
                                  <line
                                    x1={(points[1].x + points[2].x) / 2}
                                    y1="26"
                                    x2={gazeX}
                                    y2={gazeY}
                                    stroke={cabinDriverState === 'distracted' ? '#f59e0b' : '#3b82f6'}
                                    strokeWidth="1"
                                  />
                                  
                                  {/* Display gaze target text */}
                                  <text
                                    x={gazeX > 50 ? gazeX + 2 : gazeX - 18}
                                    y={gazeY}
                                    fill={cabinDriverState === 'distracted' ? '#f59e0b' : '#3b82f6'}
                                    fontSize="4.5"
                                    fontWeight="bold"
                                    fontFamily="monospace"
                                  >
                                    {cabinDriverState === 'attentive' && 'GAZE: ROAD'}
                                    {cabinDriverState === 'distracted' && 'GAZE: PHONE'}
                                    {cabinDriverState === 'drowsy' && 'GAZE: CLOSED'}
                                  </text>
                                </>
                              );
                            })()}
                          </svg>
                        </div>

                        {/* Drowsiness Overlay Trigger Alert */}
                        {cabinDriverState === 'drowsy' && (
                          <div className="absolute inset-0 bg-red-900/10 backdrop-blur-[0.5px] border border-red-500 flex flex-col items-center justify-center p-3 text-center z-10 animate-pulse rounded-2xl">
                            <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                            <span className="text-[10px] font-mono text-white font-black tracking-widest uppercase">
                              DMS WARNING: DROWSINESS DETECTED
                            </span>
                            <span className="text-[8px] font-mono text-red-400 mt-1 uppercase">
                              Driver Eyes Closed • Sound Alarm Triggered
                            </span>
                          </div>
                        )}
                        {cabinDriverState === 'distracted' && (
                          <div className="absolute inset-0 bg-amber-900/10 backdrop-blur-[0.5px] border border-amber-500 flex flex-col items-center justify-center p-3 text-center z-10 animate-pulse rounded-2xl">
                            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                            <span className="text-[10px] font-mono text-white font-black tracking-widest uppercase">
                              DMS WARNING: DISTRACTED
                            </span>
                            <span className="text-[8px] font-mono text-amber-400 mt-1 uppercase">
                              Eyes off Road &gt; 2.0s • Look Ahead
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB-TAB 2: CAR BCM BLUEPRINT (OPEN DOORS & WINDOWS) */}
                    {cabinSubTab === 'bcm' && (
                      <div className="w-full flex-1 flex flex-col items-center justify-center relative p-2">
                        {/* Car status outline blueprint */}
                        <div className="relative w-full max-w-[190px] aspect-square flex items-center justify-center">
                          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <linearGradient id="headlight-beam" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="#eab308" stopOpacity="0" />
                                <stop offset="100%" stopColor="#eab308" stopOpacity="0.45" />
                              </linearGradient>
                            </defs>

                            {/* Headlight beams */}
                            {cabinHeadlights === 'on' && (
                              <>
                                <polygon points="32,20 20,2 40,2 35,20" fill="url(#headlight-beam)" />
                                <polygon points="68,20 60,2 80,2 65,20" fill="url(#headlight-beam)" />
                              </>
                            )}

                            {/* Outer chassis frame */}
                            <path
                              d="M 38 18 C 38 18, 50 14, 62 18 C 65 24, 66 35, 66 50 C 66 65, 65 76, 62 82 C 50 86, 50 86, 38 82 C 35 76, 34 65, 34 50 C 34 35, 35 24, 38 18 Z"
                              fill="#09090b"
                              strokeWidth="1.5"
                              className={`transition-all duration-300 ${
                                cabinAmbientColor === 'blue' ? 'stroke-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.45)]' :
                                cabinAmbientColor === 'purple' ? 'stroke-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.45)]' :
                                cabinAmbientColor === 'orange' ? 'stroke-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.45)]' :
                                'stroke-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]'
                              }`}
                            />

                            {/* Hood (interactive) */}
                            <path
                              d={cabinDoorHood ? "M 38 18 L 50 6 L 62 18 Z" : "M 38 18 Q 50 21 62 18 Z"}
                              fill={cabinDoorHood ? "rgba(245,158,11,0.15)" : "none"}
                              stroke={cabinDoorHood ? "#f59e0b" : "#52525b"}
                              strokeWidth="1.2"
                              className="cursor-pointer transition-all duration-300"
                              onClick={() => setCabinDoorHood(!cabinDoorHood)}
                            />
                            <text
                              x="50" y="16"
                              fill={cabinDoorHood ? "#f59e0b" : "#71717a"}
                              fontSize="3.2" textAnchor="middle" fontWeight="bold" fontFamily="monospace"
                              className="cursor-pointer select-none"
                              onClick={() => setCabinDoorHood(!cabinDoorHood)}
                            >
                              HOOD
                            </text>

                            {/* Trunk (interactive) */}
                            <path
                              d={cabinDoorTrunk ? "M 38 82 L 50 94 L 62 82 Z" : "M 38 82 Q 50 79 62 82 Z"}
                              fill={cabinDoorTrunk ? "rgba(245,158,11,0.15)" : "none"}
                              stroke={cabinDoorTrunk ? "#f59e0b" : "#52525b"}
                              strokeWidth="1.2"
                              className="cursor-pointer transition-all duration-300"
                              onClick={() => setCabinDoorTrunk(!cabinDoorTrunk)}
                            />
                            <text
                              x="50" y="85.5"
                              fill={cabinDoorTrunk ? "#f59e0b" : "#71717a"}
                              fontSize="3.2" textAnchor="middle" fontWeight="bold" fontFamily="monospace"
                              className="cursor-pointer select-none"
                              onClick={() => setCabinDoorTrunk(!cabinDoorTrunk)}
                            >
                              TRUNK
                            </text>

                            {/* FL Door: Hinge is at the front (34, 30) */}
                            <g className="cursor-pointer" onClick={() => setCabinDoorFL(!cabinDoorFL)}>
                              <path
                                d={cabinDoorFL ? "M 34 30 L 16 23" : "M 34 30 L 34 45"}
                                stroke={cabinDoorFL ? "#ef4444" : "#71717a"}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className="transition-all duration-300"
                              />
                              <text x="26" y="37" fill={cabinDoorFL ? "#ef4444" : "#a1a1aa"} fontSize="4.5" fontWeight="bold" fontFamily="monospace">FL</text>
                            </g>

                            {/* FR Door: Hinge is at the front (66, 30) */}
                            <g className="cursor-pointer" onClick={() => setCabinDoorFR(!cabinDoorFR)}>
                              <path
                                d={cabinDoorFR ? "M 66 30 L 84 23" : "M 66 30 L 66 45"}
                                stroke={cabinDoorFR ? "#ef4444" : "#71717a"}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className="transition-all duration-300"
                              />
                              <text x="70" y="37" fill={cabinDoorFR ? "#ef4444" : "#a1a1aa"} fontSize="4.5" fontWeight="bold" fontFamily="monospace">FR</text>
                            </g>

                            {/* RL Door: Hinge is at the front (34, 49) */}
                            <g className="cursor-pointer" onClick={() => setCabinDoorRL(!cabinDoorRL)}>
                              <path
                                d={cabinDoorRL ? "M 34 49 L 16 54" : "M 34 49 L 34 64"}
                                stroke={cabinDoorRL ? "#ef4444" : "#71717a"}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className="transition-all duration-300"
                              />
                              <text x="26" y="58" fill={cabinDoorRL ? "#ef4444" : "#a1a1aa"} fontSize="4.5" fontWeight="bold" fontFamily="monospace">RL</text>
                            </g>

                            {/* RR Door: Hinge is at the front (66, 49) */}
                            <g className="cursor-pointer" onClick={() => setCabinDoorRR(!cabinDoorRR)}>
                              <path
                                d={cabinDoorRR ? "M 66 49 L 84 54" : "M 66 49 L 66 64"}
                                stroke={cabinDoorRR ? "#ef4444" : "#71717a"}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className="transition-all duration-300"
                              />
                              <text x="70" y="58" fill={cabinDoorRR ? "#ef4444" : "#a1a1aa"} fontSize="4.5" fontWeight="bold" fontFamily="monospace">RR</text>
                            </g>

                            {/* Windows (Dashed if open, solid colored block if closed) */}
                            {/* FL Window Glass */}
                            <rect
                              x="35.5" y="32" width="1" height="10"
                              fill="#22d3ee" fillOpacity={cabinWindowFL ? 0 : 0.35}
                              stroke="#22d3ee" strokeWidth="0.5" strokeDasharray={cabinWindowFL ? "2,2" : "none"}
                              className="transition-all duration-300"
                            />
                            {/* FR Window Glass */}
                            <rect
                              x="63.5" y="32" width="1" height="10"
                              fill="#22d3ee" fillOpacity={cabinWindowFR ? 0 : 0.35}
                              stroke="#22d3ee" strokeWidth="0.5" strokeDasharray={cabinWindowFR ? "2,2" : "none"}
                              className="transition-all duration-300"
                            />
                            {/* RL Window Glass */}
                            <rect
                              x="35.5" y="51.5" width="1" height="10"
                              fill="#22d3ee" fillOpacity={cabinWindowRL ? 0 : 0.35}
                              stroke="#22d3ee" strokeWidth="0.5" strokeDasharray={cabinWindowRL ? "2,2" : "none"}
                              className="transition-all duration-300"
                            />
                            {/* RR Window Glass */}
                            <rect
                              x="63.5" y="51.5" width="1" height="10"
                              fill="#22d3ee" fillOpacity={cabinWindowRR ? 0 : 0.35}
                              stroke="#22d3ee" strokeWidth="0.5" strokeDasharray={cabinWindowRR ? "2,2" : "none"}
                              className="transition-all duration-300"
                            />

                            {/* Headlights and taillights elements */}
                            <ellipse cx="37" cy="18" rx="1.5" ry="0.8" fill={cabinHeadlights === 'on' ? '#f59e0b' : '#3f3f46'} />
                            <ellipse cx="63" cy="18" rx="1.5" ry="0.8" fill={cabinHeadlights === 'on' ? '#f59e0b' : '#3f3f46'} />
                            <line x1="37" y1="81.5" x2="42" y2="81.5" stroke="#ef4444" strokeWidth="1.5" />
                            <line x1="58" y1="81.5" x2="63" y2="81.5" stroke="#ef4444" strokeWidth="1.5" />

                            {/* Hazard light indicator flashing rings */}
                            <circle cx="34.5" cy="19.5" r="1.2" className={cabinHazards ? "hazard-flash-anim" : ""} fill="#f59e0b" opacity={cabinHazards ? undefined : "0.1"} />
                            <circle cx="65.5" cy="19.5" r="1.2" className={cabinHazards ? "hazard-flash-anim" : ""} fill="#f59e0b" opacity={cabinHazards ? undefined : "0.1"} />
                            <circle cx="34.5" cy="80.5" r="1.2" className={cabinHazards ? "hazard-flash-anim" : ""} fill="#f59e0b" opacity={cabinHazards ? undefined : "0.1"} />
                            <circle cx="65.5" cy="80.5" r="1.2" className={cabinHazards ? "hazard-flash-anim" : ""} fill="#f59e0b" opacity={cabinHazards ? undefined : "0.1"} />
                          </svg>
                        </div>

                        {/* Interactive car overlay notices */}
                        <div className="mt-1 text-[8px] font-mono text-zinc-500 uppercase flex gap-2">
                          <span>Click components to toggle</span>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 3: DIGITAL INSTRUMENT CLUSTER */}
                    {cabinSubTab === 'cluster' && (
                      <div className="w-full flex-1 flex flex-col justify-between p-2 select-none">
                        
                        {/* Upper cluster panel: Gear, Hazards, headlamps */}
                        <div className="flex justify-between items-center bg-black/40 border border-white/5 rounded-xl p-2 mt-4">
                          {/* Light indicator telltales */}
                          <div className="flex gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono transition-all ${
                              cabinHeadlights === 'on' ? 'bg-blue-600 text-white font-black' : 'text-zinc-600 bg-zinc-900/30'
                            }`}>
                              HI-BEAM
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono transition-all ${
                              cabinHeadlights !== 'off' ? 'bg-emerald-600/90 text-white font-black' : 'text-zinc-600 bg-zinc-900/30'
                            }`}>
                              LO-BEAM
                            </span>
                          </div>

                          {/* Hazard light telltale */}
                          <button
                            onClick={() => setCabinHazards(!cabinHazards)}
                            className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border transition-all ${
                              cabinHazards
                                ? 'bg-red-600/80 border-red-500 text-white animate-pulse'
                                : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            ⚠️
                          </button>

                          {/* Gear shift status indicator */}
                          <div className="flex gap-1 font-mono text-[9px] font-bold bg-black/50 p-0.5 rounded border border-white/5">
                            {['P', 'R', 'N', 'D'].map((gear) => {
                              const isHighlighted = (speed === 0 && gear === 'P') || (speed > 0 && gear === 'D');
                              return (
                                <span
                                  key={gear}
                                  className={`w-4 h-4 flex items-center justify-center rounded ${
                                    isHighlighted ? 'bg-cyan-500 text-black font-black' : 'text-zinc-500'
                                  }`}
                                >
                                  {gear}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Mid cluster panel: Live digital speedometer */}
                        <div className="flex-1 flex flex-col items-center justify-center my-3 relative">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Speedometer HUD</span>
                          <div className="text-3xl font-black text-white font-mono tracking-tighter flex items-baseline mt-1">
                            {speed}
                            <span className="text-[10px] font-bold text-cyan-400 font-mono ml-1 uppercase">km/h</span>
                          </div>
                          
                          {/* Live Odometer */}
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block mt-1">
                            ODO: 12,842.6 km
                          </span>
                        </div>

                        {/* Bottom cluster panel: Battery bar and alerts */}
                        <div className="space-y-2 bg-black/40 border border-white/5 rounded-xl p-2.5">
                          {/* EV battery state indicator */}
                          <div className="flex justify-between items-center text-[9px] font-mono mb-1">
                            <span className="text-zinc-400 uppercase">AOSP EV Core Battery</span>
                            <span className="text-emerald-400 font-bold">82% SoC</span>
                          </div>
                          <div className="w-full bg-zinc-900 border border-white/5 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[82%] transition-all duration-300" />
                          </div>
                          <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1">
                            <span>RANGE EST: 412 km</span>
                            <span>TEMP: 34°C</span>
                          </div>

                          {/* Door and seatbelt warn alerts inside Cluster HUD */}
                          {(() => {
                            const isDoorOpen = cabinDoorFL || cabinDoorFR || cabinDoorRL || cabinDoorRR || cabinDoorHood || cabinDoorTrunk;
                            const isBeltUnbuckled = !cabinSeatbeltDriver || (cabinSeatbeltPassenger && !cabinSeatbeltPassenger); // check pass if present
                            
                            if (isDoorOpen || isBeltUnbuckled) {
                              return (
                                <div className="border-t border-red-500/20 pt-2 flex flex-col gap-1 text-[8px] font-mono text-red-500">
                                  {isDoorOpen && <span>⚠️ VEHICLE CLOSURES OPEN / UNSECURED</span>}
                                  {isBeltUnbuckled && <span>⚠️ OCCUPANT SEATBELT WARNING ACTIVE</span>}
                                </div>
                              );
                            }
                            return (
                              <div className="border-t border-white/5 pt-2 text-[8px] font-mono text-zinc-500 text-center uppercase">
                                System Status: Secure / Ready
                              </div>
                            );
                          })()}
                        </div>

                      </div>
                    )}

                  </div>

                  {/* Right Side: Controller console (Cabin AI, Dual-Zone AC, comfort & doors toggles) */}
                  <div className="w-full md:w-5/12 bg-zinc-950/70 p-4 flex flex-col justify-between select-none overflow-y-auto">
                    <div className="space-y-4">
                      
                      {/* Section 1: Cabin DMS/OMS AI Core */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 block">DMS/OMS Cabin AI</span>
                          <span className="text-[8px] font-mono text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded border border-white/5">OMS-EyeNet-v4</span>
                        </div>
                        
                        {/* Driver attention selector */}
                        <div className="grid grid-cols-3 gap-1 bg-black/30 p-0.5 rounded-lg border border-white/5">
                          {(['attentive', 'distracted', 'drowsy'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setCabinDriverState(mode);
                                if (mode === 'attentive') setCabinDrowsiness(8);
                                else if (mode === 'distracted') setCabinDrowsiness(35);
                                else if (mode === 'drowsy') setCabinDrowsiness(88);
                              }}
                              className={`py-1 px-1 rounded text-[8px] font-bold uppercase transition-all ${
                                cabinDriverState === mode
                                  ? mode === 'attentive'
                                    ? 'bg-emerald-600 text-white font-black'
                                    : mode === 'distracted'
                                    ? 'bg-amber-600 text-white font-black'
                                    : 'bg-red-600 text-white font-black animate-pulse'
                                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>

                        {/* Drowsiness index slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[8px] font-mono">
                            <span className="text-zinc-500 uppercase">Drowsiness score</span>
                            <span className={`font-bold ${cabinDrowsiness > 70 ? 'text-red-500 animate-pulse' : cabinDrowsiness > 30 ? 'text-amber-500' : 'text-emerald-400'}`}>
                              {cabinDrowsiness}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={cabinDrowsiness}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setCabinDrowsiness(val);
                              if (val > 70) setCabinDriverState('drowsy');
                              else if (val > 30) setCabinDriverState('distracted');
                              else setCabinDriverState('attentive');
                            }}
                            className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="h-[1px] bg-white/10" />

                      {/* Section 2: Dual-Zone AC Climate Engine */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 block">Climate Engine (AC)</span>
                          
                          {/* AC on/off */}
                          <button
                            onClick={() => setCabinAcActive(!cabinAcActive)}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase transition-all ${
                              cabinAcActive ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            AC {cabinAcActive ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        {/* AC Dual Temps */}
                        <div className="space-y-2 bg-black/20 p-2 rounded-xl border border-white/5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase">AC Temperature settings</span>
                            
                            {/* SYNC Button */}
                            <button
                              onClick={() => {
                                setCabinAcSync(!cabinAcSync);
                                if (!cabinAcSync) {
                                  // sync passenger to driver temp
                                  setCabinTempPassenger(cabinTemp);
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[7px] font-bold font-mono transition-all ${
                                cabinAcSync ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-zinc-500 border border-white/5'
                              }`}
                            >
                              SYNC zones
                            </button>
                          </div>

                          {/* Driver Zone slider */}
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[8px] font-mono text-zinc-400">
                              <span>Driver temp</span>
                              <span className="font-bold text-zinc-200">{cabinTemp.toFixed(1)}°C</span>
                            </div>
                            <input
                              type="range"
                              min="16"
                              max="28"
                              step="0.5"
                              value={cabinTemp}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setCabinTemp(val);
                                if (cabinAcSync) setCabinTempPassenger(val);
                              }}
                              disabled={!cabinAcActive}
                              className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-500 disabled:opacity-40"
                            />
                          </div>

                          {/* Passenger Zone slider */}
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[8px] font-mono text-zinc-400">
                              <span>Passenger temp</span>
                              <span className="font-bold text-zinc-200">{cabinTempPassenger.toFixed(1)}°C</span>
                            </div>
                            <input
                              type="range"
                              min="16"
                              max="28"
                              step="0.5"
                              value={cabinTempPassenger}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setCabinTempPassenger(val);
                                if (cabinAcSync) {
                                  setCabinTemp(val);
                                }
                              }}
                              disabled={!cabinAcActive || cabinAcSync}
                              className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-500 disabled:opacity-40"
                            />
                          </div>
                        </div>

                        {/* Fan Speeds and Airflow distribution modes */}
                        <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
                          {/* Fan speed levels */}
                          <div>
                            <span className="text-zinc-500 block mb-1 uppercase">Fan speed</span>
                            <div className="grid grid-cols-4 gap-0.5 bg-black/40 p-0.5 rounded border border-white/5">
                              {(['auto', 'low', 'med', 'high'] as const).map((level) => (
                                <button
                                  key={level}
                                  onClick={() => setCabinAcFanSpeed(level)}
                                  disabled={!cabinAcActive}
                                  className={`py-0.5 rounded uppercase font-bold text-[7px] ${
                                    cabinAcFanSpeed === level ? 'bg-cyan-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Air Distribution mode */}
                          <div>
                            <span className="text-zinc-500 block mb-1 uppercase">Air vents</span>
                            <div className="grid grid-cols-3 gap-0.5 bg-black/40 p-0.5 rounded border border-white/5">
                              {(['face', 'feet', 'defrost'] as const).map((mode) => (
                                <button
                                  key={mode}
                                  onClick={() => setCabinAcMode(mode)}
                                  disabled={!cabinAcActive}
                                  className={`py-0.5 rounded uppercase font-bold text-[7px] ${
                                    cabinAcMode === mode ? 'bg-cyan-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  {mode}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recirculation toggle & Airflow simulation graphics */}
                        <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCabinAcRecirc(!cabinAcRecirc)}
                              disabled={!cabinAcActive}
                              className={`px-2 py-1 rounded text-[7px] font-bold font-mono transition-all ${
                                cabinAcRecirc ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-zinc-500 border border-white/5'
                              }`}
                            >
                              {cabinAcRecirc ? '🔄 RECIRCULATE' : '💨 FRESH AIR'}
                            </button>
                          </div>
                          
                          {/* Animated airflow lines */}
                          <div className="w-16 h-5 flex items-center justify-center overflow-hidden">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M 5 10 Q 20 2, 35 10 T 65 10"
                                fill="none"
                                stroke={cabinAcActive ? "#22d3ee" : "#27272a"}
                                strokeWidth="1.5"
                                className={cabinAcActive ? "ac-airflow-anim" : ""}
                              />
                            </svg>
                          </div>
                        </div>

                      </div>

                      <div className="h-[1px] bg-white/10" />

                      {/* Section 3: Passenger comfort & Closures control panel */}
                      <div className="space-y-3">
                        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 block">Comfort & Closures</span>
                        
                        {/* Occupant Seatbelts */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCabinSeatbeltDriver(!cabinSeatbeltDriver)}
                            className={`flex-1 py-1.5 border rounded-lg flex flex-col items-center justify-center transition-all ${
                              cabinSeatbeltDriver
                                ? 'bg-zinc-900/60 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-950/20 border-red-500/30 text-red-500 animate-pulse font-black'
                            }`}
                          >
                            <span className="text-[7px] font-mono uppercase block">Driver belt</span>
                            <span className="text-[8px] font-bold mt-0.5">
                              {cabinSeatbeltDriver ? '🔒 BUCKLED' : '⚠️ UNBELTED'}
                            </span>
                          </button>

                          <button
                            onClick={() => setCabinSeatbeltPassenger(!cabinSeatbeltPassenger)}
                            className={`flex-1 py-1.5 border rounded-lg flex flex-col items-center justify-center transition-all ${
                              cabinSeatbeltPassenger
                                ? 'bg-zinc-900/60 border-emerald-500/20 text-emerald-400'
                                : 'bg-zinc-900/40 border-white/5 text-zinc-500'
                            }`}
                          >
                            <span className="text-[7px] font-mono uppercase block">Passenger belt</span>
                            <span className="text-[8px] font-bold mt-0.5">
                              {cabinSeatbeltPassenger ? '🔒 BUCKLED' : '👤 VACANT'}
                            </span>
                          </button>
                        </div>

                        {/* Seat Heaters */}
                        <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
                          {/* Driver seat heater */}
                          <div className="p-2 bg-black/20 rounded-xl border border-white/5 flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-zinc-500">Driver Seat Heat</span>
                              <span className="text-amber-500 font-bold">{cabinSeatHeaterDriver > 0 ? `L${cabinSeatHeaterDriver}` : 'OFF'}</span>
                            </div>
                            <div className="flex justify-between items-center gap-1">
                              <button
                                onClick={() => setCabinSeatHeaterDriver((prev) => (prev + 1) % 4)}
                                className={`flex-1 py-1 rounded text-[7px] uppercase font-bold transition-all ${
                                  cabinSeatHeaterDriver > 0 ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-500'
                                }`}
                              >
                                HEAT
                              </button>
                              
                              {/* Thermal graphics */}
                              <div className="w-8 h-4 flex items-center justify-center gap-0.5 overflow-hidden">
                                {[...Array(3)].map((_, i) => (
                                  <svg key={i} className="w-2 h-full" viewBox="0 0 10 20" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      d="M 5 20 Q 2 15, 5 10 T 5 0"
                                      fill="none"
                                      stroke={cabinSeatHeaterDriver > i ? "#f97316" : "#27272a"}
                                      strokeWidth="1.5"
                                      className={cabinSeatHeaterDriver > i ? "heatwave-anim" : ""}
                                      style={{ animationDelay: `${i * 0.2}s` }}
                                    />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Passenger seat heater */}
                          <div className="p-2 bg-black/20 rounded-xl border border-white/5 flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-zinc-500">Pass. Seat Heat</span>
                              <span className="text-amber-500 font-bold">{cabinSeatHeaterPassenger > 0 ? `L${cabinSeatHeaterPassenger}` : 'OFF'}</span>
                            </div>
                            <div className="flex justify-between items-center gap-1">
                              <button
                                onClick={() => setCabinSeatHeaterPassenger((prev) => (prev + 1) % 4)}
                                className={`flex-1 py-1 rounded text-[7px] uppercase font-bold transition-all ${
                                  cabinSeatHeaterPassenger > 0 ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-500'
                                }`}
                              >
                                HEAT
                              </button>
                              
                              {/* Thermal graphics */}
                              <div className="w-8 h-4 flex items-center justify-center gap-0.5 overflow-hidden">
                                {[...Array(3)].map((_, i) => (
                                  <svg key={i} className="w-2 h-full" viewBox="0 0 10 20" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      d="M 5 20 Q 2 15, 5 10 T 5 0"
                                      fill="none"
                                      stroke={cabinSeatHeaterPassenger > i ? "#f97316" : "#27272a"}
                                      strokeWidth="1.5"
                                      className={cabinSeatHeaterPassenger > i ? "heatwave-anim" : ""}
                                      style={{ animationDelay: `${i * 0.2}s` }}
                                    />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Headlights and Hazards Controls */}
                        <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
                          <div>
                            <span className="text-zinc-500 block mb-1 uppercase">Exterior Lights</span>
                            <div className="grid grid-cols-3 gap-0.5 bg-black/40 p-0.5 rounded border border-white/5">
                              {(['off', 'parking', 'on'] as const).map((mode) => (
                                <button
                                  key={mode}
                                  onClick={() => setCabinHeadlights(mode)}
                                  className={`py-1 rounded uppercase font-bold text-[7px] ${
                                    cabinHeadlights === mode ? 'bg-cyan-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  {mode}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-zinc-500 block mb-1 uppercase">Hazards & Windows</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setCabinHazards(!cabinHazards)}
                                className={`flex-1 py-1 rounded font-bold text-[7px] uppercase ${
                                  cabinHazards ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                Hazards
                              </button>
                              <button
                                onClick={() => {
                                  // toggle all windows at once as a comfort helper
                                  const anyWindowOpen = cabinWindowFL || cabinWindowFR || cabinWindowRL || cabinWindowRR;
                                  setCabinWindowFL(!anyWindowOpen);
                                  setCabinWindowFR(!anyWindowOpen);
                                  setCabinWindowRL(!anyWindowOpen);
                                  setCabinWindowRR(!anyWindowOpen);
                                }}
                                className="flex-1 py-1 rounded font-bold text-[7px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 uppercase"
                              >
                                Windows
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="h-[1px] bg-white/10" />

                      {/* Interactive Cabin Ambient theme */}
                      <div className="space-y-1.5">
                        <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 block">Ambient Light Theme</span>
                        <div className="flex items-center gap-3">
                          {([
                            { id: 'blue', color: 'bg-blue-500 shadow-blue-500/30' },
                            { id: 'purple', color: 'bg-purple-500 shadow-purple-500/30' },
                            { id: 'orange', color: 'bg-amber-500 shadow-amber-500/30' },
                            { id: 'cyan', color: 'bg-cyan-400 shadow-cyan-400/30' }
                          ] as const).map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() => setCabinAmbientColor(theme.id)}
                              className={`w-6 h-6 rounded-full ${theme.color} shadow-lg transition-transform transform active:scale-95 ${
                                cabinAmbientColor === theme.id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Shared Telemetry feedback info */}
                    <div className="text-[8px] font-mono text-zinc-500 border-t border-white/5 pt-2 flex justify-between items-center mt-2">
                      <span className="uppercase">Dual-Zone AC Active: {cabinAcActive ? 'Yes' : 'No'}</span>
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${
                          cabinAmbientColor === 'blue' ? 'bg-blue-500' :
                          cabinAmbientColor === 'purple' ? 'bg-purple-500' :
                          cabinAmbientColor === 'orange' ? 'bg-amber-500' : 'bg-cyan-400'
                        }`} />
                        OMS Ambient Control Active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SYSTEM SCREEN 7: SMART E-BIKE COCKPIT */}
              {currentSystem === 'bike' && (
                <div className="flex-1 flex flex-col md:flex-row h-full">
                  {/* Left Side: Circular Speedometer & Power assist meter SVG */}
                  <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-4 border-r border-white/5 relative select-none">
                    
                    {/* Gauge cluster SVG */}
                    <div className="relative w-full max-w-[220px] aspect-square flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="speed-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#0d9488" />
                          </linearGradient>
                        </defs>

                        {/* Outer Gauge Rim */}
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#1f2937" strokeWidth="3" />
                        
                        {/* Speed display ticks */}
                        <path d="M 60 12 L 60 16 M 108 60 L 104 60 M 60 108 L 60 104 M 12 60 L 16 60" fill="none" stroke="#4b5563" strokeWidth="1.5" />
                        
                        {/* Speed indicator arc based on bike speed */}
                        {(() => {
                          const maxSpeed = 60;
                          const calculatedSpeed = Math.round((bikeCadence / 120) * (bikeGear * 5.5) * (1.0 + (bikeAssist * 0.25)));
                          const clampedSpeed = Math.min(maxSpeed, Math.max(0, calculatedSpeed));
                          
                          // Circular gauge calculation: Circumference = 2 * PI * r = 2 * 3.14159 * 50 = 314
                          const radius = 50;
                          const circ = 2 * Math.PI * radius;
                          const strokeDashoffset = circ - (clampedSpeed / maxSpeed) * (circ * 0.75);

                          // Torque Calculation (Nm)
                          const torqueNm = bikeAssist === 0 ? 0 : Math.round((bikeCadence > 0 ? 30 + bikeAssist * 12 : 0) + (100 - bikeBattery) * 0.05);

                          return (
                            <>
                              {/* Power Arc (glowing cyan background track) */}
                              <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="#115e59"
                                strokeWidth="2.5"
                                strokeDasharray={circ * 0.75}
                                strokeDashoffset={circ * 0.75}
                                transform="rotate(135 60 60)"
                                opacity="0.3"
                              />

                              {/* Speed Arc */}
                              <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="url(#speed-grad)"
                                strokeWidth="3"
                                strokeDasharray={circ * 0.75}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform="rotate(135 60 60)"
                                className="transition-all duration-500 ease-out"
                              />

                              {/* Speed Text & Telemetry HUD inside the circle */}
                              <g transform="translate(60, 60)" textAnchor="middle">
                                {/* Digital speed */}
                                <text y="-2" fill="white" fontSize="20" fontWeight="bold" fontFamily="monospace" className="tracking-tighter">
                                  {clampedSpeed}
                                </text>
                                <text y="8" fill="#14b8a6" fontSize="5" fontWeight="bold" fontFamily="monospace" className="uppercase tracking-widest">
                                  KM/H
                                </text>

                                {/* Gear selection indicator */}
                                <text y="20" fill="#9ca3af" fontSize="5" fontFamily="monospace">
                                  GEAR: <tspan fill="white" fontWeight="bold">{bikeGear}</tspan>
                                </text>

                                {/* Cadence index */}
                                <text y="28" fill="#9ca3af" fontSize="5.5" fontFamily="monospace">
                                  {bikeCadence} <tspan fontSize="4.5">RPM</tspan>
                                </text>

                                {/* Torque sensor meter */}
                                <text y="-18" fill="#5eead4" fontSize="5" fontWeight="black" fontFamily="monospace">
                                  {torqueNm} Nm Torque
                                </text>
                              </g>
                            </>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Cadence torque animation flow */}
                    <div className="w-full flex items-center justify-between mt-2 max-w-[200px] border-t border-white/5 pt-2">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase">Torque Waveflow</span>
                      <span className="text-[8px] font-mono text-teal-400 font-bold">
                        {bikeCadence > 0 ? 'HUB MOTOR ENGAGED' : 'IDLE / REGEN COAST'}
                      </span>
                    </div>

                    <svg className="w-full max-w-[200px] h-6 mt-1.5" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 5 12 H 195" fill="none" stroke="#1f2937" strokeWidth="2" />
                      {bikeCadence > 0 && (
                        <path
                          d="M 5 12 H 195"
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="2"
                          className="torque-flow-anim"
                          style={{
                            animationPlayState: bikeCadence > 0 ? 'running' : 'paused',
                            animationDuration: `${1.5 - (bikeAssist * 0.25)}s`
                          }}
                        />
                      )}
                    </svg>

                  </div>

                  {/* Right Side: PAS assist modes, pedal cadence simulation & range details */}
                  <div className="w-full md:w-5/12 bg-zinc-950/70 p-4 flex flex-col justify-between select-none overflow-y-auto">
                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 block">E-Bike Motor Controller</span>
                        <h4 className="text-xs font-bold text-zinc-300 mt-0.5">Dual-Core E-BIKE CAN Bus</h4>
                      </div>

                      <div className="h-[1px] bg-white/10" />

                      {/* Pedal Assist Level Selector */}
                      <div>
                        <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 block mb-1.5">Pedal Assist Level (PAS)</span>
                        <div className="grid grid-cols-5 gap-1 bg-black/30 p-0.5 rounded-lg border border-white/5">
                          {['OFF', 'ECO', 'TOUR', 'SPORT', 'BOOST'].map((label, idx) => (
                            <button
                              key={label}
                              onClick={() => setBikeAssist(idx)}
                              className={`py-1 px-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                                bikeAssist === idx
                                  ? label === 'BOOST'
                                    ? 'bg-rose-600 text-white font-black animate-pulse'
                                    : label === 'SPORT'
                                    ? 'bg-teal-600 text-white'
                                    : label === 'OFF'
                                    ? 'bg-zinc-700 text-white'
                                    : 'bg-teal-700 text-white'
                                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mechanical Shifter controls */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 block">Mechanical Gears</span>
                          <span className="text-xs font-bold text-zinc-300">1x9-Speed Cassette</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setBikeGear((g) => Math.max(1, g - 1))}
                            disabled={bikeGear === 1}
                            className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white border border-white/5 rounded-lg flex items-center justify-center font-bold text-xs transition-all active:scale-95"
                          >
                            -
                          </button>
                          <div className="w-7 h-7 bg-zinc-900 border border-white/10 text-teal-400 font-bold rounded-lg flex items-center justify-center font-mono text-xs">
                            {bikeGear}
                          </div>
                          <button
                            onClick={() => setBikeGear((g) => Math.min(9, g + 1))}
                            disabled={bikeGear === 9}
                            className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white border border-white/5 rounded-lg flex items-center justify-center font-bold text-xs transition-all active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Pedal Cadence RPM Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-zinc-500 uppercase">Simulated Rider Cadence</span>
                          <span className="font-bold text-teal-400">{bikeCadence} RPM</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="120"
                          value={bikeCadence}
                          onChange={(e) => setBikeCadence(parseInt(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-teal-500"
                        />
                      </div>

                      {/* AI range estimator for E-bike */}
                      {(() => {
                        const baseDistance = 110; // base km
                        const assistFactor = bikeAssist === 0 ? 0 : 2.5 / (bikeAssist + 0.5);
                        const batteryMultiplier = bikeBattery / 100;
                        const cadenceBoost = bikeCadence > 0 ? (1.0 + (bikeCadence - 60) * 0.002) : 1.0;

                        const predictedBikeRange = Math.round(baseDistance * assistFactor * batteryMultiplier * cadenceBoost);

                        return (
                          <div className="p-2.5 bg-zinc-900/60 border border-white/5 rounded-xl flex items-center justify-between text-[9px] font-mono">
                            <div>
                              <span className="text-zinc-500 block uppercase">Projected Battery Range</span>
                              <span className="text-zinc-300 font-bold block mt-0.5">
                                {bikeAssist === 0 ? (
                                  <span className="text-emerald-400">∞ km (MANUAL DRIVE)</span>
                                ) : (
                                  <span>{predictedBikeRange} km</span>
                                )}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-zinc-500 block uppercase">E-Bike Battery SoC</span>
                              <span className="text-teal-400 font-bold block mt-0.5">{bikeBattery}%</span>
                            </div>
                          </div>
                        );
                      })()}

                    </div>

                    {/* Bottom Status feedback */}
                    <div className="text-[8px] font-mono text-zinc-500 border-t border-white/5 pt-2 flex justify-between items-center mt-2">
                      <span>TRIP ODO: {bikeOdo.toFixed(1)} km</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block animate-pulse" />
                        Smart e-Bike Hub Active
                      </span>
                    </div>

                  </div>
                </div>
              )}

              {currentSystem === 'led' && (
                <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-[#0c0c0e] relative z-10">
                  
                  {/* Left Side: Bezel and LED Matrix SVG */}
                  <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
                    
                    {/* Bezel frame with Carbon-Fiber vibe & inner shadow */}
                    <div className="w-full max-w-[480px] aspect-[1.18/1] md:aspect-[1.32/1] bg-zinc-950 rounded-2xl border border-zinc-800/80 shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
                      
                      {/* Sub-grid overlay for carbon-fiber feel */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(45deg,#fff_25%,transparent_25%),linear-gradient(-45deg,#fff_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#fff_75%),linear-gradient(-45deg,transparent_75%,#fff_75%)] bg-[size:10px_10px]" />
                      
                      {/* Top bezel bar */}
                      <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 pb-1.5 border-b border-white/5 select-none z-10">
                        <span>DEV_PORT: /dev/ttyUSB0</span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
                          MATRIX_READY
                        </span>
                      </div>

                      {/* The LED Matrix SVG Viewport */}
                      <div className="flex-1 flex items-center justify-center py-2 z-10">
                        <svg 
                          viewBox="0 0 362 274" 
                          className="w-full h-full max-h-[220px] filter drop-shadow-[0_0_12px_rgba(240,70,250,0.15)]"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {Array.from({ length: 12 }).map((_, y) => {
                            return Array.from({ length: 16 }).map((_, x) => {
                              const cx = 16 + x * 22;
                              const cy = 16 + y * 22;
                              const { isActive, color } = getLedState(x, y);

                              return (
                                <g key={`${x}-${y}`}>
                                  {/* 1. Base Socket */}
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r="6.5"
                                    fill="#141416"
                                    stroke="#27272a"
                                    strokeWidth="0.8"
                                  />
                                  
                                  {isActive ? (
                                    <>
                                      {/* 2. Outer Soft Bloom */}
                                      <circle
                                        cx={cx}
                                        cy={cy}
                                        r="10"
                                        fill={color}
                                        opacity={0.25 * (ledBrightness / 100)}
                                        className="transition-all duration-300"
                                      />
                                      
                                      {/* 3. Mid Bloom */}
                                      <circle
                                        cx={cx}
                                        cy={cy}
                                        r="7.5"
                                        fill={color}
                                        opacity={0.45 * (ledBrightness / 100)}
                                        className="transition-all duration-200"
                                      />
                                      
                                      {/* 4. Core Light */}
                                      <circle
                                        cx={cx}
                                        cy={cy}
                                        r="5"
                                        fill="#ffffff"
                                      />
                                      
                                      {/* 5. Saturated Core Cover */}
                                      <circle
                                        cx={cx}
                                        cy={cy}
                                        r="4"
                                        fill={color}
                                        opacity={0.9 * (ledBrightness / 100)}
                                        className="transition-all duration-200"
                                      />
                                    </>
                                  ) : (
                                    /* Inactive tiny center indicator */
                                    <circle
                                      cx={cx}
                                      cy={cy}
                                      r="1.5"
                                      fill="#27272a"
                                      opacity="0.5"
                                    />
                                  )}
                                </g>
                              );
                            });
                          })}
                        </svg>
                      </div>

                      {/* Bottom bezel status info */}
                      <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-600 border-t border-white/5 pt-1.5 select-none z-10">
                        <span>MODE: {ledMode.toUpperCase()}</span>
                        <span>GRID: 16x12 WS2812B</span>
                        <span>FPS: {Math.round(60 * (ledSpeed / 3))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Matrix Controller Panel */}
                  <div className="w-full md:w-5/12 bg-zinc-950/70 p-4 flex flex-col justify-between select-none overflow-y-auto border-t md:border-t-0 md:border-l border-white/5">
                    <div className="space-y-4">
                      
                      {/* Section Title */}
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 block">Matrix Controller</span>
                        <h4 className="text-xs font-bold text-zinc-300 mt-0.5">LED Matrix &amp; Ambient Lighting HAL</h4>
                      </div>

                      <div className="h-[1px] bg-white/10" />

                      {/* Mode Chips Selector */}
                      <div className="space-y-1.5">
                        <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 block">Operation Mode</span>
                        <div className="grid grid-cols-3 gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                          {[
                            { id: 'music', label: 'Music Sync' },
                            { id: 'env', label: 'Ambient Mood' },
                            { id: 'text', label: 'Scroll Text' }
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => setLedMode(mode.id as any)}
                              className={`py-1 rounded text-[8px] font-bold uppercase transition-all ${
                                ledMode === mode.id
                                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20'
                                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                              }`}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sub-style settings based on Mode */}
                      {ledMode === 'music' && (
                        <div className="space-y-2 animate-fadeIn">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500">Visualizer Style</span>
                            {isPlaying ? (
                              <span className="text-[7.5px] font-mono text-emerald-400 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                                SYNCED WITH IVI PLAYER
                              </span>
                            ) : (
                              <span className="text-[7.5px] font-mono text-amber-500">
                                AUDIO IDLE (PAUSED)
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: 'equalizer', label: 'Spectrum EQ' },
                              { id: 'wave', label: 'Sine Oscilloscope' },
                              { id: 'pulse', label: 'Concentric Ring' },
                              { id: 'rainbow', label: 'Rainbow Drift' }
                            ].map((style) => (
                              <button
                                key={style.id}
                                onClick={() => setLedMusicStyle(style.id as any)}
                                className={`py-1.5 px-2 rounded-lg border text-[8.5px] font-bold text-left transition-all ${
                                  ledMusicStyle === style.id
                                    ? 'bg-fuchsia-950/40 border-fuchsia-500/50 text-fuchsia-300'
                                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                                }`}
                              >
                                {style.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {ledMode === 'env' && (
                        <div className="space-y-2 animate-fadeIn">
                          <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 block">Ambient cabin preset</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: 'fire', label: 'Fire (Warm)', desc: 'Flickering thermal shader', color: 'from-orange-500 to-red-600' },
                              { id: 'ocean', label: 'Ocean (Cruise)', desc: 'Teal/blue fluid waves', color: 'from-cyan-500 to-blue-600' },
                              { id: 'forest', label: 'Forest (Eco)', desc: 'Organic drifting leaves', color: 'from-emerald-500 to-green-600' },
                              { id: 'cyberpunk', label: 'Cyberpunk (Sport)', desc: 'Electric magenta pulses', color: 'from-fuchsia-500 to-purple-600' }
                            ].map((theme) => (
                              <button
                                key={theme.id}
                                onClick={() => setLedTheme(theme.id as any)}
                                className={`p-1.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                                  ledTheme === theme.id
                                    ? 'bg-zinc-900 border-zinc-700 shadow-md ring-1 ring-zinc-700/30'
                                    : 'bg-zinc-950/40 border-white/5 hover:border-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full bg-gradient-to-tr ${theme.color} shrink-0`} />
                                  <span className={`text-[8.5px] font-bold ${ledTheme === theme.id ? 'text-zinc-200' : 'text-zinc-400'}`}>
                                    {theme.label}
                                  </span>
                                </div>
                                <span className="text-[7.5px] text-zinc-500 mt-0.5">{theme.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {ledMode === 'text' && (
                        <div className="space-y-2.5 animate-fadeIn">
                          <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 block">Message Configuration</span>
                          
                          <div className="space-y-1.5">
                            <label className="text-[7.5px] font-mono text-zinc-400">Custom Text String</label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                maxLength={32}
                                value={ledText}
                                onChange={(e) => setLedText(e.target.value)}
                                className="flex-1 bg-black/60 border border-white/5 rounded px-2 py-1 text-[10px] font-mono text-fuchsia-400 focus:outline-none focus:border-fuchsia-500/50"
                                placeholder="Enter message..."
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[7.5px] font-mono text-zinc-400 block">LED Text Color</label>
                            <div className="flex items-center gap-2 bg-black/30 p-1 rounded-lg border border-white/5 max-w-max">
                              {[
                                { id: '#d946ef', name: 'Fuchsia' },
                                { id: '#06b6d4', name: 'Cyan' },
                                { id: '#f59e0b', name: 'Amber' },
                                { id: '#10b981', name: 'Emerald' },
                                { id: '#ef4444', name: 'Crimson' }
                              ].map((col) => (
                                <button
                                  key={col.id}
                                  onClick={() => setLedTextColor(col.id)}
                                  className={`w-4.5 h-4.5 rounded-full transition-all flex items-center justify-center ${
                                    ledTextColor === col.id
                                      ? 'scale-110 ring-2 ring-white shadow-md'
                                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: col.id }}
                                  title={col.name}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Global Configurations (Brightness and Speed) */}
                      <div className="h-[1px] bg-white/5 my-1" />

                      <div className="space-y-3 bg-black/25 p-2.5 rounded-xl border border-white/5">
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[8.5px] font-mono">
                            <span className="text-zinc-500 uppercase">Refresh Clock Frequency</span>
                            <span className="font-bold text-fuchsia-400">{ledSpeed}x Speed</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={ledSpeed}
                            onChange={(e) => setLedSpeed(parseInt(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-fuchsia-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[8.5px] font-mono">
                            <span className="text-zinc-500 uppercase">LED Luminance Intensity</span>
                            <span className="font-bold text-fuchsia-400">{ledBrightness}%</span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            value={ledBrightness}
                            onChange={(e) => setLedBrightness(parseInt(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-fuchsia-500"
                          />
                        </div>

                      </div>

                    </div>

                    {/* Footer diagnostics feedback */}
                    <div className="text-[8px] font-mono text-zinc-500 border-t border-white/5 pt-2 flex justify-between items-center mt-2.5">
                      <span>POWER DRAW: {Math.round(0.04 * ledBrightness * (ledMode === 'music' && ledMusicStyle === 'rainbow' ? 1.0 : ledMode === 'text' ? 0.3 : 0.65))} W</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 inline-block animate-pulse" />
                        PWM Driver Active
                      </span>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* ───── BOTTOM CLIMATE CONTROL BAR (linked state) ───── */}
            <footer className="h-12 border-t border-white/5 bg-zinc-950 px-6 flex items-center justify-between text-xs z-20 shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="text-zinc-500 font-mono">TEMP</span>
                  <span className="font-bold text-zinc-200">{cabinTemp.toFixed(1)}°C</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="text-zinc-500 font-mono">FAN</span>
                  <span className="font-bold text-zinc-200">AUTO</span>
                </div>
              </div>

              {/* Climate screen simulated buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCabinTemp((t) => t + 0.5)}
                  className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-300 hover:text-white border border-white/5 active:scale-95 transition-all text-[10px]"
                >
                  TEMP +
                </button>
                <button
                  onClick={() => setCabinTemp((t) => t - 0.5)}
                  className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-300 hover:text-white border border-white/5 active:scale-95 transition-all text-[10px]"
                >
                  TEMP -
                </button>
              </div>

              <div className="flex items-center gap-4 text-zinc-500">
                <span>USER: ADMIN</span>
                <div className="w-5 h-5 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-[9px] font-bold text-white uppercase select-none">
                  A
                </div>
              </div>
            </footer>

          </div>
        )}
      </div>
      
      {/* Decorative prompt note explaining the widget */}
      <p className="text-center text-xs text-text-muted mt-4 max-w-lg mx-auto">
        💡 <strong>Interactive Cockpit Console:</strong> Switch between the 7 tabs above to control IVI, Voice AI, ADAS safety thresholds, EV powertrain telemetry, ECU diagnostics, Cabin DMS/OMS eye-tracking/seat and in-cabin monitoring, OTA updates, and CAN bus fault injection — all running inside a Next.js component.</p>
    </div>
  );
}
