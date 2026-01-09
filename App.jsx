import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  User, Shield, Trophy, Flame, Skull, Plus, Utensils, Search, Loader2, AlertCircle, Clock, Zap, Star, 
  ShoppingBag, Bell, CheckCircle, Moon, Sun, Smartphone, ChevronRight, LogOut, Scale, Activity, ArrowRight, 
  Camera, Save, Edit2, Lock, Tag, Image as ImageIcon, X, Coins, Swords, Users, Crown, Database, Dumbbell, 
  MapPin, Info, Settings, Timer, Play, Square, Calendar, FileText, Mail, Download, Send, TrendingUp, History, 
  ArrowDown, ArrowUp, Shirt, QrCode, FileCheck, Award, ExternalLink, AlertTriangle, Briefcase, BarChart3, 
  UserCheck, UserX, MessageSquare, ChevronUp, CreditCard, BellRing, Volume2, Edit3, Bot, Sparkles, BrainCircuit
} from 'lucide-react';

// --- Firebase Init ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Shared Components ---
const ProgressBar = ({ current, max, color = "bg-blue-500", height = "h-2" }) => {
  const percent = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  return (
    <div className={`w-full bg-gray-800 ${height} rounded-full overflow-hidden mt-1 border border-gray-700`}>
      <div 
        className={`h-full ${color} transition-all duration-700 relative`}
        style={{ width: `${percent}%` }}
      >
          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
      </div>
    </div>
  );
};

// --- Mock Data ---
const MOCK_CLIENT_DB = [
  { id: '101', name: 'Sung Jin-Woo', rank: 'S-Rank', status: 'Active', risk: 'Low', lastActive: '2m ago', plan: 'Annual', compliance: 98 },
  { id: '102', name: 'Cha Hae-In', rank: 'S-Rank', status: 'Active', risk: 'Low', lastActive: '1h ago', plan: 'Annual', compliance: 95 },
  { id: '103', name: 'Lee Joohee', rank: 'B-Rank', status: 'At Risk', risk: 'High', lastActive: '5d ago', plan: 'Monthly', compliance: 40 },
  { id: '104', name: 'Yoo Jinho', rank: 'A-Rank', status: 'Active', risk: 'Medium', lastActive: '12h ago', plan: 'Protocol 90', compliance: 82 },
  { id: '105', name: 'Go Gun-Hee', rank: 'S-Rank', status: 'Inactive', risk: 'Critical', lastActive: '14d ago', plan: 'Lifetime', compliance: 0 },
];

const FEED_DATA = [
  { id: 1, user: 'Cha Hae-In', action: 'Cleared Iron Dungeon', detail: 'Volume: 12,000kg', time: '10m ago' },
  { id: 2, user: 'Thomas Andre', action: 'Completed Time Attack', detail: '-2.5kg Deviation', time: '1h ago' },
  { id: 3, user: 'Yoo Jinho', action: 'Acquired Gear', detail: 'Leviathan Belt', time: '3h ago' },
];

const DEFAULT_WORKOUT_DATA = {
  PUSH: [
    { name: "Bench Press", sets: [12, 10, 8], cue: "Retract scapula, feet flat" },
    { name: "Overhead Press", sets: [12, 10, 8], cue: "Core tight, don't arch back" },
    { name: "Incline Dumbbell Press", sets: [12, 10, 8], cue: "Control the negative" },
    { name: "Lateral Raises", sets: [15, 12, 10], cue: "Lead with elbows" },
    { name: "Tricep Pushdowns", sets: [12, 10, 8], cue: "Keep elbows pinned to sides" },
    { name: "Pushups", sets: [20, 15, 10], cue: "Chest to floor" },
  ],
  PULL: [
    { name: "Deadlift", sets: [8, 6, 4], cue: "Keep back neutral, drive with legs" },
    { name: "Lat Pulldowns", sets: [12, 10, 8], cue: "Pull towards upper chest" },
    { name: "Barbell Rows", sets: [12, 10, 8], cue: "Hinge at hips, flat back" },
    { name: "Face Pulls", sets: [15, 12, 10], cue: "Pull to forehead, squeeze rear delts" },
    { name: "Pullups", sets: [10, 8, 6], cue: "Chin over bar" },
  ],
  LEGS: [
    { name: "Barbell Squats", sets: [12, 10, 8], cue: "Knees out, chest up" },
    { name: "Leg Press", sets: [12, 10, 8], cue: "Don't lock knees at top" },
    { name: "Romanian Deadlifts", sets: [12, 10, 8], cue: "Push hips back, feel hamstring stretch" },
    { name: "Walking Lunges", sets: [12, 10, 8], cue: "Knee shouldn't pass toe excessively" },
    { name: "Calf Raises", sets: [20, 15, 12], cue: "Full range of motion" },
  ]
};

const App = () => {
  const apiKey = ""; 
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'real-life-leveling-v6';

  // --- State Definitions ---
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [acceptedLiability, setAcceptedLiability] = useState(false);
  
  // Expanded Profile
  const [userProfile, setUserProfile] = useState({
    name: "", age: "", sex: "Male", height: "", currentWeight: "", startWeight: "", targetWeight: "", activityLevel: "Sedentary", dietType: "Balanced", medicalConditions: ""
  });

  const [activeTab, setActiveTab] = useState('diet'); 
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [maxXp, setMaxXp] = useState(100);
  const [gold, setGold] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loginStreak] = useState(7);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isHealthLinked, setIsHealthLinked] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [deadlineStartDate, setDeadlineStartDate] = useState(null);
  const [showProtocolReport, setShowProtocolReport] = useState(false);

  const [isPremium, setIsPremium] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const [isConfiguringWorkout, setIsConfiguringWorkout] = useState(false);
  const [showGoldLocker, setShowGoldLocker] = useState(false);
  const [showTimeAttackModal, setShowTimeAttackModal] = useState(false);
  const [showGatePass, setShowGatePass] = useState(false);
  const [configType, setConfigType] = useState('PUSH');
  const [selectedClient, setSelectedClient] = useState(null);

  const [workoutData, setWorkoutData] = useState(DEFAULT_WORKOUT_DATA);
  const [activeCardio, setActiveCardio] = useState(null);
  const [cardioDistance, setCardioDistance] = useState("");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [progressPhotos, setProgressPhotos] = useState([{ id: 1, date: 'Oct 12', label: 'Initial Scan' }]);

  const [meals, setMeals] = useState([]);
  const [foodInput, setFoodInput] = useState("");
  const [qtyInput, setQtyInput] = useState("100");
  const [unitInput, setUnitInput] = useState("grams");
  const [isSearching, setIsSearching] = useState(false);
  const [dietError, setDietError] = useState(null);
  const [dataSources, setDataSources] = useState({});

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [emailStatus, setEmailStatus] = useState('idle');
  const [dailyRank, setDailyRank] = useState(null);
  const [systemMessage, setSystemMessage] = useState(null);

  const [activeDungeon, setActiveDungeon] = useState(null);
  
  // --- New AI Feature States ---
  const [showOracle, setShowOracle] = useState(false);
  const [oracleMessages, setOracleMessages] = useState([{ role: 'system', text: "System Interface Initialized. Awaiting query." }]);
  const [oracleInput, setOracleInput] = useState("");
  const [isOracleThinking, setIsOracleThinking] = useState(false);
  const chatEndRef = useRef(null);

  const [isGeneratingDungeon, setIsGeneratingDungeon] = useState(false);
  const [customDungeonPrompt, setCustomDungeonPrompt] = useState("");
  const [showDungeonArchitect, setShowDungeonArchitect] = useState(false);

  // --- Notification & Editing State ---
  const [baseReminders, setBaseReminders] = useState([
    { id: 1, type: 'wake', time: '06:00', label: 'Wake Up / Cold Shower', active: true, iconType: 'sun', lastCompleted: null },
    { id: 2, type: 'workout', time: '07:30', label: 'Hypertrophy Training', active: true, iconType: 'flame', lastCompleted: null },
    { id: 3, type: 'meal', time: '13:00', label: 'Protein-Heavy Lunch', active: true, iconType: 'utensils', lastCompleted: null },
    { id: 4, type: 'sleep', time: '22:00', label: 'Sleep / Blackout Room', active: true, iconType: 'moon', lastCompleted: null },
  ]);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [editForm, setEditForm] = useState({ time: '', label: '' });
  const [activeAlarm, setActiveAlarm] = useState(null);

  const [shopItems] = useState([
    { id: 5, name: "Elixir of Time", price: 500, discount: 0, image: "potion", type: 'gold', desc: "Streak Freeze" },
    { id: 1, name: "Leviathan Belt", price: 120000, discount: 20, image: "belt", type: 'gold', desc: "S-Rank Support" },
    { id: 6, name: "Compression Shirt", price: 50000, discount: 15, image: "shirt", type: 'gold', desc: "Moisture-wicking" },
    { id: 7, name: "Shadow Joggers", price: 75000, discount: 10, image: "pants", type: 'gold', desc: "High mobility" },
    { id: 2, name: "Monarch's Creatine", price: 2500, discount: 15, image: "powder", type: 'gold', desc: "Raw energy" },
    { id: 4, name: "System Pre-Workout", price: 35.00, discount: 25, image: "shaker", type: 'real', desc: "Real-world boost" },
  ]);

  // --- Logic ---
  const timeAttackStats = useMemo(() => {
    if (!deadline || !isPremium) {
      return { expectedWeight: 0, currentWeight: 0, diff: 0, status: 'ON_TRACK', calorieAdjustment: 0, daysLeft: 0, isCritical: false, deviationPct: 0 };
    }
    
    const currentW = parseFloat(userProfile.currentWeight) || 75;
    const startW = parseFloat(userProfile.startWeight) || currentW;
    
    const start = new Date(deadlineStartDate || Date.now());
    const end = new Date(deadline);
    const now = new Date();
    
    if (now > end && !showProtocolReport) return { expired: true };

    const totalDuration = Math.max(end - start, 1);
    const elapsed = now - start;
    const progressRatio = totalDuration > 0 ? Math.min(Math.max(elapsed / totalDuration, 0), 1) : 0;

    const targetW = parseFloat(userProfile.targetWeight) || currentW - 5;
    const totalGoalDiff = Math.abs(startW - targetW) || 1;

    const expectedWeight = startW + (targetW - startW) * progressRatio;
    const weightDiff = currentW - expectedWeight;
    const isCutting = startW > targetW;
    
    const deviation = Math.abs(weightDiff) / totalGoalDiff;
    const isCritical = deviation > 0.15;

    let status = 'ON_TRACK';
    let calorieAdjustment = 0;

    if (isCutting) {
        if (weightDiff > 0.5) { status = 'BEHIND'; calorieAdjustment = -300; } 
        else if (weightDiff < -0.5) { status = 'AHEAD'; calorieAdjustment = 250; } 
    } else {
        if (weightDiff < -0.5) { status = 'BEHIND'; calorieAdjustment = 350; } 
        else if (weightDiff > 0.5) { status = 'AHEAD'; calorieAdjustment = -300; } 
    }

    if (isCritical) calorieAdjustment *= 1.5;

    return {
        expectedWeight: expectedWeight.toFixed(1),
        currentWeight: currentW,
        finalTarget: targetW,
        totalProgress: (totalGoalDiff > 0 ? (Math.abs(startW - currentW) / totalGoalDiff) * 100 : 0).toFixed(1),
        diff: weightDiff.toFixed(1),
        status,
        calorieAdjustment,
        daysLeft: Math.ceil((end - now) / (1000 * 60 * 60 * 24)),
        isCritical,
        deviationPct: (deviation * 100).toFixed(0)
    };
  }, [deadline, isPremium, userProfile, deadlineStartDate, showProtocolReport]);

  const themeColor = useMemo(() => {
      if (timeAttackStats?.isCritical) return 'red';
      return 'blue';
  }, [timeAttackStats]);

  const reminders = useMemo(() => {
    return baseReminders.map(rem => {
        let label = rem.label;
        if (themeColor === 'red') {
            if (rem.type === 'wake') label = "MANDATORY AWAKENING";
            if (rem.type === 'workout') label = "SURVIVAL PROTOCOL";
            if (rem.type === 'sleep') label = "FORCED RECOVERY";
        }
        return { ...rem, label };
    });
  }, [baseReminders, themeColor]);

  // --- Quests ---
  const [quests, setQuests] = useState([]);

  useEffect(() => {
    const dayMod = loginStreak % 3;
    const workoutType = dayMod === 1 ? 'Push' : dayMod === 2 ? 'Pull' : 'Legs';
    const progressionBonus = Math.floor(loginStreak / 3) * 5;
    
    let multiplier = 1.0;
    if (timeAttackStats && timeAttackStats.daysLeft > 0) {
        multiplier = 1.2; 
        if (timeAttackStats.isCritical && timeAttackStats.status === 'BEHIND') multiplier = 1.35; 
    }

    const newQuests = [
      { id: 1, title: `Iron Dungeon: ${workoutType}`, type: workoutType.toUpperCase(), goal: Math.ceil(30 * multiplier), current: 0, rewardXp: Math.ceil(150 * multiplier), rewardGold: Math.ceil(300 * multiplier), completed: false, unit: 'sets', isHardMode: multiplier > 1 },
      { id: 2, title: 'Speed Dungeon: Cardio', goal: Math.ceil(30 * multiplier), current: 0, rewardXp: Math.ceil(30 * multiplier), rewardGold: Math.ceil(50 * multiplier), completed: false, unit: 'min', isHardMode: multiplier > 1 },
      { id: 3, title: 'Daily Step Goal', goal: Math.ceil(10000 * multiplier), current: 0, rewardXp: 40, rewardGold: 80, completed: false, unit: 'steps', isHardMode: multiplier > 1 },
      { id: 4, title: 'Strength Key: Pushups', goal: Math.ceil((30 + progressionBonus) * multiplier), current: 0, rewardXp: 20, rewardGold: 25, completed: false, unit: 'reps', isHardMode: multiplier > 1 },
      { id: 5, title: 'Core Key: Situps', goal: Math.ceil((30 + progressionBonus) * multiplier), current: 0, rewardXp: 20, rewardGold: 25, completed: false, unit: 'reps', isHardMode: multiplier > 1 },
      { id: 6, title: 'Back Key: Pullups', goal: Math.ceil((5 + progressionBonus) * multiplier), current: 0, rewardXp: 25, rewardGold: 35, completed: false, unit: 'reps', isHardMode: multiplier > 1 },
    ];
    
    setQuests(prev => {
        if (prev.length === 0) return newQuests;
        return newQuests.map(nq => {
            const existing = prev.find(p => p.id === nq.id);
            return existing ? { ...nq, current: existing.current, completed: existing.completed } : nq;
        })
    });
  }, [loginStreak, timeAttackStats]);

  const minWorkoutMinutes = useMemo(() => {
    const dungeon = quests.find(q => q.id === 1);
    const cardio = quests.find(q => q.id === 2);
    if (!dungeon || !cardio) return 90; 
    return Math.ceil((dungeon.goal * 2.5) + cardio.goal);
  }, [quests]);

  // --- Effects ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Alarm Clock Sync Effect with 5-Min Penalty Check
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      const today = now.toLocaleDateString();

      baseReminders.forEach(rem => {
        if (!rem.active) return;
        
        // 1. Normal Alarm
        if (rem.time === currentTime && !activeAlarm) {
           triggerAlarm(rem);
        }

        // 2. Penalty Check (5 minutes late + not completed today)
        const [h, m] = rem.time.split(':').map(Number);
        const alarmTime = new Date();
        alarmTime.setHours(h);
        alarmTime.setMinutes(m + 5);
        const lateTime = `${alarmTime.getHours().toString().padStart(2, '0')}:${alarmTime.getMinutes().toString().padStart(2, '0')}`;
        
        // If time is 5 mins later AND task not marked done today
        if (lateTime === currentTime && rem.lastCompleted !== today && !activeAlarm) {
             triggerAlarm({ 
                 ...rem, 
                 label: `PENALTY WARNING: ${rem.label}`, 
                 isPenalty: true 
             });
        }
      });
    }, 1000 * 60);

    return () => clearInterval(clockInterval);
  }, [baseReminders, activeAlarm]);

  useEffect(() => {
    let interval;
    if (activeCardio) {
      interval = setInterval(() => {
        setActiveCardio(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCardio]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [oracleMessages]);

  // --- Actions ---
  const handleLogin = (adminMode) => {
    setIsLoggedIn(true);
    if (adminMode) {
        setIsAdmin(true);
        setShowOnboarding(false);
    } else {
        setIsAdmin(false);
        setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    if (!userProfile.name || !userProfile.age || !userProfile.currentWeight) return;
    setShowOnboarding(false);
    setUserProfile(prev => ({ ...prev, startWeight: prev.currentWeight }));
  };

  const acceptLiability = () => setAcceptedLiability(true);

  // --- Alarm & Notification Logic ---
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("System notifications not supported on this device.");
    } else if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("System Connected", { body: "Neural Link Established. Protocols active.", icon: "/icon.png" });
      }
    }
  };

  const triggerAlarm = (reminder) => {
     setActiveAlarm(reminder);
     if (Notification.permission === "granted") {
        new Notification(reminder.isPenalty ? `SYSTEM PENALTY` : `SYSTEM ALERT: ${reminder.label}`, { 
            body: reminder.isPenalty ? "Task failed. Update immediately to avoid punishment." : "Compliance Required Immediately.", 
            icon: "/icon.png" 
        });
     }
  };

  const dismissAlarm = () => {
      setActiveAlarm(null);
  };

  // --- Edit & Complete Reminder Actions ---
  const startEditingReminder = (rem) => {
      setEditingReminderId(rem.id);
      setEditForm({ time: rem.time, label: rem.label });
  };

  const saveReminderEdit = () => {
      setBaseReminders(prev => prev.map(r => r.id === editingReminderId ? { ...r, time: editForm.time, label: editForm.label } : r));
      setEditingReminderId(null);
  };

  // New: Toggle Completion for today
  const toggleReminderCompletion = (id) => {
      const today = new Date().toLocaleDateString();
      setBaseReminders(prev => prev.map(r => {
          if (r.id === id) {
              // Toggle: if date matches today, clear it (uncheck), else set to today
              return { ...r, lastCompleted: r.lastCompleted === today ? null : today };
          }
          return r;
      }));
  };

  const addReminder = () => {
    if (baseReminders.length >= 14) return;
    const newRem = { id: Date.now(), type: 'custom', time: '12:00', label: 'New Protocol Task', active: true, iconType: 'bell', lastCompleted: null };
    setBaseReminders([...baseReminders, newRem]);
  };

  const addTransaction = (amount, description) => {
    const newTransaction = {
      id: Date.now(),
      type: amount >= 0 ? 'EARN' : 'SPEND',
      amount: Math.abs(amount),
      description,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setGold(prev => prev + amount);
  };

  const syncHealthData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsHealthLinked(true);
      setQuests(prev => prev.map(q => { if (q.id === 3) return { ...q, current: 10432, completed: true }; return q; }));
      setXp(prev => prev + 50);
      addTransaction(100, "Health Sync Bonus");
    }, 2000);
  };

  const addProgressPhoto = () => {
    setProgressPhotos(prev => [{ id: Date.now(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), label: 'Update Scan' }, ...prev]);
    setXp(prev => prev + 15);
  };

  const handleSetDeadline = (date) => {
    setDeadline(date);
    if (!deadlineStartDate) setDeadlineStartDate(Date.now());
  };

  const handleUpdateExercise = (type, index, field, value) => {
    const newWorkoutData = { ...workoutData };
    if (field === 'sets') {
      const setsArr = value.split(',').map(n => parseInt(n.trim()) || 0);
      newWorkoutData[type][index].sets = setsArr;
    }
    setWorkoutData(newWorkoutData);
  };

  const saveWorkoutConfig = () => {
    setIsConfiguringWorkout(false);
  };

  const startCardio = () => { setActiveCardio({ startTime: Date.now(), duration: 0 }); };
  const stopCardio = () => { 
      if (!activeCardio || !cardioDistance) return;
      setQuests(prev => prev.map(q => {
        if (q.id === 2) {
          if (!q.completed) { setXp(c => c + q.rewardXp); addTransaction(q.rewardGold, "Speed Dungeon Clear"); }
          return { ...q, current: q.goal, completed: true };
        }
        return q;
      }));
      setActiveCardio(null); setCardioDistance("");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuestProgress = (id) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;
    if (id === 1) { 
        setCheckingLocation(true); 
        setTimeout(() => { 
            setCheckingLocation(false); 
            const dungeonType = quest.type; 
            const exercises = workoutData[dungeonType].map(ex => ({ ...ex, completedSets: ex.sets.map(() => false), weights: ex.sets.map(() => 10) }));
            setActiveDungeon({ type: dungeonType, exercises: exercises }); 
        }, 1500); 
        return; 
    }
    if (id === 2 && !activeCardio) { startCardio(); return; }
    if (id >= 4) { setQuests(prev => prev.map(q => { if (q.id === id) { const newCurrent = Math.min(q.current + 5, q.goal); const isFinished = newCurrent >= q.goal; if (isFinished && !q.completed) { setXp(c => c + q.rewardXp); addTransaction(q.rewardGold, `Quest Clear`); } return { ...q, current: newCurrent, completed: isFinished }; } return q; })); }
  };

  const finishDungeon = () => {
      setActiveDungeon(null);
      setQuests(prev => prev.map(q => {
          if (q.id === 1) {
              if (!q.completed) { setXp(c => c + q.rewardXp); addTransaction(q.rewardGold, "Iron Dungeon Clear"); }
              return { ...q, current: q.goal, completed: true };
          }
          return q;
      }));
  };

  const toggleSet = (exIndex, setIndex) => {
    if (!activeDungeon) return;
    const newExercises = activeDungeon.exercises.map((ex, i) => {
      if (i === exIndex) {
        const newCompleted = [...ex.completedSets];
        newCompleted[setIndex] = !newCompleted[setIndex];
        return { ...ex, completedSets: newCompleted };
      }
      return ex;
    });
    setActiveDungeon({ ...activeDungeon, exercises: newExercises });
  };

  const updateSetWeight = (exIndex, setIndex, newWeight) => {
    if (!activeDungeon) return;
    const newExercises = activeDungeon.exercises.map((ex, i) => {
      if (i === exIndex) {
        const newWeights = [...ex.weights];
        newWeights[setIndex] = parseInt(newWeight) || 0;
        return { ...ex, weights: newWeights };
      }
      return ex;
    });
    setActiveDungeon({ ...activeDungeon, exercises: newExercises });
  };

  const normalizeId = (str) => str.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const fetchNutritionalInfo = async () => {
    if (!foodInput) return;
    setIsSearching(true);
    setTimeout(() => {
        setMeals(prev => [{ id: Date.now(), name: `100g ${foodInput}`, calories: 250, protein: 25, carbs: 10, fats: 8, timestamp: 'Now', source: 'DB' }, ...prev]);
        setFoodInput("");
        setIsSearching(false);
        addTransaction(10, "Diet Log");
    }, 1000);
  };

  const getReminderIcon = (type) => {
      if (type === 'wake' || type === 'sun') return <Sun size={14} />;
      if (type === 'workout' || type === 'flame') return <Flame size={14} />;
      if (type === 'meal' || type === 'utensils') return <Utensils size={14} />;
      if (type === 'sleep' || type === 'moon') return <Moon size={14} />;
      return <Bell size={14} />;
  };

  const dietBreakdown = useMemo(() => {
    return meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fats: acc.fats + m.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [meals]);

  const targetCalories = useMemo(() => {
    const weight = parseFloat(userProfile.currentWeight) || 75;
    const height = parseFloat(userProfile.height) || 175;
    const age = parseFloat(userProfile.age) || 25;
    const isMale = userProfile.sex === 'Male';
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += isMale ? 5 : -161;
    const activityMap = { "Sedentary": 1.2, "Moderate": 1.55, "Athletic": 1.9 };
    const activityMult = activityMap[userProfile.activityLevel] || 1.2;
    let tdee = Math.round(bmr * activityMult);
    if (timeAttackStats && timeAttackStats.daysLeft > 0) tdee += timeAttackStats.calorieAdjustment;
    else if (userProfile.targetWeight) {
        if (parseFloat(userProfile.targetWeight) < weight) tdee -= 500;
        else if (parseFloat(userProfile.targetWeight) > weight) tdee += 300;
    }
    const minCalories = isMale ? 1500 : 1200;
    return Math.max(tdee, minCalories);
  }, [userProfile, timeAttackStats]);

  // --- AI Feature Handlers ---

  const handleOracleSend = async () => {
    if (!oracleInput.trim()) return;
    const newMessage = { role: 'user', text: oracleInput };
    setOracleMessages(prev => [...prev, newMessage]);
    setOracleInput("");
    setIsOracleThinking(true);

    try {
      // Prompt construction
      const systemPrompt = "You are 'The System' from Solo Leveling. A stoic, authoritative, and helpful AI interface for a fitness app. Your purpose is to guide the 'Hunter' (user) to physical perfection. Keep responses concise, gamified, and motivational. Use terms like 'Hunter', 'Quest', 'Stats', 'Protocol'. Do not break character.";
      const historyText = oracleMessages.map(m => `${m.role}: ${m.text}`).join('\n') + `\nuser: ${oracleInput}\nsystem:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: historyText }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "text/plain" }
        })
      });

      if (!response.ok) throw new Error("System Link Failed");
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "System Offline.";
      
      setOracleMessages(prev => [...prev, { role: 'system', text: text }]);
    } catch (error) {
      setOracleMessages(prev => [...prev, { role: 'system', text: "Connection to The System interrupted." }]);
    } finally {
      setIsOracleThinking(false);
    }
  };

  const handleGenerateDungeon = async () => {
    if (!customDungeonPrompt.trim()) return;
    setIsGeneratingDungeon(true);

    try {
      const systemPrompt = "You are the Dungeon Architect. Generate a fitness workout based on the user's request. Return ONLY a JSON object with a single key 'exercises' which is an array of objects. Each object must have: 'name' (string), 'sets' (array of 3 numbers representing reps, e.g. [12, 10, 8]), and 'cue' (short string for form). Create 3-5 exercises.";
      const userQuery = `Create a workout for: ${customDungeonPrompt}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error("Architect Error");
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      const data = JSON.parse(text);

      if (data.exercises) {
         const exercises = data.exercises.map(ex => ({
             ...ex,
             completedSets: [false, false, false],
             weights: [10, 10, 10]
         }));
         
         setActiveDungeon({
             type: 'SECRET',
             exercises: exercises,
             startTime: Date.now()
         });
         setShowDungeonArchitect(false);
         setCustomDungeonPrompt("");
      }

    } catch (error) {
       alert("Failed to generate dungeon. The Architect is silent.");
    } finally {
       setIsGeneratingDungeon(false);
    }
  };

  // --- Renders ---
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
        <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(37,99,235,0.6)] animate-pulse">
          <Shield size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">The System</h1>
        <div className="w-full max-w-xs space-y-3">
          <button onClick={() => handleLogin(false)} className="w-full py-4 px-6 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 active:scale-95"><Smartphone size={18} /> Hunter Login</button>
          <div className="h-4"></div>
          <button onClick={() => handleLogin(true)} className="w-full py-3 px-6 bg-slate-900 border border-slate-700 text-slate-400 rounded-2xl font-bold text-[10px] uppercase flex items-center justify-center gap-2 hover:text-white"><Briefcase size={14} /> Guild Master Console</button>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col z-[200]">
            <header className="p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur flex justify-between items-center">
                <div><h1 className="text-xl font-black uppercase italic text-amber-500">Guild Master</h1><p className="text-[10px] text-slate-400 font-bold uppercase">Anytime Fitness: Node 1</p></div>
                <button onClick={() => { setIsLoggedIn(false); setIsAdmin(false); }}><LogOut size={20} className="text-slate-500"/></button>
            </header>
            <main className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl"><div className="flex items-center gap-2 mb-2"><Users size={16} className="text-blue-400"/><span className="text-[10px] font-bold uppercase text-slate-500">Hunters</span></div><div className="text-2xl font-black">1,402</div></div>
                    <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl"><div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-red-500"/><span className="text-[10px] font-bold uppercase text-slate-500">Risk</span></div><div className="text-2xl font-black text-red-500">12</div></div>
                </div>
                <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-[10px]">
                        <thead className="bg-white/5 text-slate-400 font-bold uppercase"><tr><th className="p-3">Name</th><th className="p-3">Rank</th><th className="p-3">Status</th></tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_CLIENT_DB.map(client => (
                                <tr key={client.id} className="hover:bg-white/5"><td className="p-3 font-bold">{client.name}</td><td className="p-3 text-blue-400">{client.rank}</td><td className="p-3">{client.status}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
  }

  if (showOnboarding) return (
      <div className="min-h-screen bg-slate-950 p-6 text-slate-100 font-sans flex flex-col">
          <div className="flex-1 max-w-md mx-auto w-full space-y-6">
            <div className="pt-10"><h2 className="text-2xl font-black uppercase italic italic">Status Report</h2><p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">Initial Data Synchronization</p></div>
            <div className="space-y-4 bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Hunter Name</label><input className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm outline-none" value={userProfile.name} onChange={e => setUserProfile({...userProfile, name: e.target.value})}/></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Age</label><input type="number" inputMode="numeric" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm outline-none" value={userProfile.age} onChange={e => setUserProfile({...userProfile, age: e.target.value})}/></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Height (cm)</label><input type="number" inputMode="decimal" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm outline-none" value={userProfile.height} onChange={e => setUserProfile({...userProfile, height: e.target.value})}/></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Current Weight</label><input type="number" inputMode="decimal" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm outline-none" value={userProfile.currentWeight} onChange={e => setUserProfile({...userProfile, currentWeight: e.target.value})}/></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Target Weight</label><input type="number" inputMode="decimal" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm outline-none" value={userProfile.targetWeight} onChange={e => setUserProfile({...userProfile, targetWeight: e.target.value})}/></div>
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Diet Type</label><select className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm outline-none" onChange={e => setUserProfile({...userProfile, dietType: e.target.value})}><option>Balanced</option><option>Vegetarian</option><option>Keto</option><option>Vegan</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Medical Conditions</label><input className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm outline-none" placeholder="None" value={userProfile.medicalConditions} onChange={e => setUserProfile({...userProfile, medicalConditions: e.target.value})}/></div>
            </div>
            <button onClick={handleOnboardingComplete} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50" disabled={!userProfile.name || !userProfile.age}>Awaken Player</button>
          </div>
      </div>
  );

  // Active Dungeon Overlay (z-100 to cover nav)
  if (activeDungeon) return <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col p-4 animate-in fade-in zoom-in duration-300 fixed inset-0 z-[100]"><header className="flex justify-between items-center mb-6 pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center justify-center"><Skull size={20} className="text-red-500" /></div><div><h1 className="text-lg font-black uppercase italic text-red-500 tracking-wider">Instance Dungeon</h1><p className="text-[10px] text-red-400/60 font-bold uppercase tracking-widest">{activeDungeon.type} Protocol</p></div></div><button onClick={() => setActiveDungeon(null)} className="p-2 bg-slate-900 rounded-lg text-slate-500 hover:text-white"><X size={20}/></button></header><div className="flex-1 overflow-y-auto space-y-4 pb-24">{activeDungeon.exercises.map((ex, exIdx) => (<div key={exIdx} className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl"><div className="mb-3"><div className="flex justify-between items-start"><h3 className="text-sm font-black uppercase text-slate-200">{ex.name}</h3><Dumbbell size={16} className="text-slate-600" /></div><div className="flex items-center gap-1.5 mt-1"><Info size={10} className="text-blue-400" /><p className="text-[9px] text-blue-400 font-bold uppercase tracking-wide">{ex.cue}</p></div></div><div className="space-y-2">{ex.sets.map((reps, setIdx) => {const isCompleted = ex.completedSets[setIdx];return (<div key={setIdx} className="flex items-center gap-2"><div className="w-8 text-center text-[10px] font-black text-slate-500">#{setIdx + 1}</div><div className="w-16 py-2 bg-slate-950 rounded-lg border border-white/10 text-center"><span className="text-xs font-bold">{reps} Reps</span></div><div className="flex-1"><select value={ex.weights[setIdx]} onChange={(e) => updateSetWeight(exIdx, setIdx, e.target.value)} className="w-full bg-slate-950 text-blue-400 text-xs font-black border border-white/10 rounded-lg px-2 py-2 outline-none focus:border-blue-500 appearance-none text-center">{Array.from({length: 41}, (_, i) => i * 5).map(w => (<option key={w} value={w}>{w} kg</option>))}</select></div><button onClick={() => toggleSet(exIdx, setIdx)} className={`w-10 h-9 rounded-lg flex items-center justify-center transition-all ${isCompleted ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-600 hover:bg-slate-700'}`}>{isCompleted ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600" />}</button></div>)})}</div></div>))}</div><div className="fixed bottom-6 left-0 right-0 px-4"><button onClick={finishDungeon} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-95">Complete Dungeon</button></div></div>;
  
  // --- Modals ---
  // System Oracle (Chat)
  if (showOracle) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-in fade-in slide-in-from-bottom-10">
        <header className="p-4 border-b border-white/10 bg-slate-900/90 flex justify-between items-center">
           <div className="flex items-center gap-2"><Bot size={20} className="text-blue-400" /><h2 className="text-sm font-black uppercase text-blue-400 tracking-widest">System Oracle</h2></div>
           <button onClick={() => setShowOracle(false)}><X size={20} className="text-slate-500" /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {oracleMessages.map((msg, i) => (
             <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'}`}>
                   {msg.text}
                </div>
             </div>
           ))}
           {isOracleThinking && <div className="flex justify-start"><div className="bg-white/10 p-3 rounded-2xl rounded-tl-none"><Loader2 size={16} className="animate-spin text-blue-400"/></div></div>}
           <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-white/10 bg-slate-900 pb-8">
           <div className="relative">
              <input 
                value={oracleInput}
                onChange={(e) => setOracleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOracleSend()}
                placeholder="Ask the System..."
                className="w-full bg-slate-950 border border-white/20 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-blue-500 outline-none"
              />
              <button 
                onClick={handleOracleSend}
                disabled={!oracleInput.trim() || isOracleThinking}
                className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50"
              >
                 <Send size={16} />
              </button>
           </div>
        </div>
      </div>
    );
  }

  // Dungeon Architect Modal
  if (showDungeonArchitect) {
     return (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col p-6 animate-in fade-in zoom-in">
           <header className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2"><BrainCircuit size={20} className="text-purple-400" /><h2 className="text-lg font-black uppercase italic text-purple-400">Dungeon Architect</h2></div>
              <button onClick={() => setShowDungeonArchitect(false)}><X size={20} className="text-slate-500"/></button>
           </header>
           <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="text-center space-y-2">
                 <Sparkles size={48} className="text-purple-500 mx-auto animate-pulse" />
                 <p className="text-xs text-slate-400 uppercase font-bold">Construct Custom Instance</p>
                 <p className="text-[10px] text-slate-600">Enter parameters. The Architect will generate the path.</p>
              </div>
              <textarea 
                 value={customDungeonPrompt}
                 onChange={(e) => setCustomDungeonPrompt(e.target.value)}
                 className="w-full bg-slate-900 border border-purple-500/30 rounded-xl p-4 text-sm text-white focus:border-purple-500 outline-none h-32 resize-none"
                 placeholder="e.g. 20 min high intensity cardio, bodyweight only, focus on legs."
              />
              <button 
                onClick={handleGenerateDungeon}
                disabled={isGeneratingDungeon || !customDungeonPrompt.trim()}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                 {isGeneratingDungeon ? <Loader2 size={18} className="animate-spin"/> : <Swords size={18}/>}
                 {isGeneratingDungeon ? 'Constructing...' : 'Initialize Dungeon'}
              </button>
           </div>
        </div>
     );
  }

  if (showPremiumModal) {
      return (
          <div className="absolute inset-0 bg-slate-950 z-[100] flex flex-col p-6 animate-in fade-in duration-300">
              <header className="flex justify-between items-center mb-6"><div className="flex items-center gap-2 text-amber-400"><Crown size={24} /><h2 className="text-lg font-black uppercase italic">Hunter's License</h2></div><button onClick={() => setShowPremiumModal(false)} className="p-2 bg-slate-900 rounded-lg text-slate-500 hover:text-white"><X size={20}/></button></header>
              <div className="space-y-4 overflow-y-auto pb-8">
                  {[
                      { title: "Monthly Pass", price: "$9.99 / mo", desc: "Access to Time Attack & Advanced Analytics." },
                      { title: "Annual Permit", price: "$99.99 / yr", desc: "Save 20%. Includes S-Rank Gym Gear access." },
                      { title: "Protocol 30 (Sprint)", price: "$14.99", desc: "1-Month Intensive Attack Protocol." },
                      { title: "Protocol 90 (Standard)", price: "$29.99", desc: "3-Month Transformation Protocol." },
                      { title: "Protocol 180 (Elite)", price: "$49.99", desc: "6-Month Body Recomposition." },
                      { title: "Protocol 365 (Monarch)", price: "$89.99", desc: "12-Month Total Rebirth." }
                  ].map((plan, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-center mb-2"><h3 className="text-sm font-black uppercase text-white group-hover:text-amber-400">{plan.title}</h3><span className="text-xs font-bold text-amber-400">{plan.price}</span></div>
                          <p className="text-[10px] text-slate-400">{plan.desc}</p>
                          <button onClick={() => { setIsPremium(true); setShowPremiumModal(false); }} className="mt-4 w-full py-3 bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] hover:bg-amber-500">Purchase Access</button>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  if (showGoldLocker) {
      return (
             <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col p-6 animate-in fade-in duration-300">
                <header className="flex justify-between items-center mb-6"><h2 className="text-lg font-black uppercase italic text-amber-400">Gold Locker</h2><button onClick={() => setShowGoldLocker(false)}><X size={20} className="text-slate-500"/></button></header>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-amber-500/20 mb-6 text-center"><p className="text-xs font-bold text-slate-500 uppercase">Current Balance</p><h1 className="text-4xl font-black text-amber-400 mt-1">{gold.toLocaleString()} G</h1></div>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {transactions.length === 0 ? <p className="text-center text-slate-600 text-xs italic mt-10">No transaction history found.</p> : transactions.map(t => (<div key={t.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl"><div><p className="text-xs font-bold text-slate-200">{t.description}</p><p className="text-[9px] text-slate-500 font-mono">{t.date} • {t.time}</p></div><span className={`text-xs font-black ${t.type === 'EARN' ? 'text-emerald-400' : 'text-red-400'}`}>{t.type === 'EARN' ? '+' : '-'}{t.amount}</span></div>))}
                </div>
             </div>
      )
  }

  if (showTimeAttackModal && timeAttackStats) {
      return (
            <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col p-6 animate-in fade-in slide-in-from-bottom-10">
                <header className="flex justify-between items-center mb-6"><h2 className="text-lg font-black uppercase italic text-red-500">Protocol Dossier</h2><button onClick={() => setShowTimeAttackModal(false)}><X size={20} className="text-slate-500"/></button></header>
                <div className="space-y-6">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-red-500/20 text-center"><p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Time Remaining</p><h1 className="text-5xl font-black text-white mt-2 font-mono">{timeAttackStats.daysLeft} <span className="text-lg text-slate-500">DAYS</span></h1></div>
                    
                    {/* NEW: Detailed Stats Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border bg-white/5 border-white/5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Daily Calories</p>
                            <p className="text-xl font-black text-amber-400">{targetCalories} kcal</p>
                        </div>
                        <div className="p-4 rounded-xl border bg-white/5 border-white/5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Min. Workout</p>
                            <p className="text-xl font-black text-blue-400">{minWorkoutMinutes} mins</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-white/5 border-white/5">
                         <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold uppercase text-slate-400">Projected (Today)</span>
                             <span className="text-xl font-black text-slate-200">{timeAttackStats.expectedWeight} kg</span>
                         </div>
                         <div className="flex justify-between items-center mb-4">
                             <span className="text-xs font-bold uppercase text-slate-400">Actual (Current)</span>
                             <span className={`text-xl font-black ${timeAttackStats.status === 'BEHIND' ? 'text-red-500' : 'text-emerald-400'}`}>{timeAttackStats.currentWeight} kg</span>
                         </div>
                         <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                             <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${timeAttackStats.totalProgress}%` }} />
                         </div>
                         <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                             <span>Start: {userProfile.startWeight}</span>
                             <span>Final Goal: {timeAttackStats.finalTarget}</span>
                         </div>
                    </div>
                </div>
            </div>
      )
  }

  // --- Active Alarm Modal (Highest Z) ---
  if (activeAlarm) {
      return (
        <div className="min-h-screen bg-red-950 text-white font-sans flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300 fixed inset-0 z-[200]">
            <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />
            <BellRing size={64} className="text-white mb-6 animate-bounce" />
            <h1 className="text-4xl font-black uppercase italic mb-2 tracking-tighter">System Alert</h1>
            <p className="text-sm font-bold uppercase tracking-widest text-red-200 mb-8">{activeAlarm.label}</p>
            <div className="text-6xl font-mono font-black mb-12">{activeAlarm.time}</div>
            <button onClick={dismissAlarm} className="w-full max-w-xs py-5 bg-white text-red-900 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_50px_rgba(255,255,255,0.3)] active:scale-95 transition-transform">Acknowledge</button>
        </div>
      )
  }

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center">
      <div className={`relative w-full max-w-md min-h-screen flex flex-col border-x border-white/5 bg-slate-950/90 backdrop-blur-xl ${themeColor === 'red' ? 'border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.1)]' : ''}`}>
        
        {/* Header */}
        <header className="p-6 pt-10 space-y-4 bg-gradient-to-b from-blue-900/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative"><div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(37,99,235,0.4)]"><User size={28} className="text-white" /></div><div className="absolute -bottom-2 -right-2 bg-slate-900 border border-blue-500 px-2 py-0.5 rounded text-[10px] font-black text-blue-400">Lv.{level}</div></div>
              <div><div className="flex items-center gap-2"><h1 className="text-lg font-black tracking-tight uppercase italic leading-tight">{userProfile.name || 'Hunter'}</h1><button onClick={() => setShowGatePass(true)} className="p-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"><QrCode size={14} className="text-blue-400" /></button></div><div className="flex items-center gap-2"><button onClick={() => setShowPremiumModal(true)} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase underline">{isPremium ? 'S-Rank' : 'Upgrade to S-Rank'}</button><div className="w-[1px] h-2 bg-slate-700" /><div className="flex items-center gap-1 text-amber-400"><Coins size={10} fill="currentColor" /><span className="text-[10px] font-black">{gold.toLocaleString()} G</span></div></div></div>
            </div>
            <button onClick={() => setIsLoggedIn(false)} className="text-slate-600 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
          </div>
          <div className="space-y-1"><div className="flex justify-between text-[9px] font-black text-slate-500 uppercase"><span>Evolution Progress</span><span>{xp} / {maxXp} XP</span></div><ProgressBar current={xp} max={maxXp} /></div>
        </header>

        {/* Premium Banner */}
        {isPremium && !themeColor === 'red' && (
          <div className="mx-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2"><Zap size={16} className="text-amber-500" /><div><p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Premium Active</p><p className="text-[8px] text-amber-500/70 font-bold uppercase">{trialDaysLeft} Days Remaining</p></div></div>
            <div className="flex items-center gap-1 text-amber-500"><ShoppingBag size={14} /><span className="text-[9px] font-black">20% OFF</span></div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex px-4 gap-1 my-4">
          {[{ id: 'diet', icon: <Utensils size={16}/>, label: 'Diet' }, { id: 'schedule', icon: <Clock size={16}/>, label: 'System' }, { id: 'quests', icon: <Swords size={16}/>, label: 'Dungeon' }, { id: 'guild', icon: <Users size={16}/>, label: 'Guild' }, { id: 'shop', icon: <ShoppingBag size={16}/>, label: 'Shop' }, { id: 'profile', icon: <Activity size={16}/>, label: 'Status' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all border ${activeTab === tab.id ? (themeColor === 'red' ? 'bg-red-600/10 border-red-500/50 text-red-400' : 'bg-blue-600/10 border-blue-500/50 text-blue-400') : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}>{tab.icon}<span className="text-[8px] font-black mt-1 uppercase tracking-tighter">{tab.label}</span></button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-6 pb-24 overscroll-none">
            
            {/* --- DIET TAB --- */}
            {activeTab === 'diet' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5"><span className="text-[8px] font-black text-slate-500 uppercase">Protein</span><p className={`text-sm font-bold ${themeColor === 'red' ? 'text-red-400' : 'text-blue-400'}`}>{dietBreakdown.protein}g</p><ProgressBar current={dietBreakdown.protein} max={150} color={themeColor === 'red' ? "bg-red-500" : "bg-blue-500"} height="h-1" /></div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5"><span className="text-[8px] font-black text-slate-500 uppercase">Carbs</span><p className="text-sm font-bold text-emerald-400">{dietBreakdown.carbs}g</p><ProgressBar current={dietBreakdown.carbs} max={250} color="bg-emerald-500" height="h-1" /></div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5"><span className="text-[8px] font-black text-slate-500 uppercase">Fats</span><p className="text-sm font-bold text-amber-400">{dietBreakdown.fats}g</p><ProgressBar current={dietBreakdown.fats} max={70} color="bg-amber-500" height="h-1" /></div>
                    </div>
                    
                    <div className={`bg-slate-900/50 border p-4 rounded-2xl space-y-4 relative overflow-hidden transition-colors ${themeColor === 'red' ? 'border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'border-white/5'}`}>
                        <div className="flex justify-between items-end relative z-10"><h2 className={`text-xs font-black uppercase tracking-widest ${themeColor === 'red' ? 'text-red-400' : 'text-blue-400'}`}>Add Consumption</h2><span className="text-[10px] font-mono text-slate-400">{dietBreakdown.calories} / {targetCalories} KCAL</span></div>
                        <ProgressBar current={dietBreakdown.calories} max={targetCalories} color={themeColor === 'red' ? "bg-red-600" : "bg-blue-600"} />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <input value={foodInput} onChange={(e) => setFoodInput(e.target.value)} placeholder="e.g. Chicken Breast" className={`col-span-2 bg-slate-950 border rounded-xl p-3 text-xs outline-none ${themeColor === 'red' ? 'border-red-900/30' : 'border-white/10'}`} />
                            <input type="number" inputMode="numeric" value={qtyInput} onChange={(e) => setQtyInput(e.target.value)} className={`bg-slate-950 border rounded-xl p-3 text-xs outline-none ${themeColor === 'red' ? 'border-red-900/30' : 'border-white/10'}`} placeholder="Qty" />
                            <select value={unitInput} onChange={(e) => setUnitInput(e.target.value)} className={`bg-slate-950 border rounded-xl p-3 text-xs text-slate-400 outline-none ${themeColor === 'red' ? 'border-red-900/30' : 'border-white/10'}`}><option value="grams">Grams</option><option value="serves">Serves</option></select>
                        </div>
                        <button onClick={fetchNutritionalInfo} disabled={isSearching} className={`w-full py-3 rounded-xl text-xs font-black uppercase ${themeColor === 'red' ? 'bg-red-600' : 'bg-blue-600'} text-white`}>{isSearching ? 'Analyzing...' : 'Log Meal'}</button>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Today's Protocol</h3>
                        {meals.map(m => (
                            <div key={m.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                                <div><p className="text-[10px] font-bold text-slate-200">{m.name}</p><p className="text-[8px] text-slate-500 mt-0.5">{m.protein}P • {m.carbs}C • {m.fats}F</p></div>
                                <span className={`text-xs font-bold ${themeColor === 'red' ? 'text-red-400' : 'text-blue-400'}`}>+{m.calories}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- SCHEDULE TAB --- */}
            {activeTab === 'schedule' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center">
                        <h2 className={`text-xs font-black uppercase tracking-widest ${themeColor === 'red' ? 'text-red-400' : 'text-blue-400'}`}>System Protocol</h2>
                        <div className="flex items-center gap-2">
                           <button onClick={requestNotificationPermission} className="p-1.5 rounded-lg border bg-white/5 border-white/10 text-slate-400"><BellRing size={16} /></button>
                           <button onClick={addReminder} disabled={baseReminders.length >= 14} className={`p-1.5 rounded-lg border disabled:opacity-30 ${themeColor === 'red' ? 'bg-red-600/20 text-red-400 border-red-500/30' : 'bg-blue-600/20 text-blue-400 border-blue-500/30'}`}><Plus size={16} /></button>
                        </div>
                    </div>
                    {reminders.map(rem => (
                        <div key={rem.id} className={`p-4 bg-white/5 border rounded-2xl flex items-center gap-4 transition-all ${themeColor === 'red' ? 'border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.1)]' : 'border-white/5'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rem.active ? (themeColor === 'red' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400') : 'bg-slate-800 text-slate-600'}`}>{getReminderIcon(rem.iconType || rem.type)}</div>
                            <div className="flex-1">
                                {editingReminderId === rem.id ? (
                                    <div className="flex flex-col gap-2">
                                        <input type="time" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} className="bg-slate-900 border border-white/20 rounded p-1 text-xs text-white" />
                                        <input type="text" value={editForm.label} onChange={e => setEditForm({...editForm, label: e.target.value})} className="bg-slate-900 border border-white/20 rounded p-1 text-xs text-white" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2"><span className="text-xs font-black font-mono">{rem.time}</span><span className={`text-[8px] px-1 py-0.5 rounded font-black ${rem.active ? (themeColor === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white') : 'bg-slate-700'}`}>{rem.active ? (themeColor === 'red' ? 'CRITICAL' : 'SYNCED') : 'OFFLINE'}</span></div>
                                        <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">{rem.label}</p>
                                    </>
                                )}
                            </div>
                            {editingReminderId === rem.id ? (
                                <div className="flex flex-col gap-1">
                                    <button onClick={saveReminderEdit} className="p-1 bg-green-600 rounded text-white"><CheckCircle size={14}/></button>
                                    <button onClick={() => setEditingReminderId(null)} className="p-1 bg-red-600 rounded text-white"><X size={14}/></button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <button 
                                      onClick={() => toggleReminderCompletion(rem.id)} 
                                      className={`p-1 rounded ${rem.lastCompleted === new Date().toLocaleDateString() ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                    >
                                      <CheckCircle size={14} />
                                    </button>
                                    <button onClick={() => startEditingReminder(rem)} className="text-slate-500 hover:text-white"><Edit3 size={14} /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {/* --- GUILD / SOCIAL --- */}
            {activeTab === 'guild' && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="w-full bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="bg-blue-900/20 p-3 border-b border-blue-500/20 flex justify-between items-center"><h3 className="text-xs font-black uppercase text-blue-400">Global Activity Feed</h3><div className="flex items-center gap-1"><MapPin size={12} className="text-red-500" /><span className="text-[8px] font-bold text-slate-400">LIVE</span></div></div>
                        <div className="divide-y divide-white/5">
                            {FEED_DATA.map((item) => (
                                <div key={item.id} className="p-3 flex gap-3 hover:bg-white/5 transition-colors"><div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500 border border-white/10">{item.user.charAt(0)}</div><div className="flex-1"><p className="text-[10px] font-bold text-slate-300"><span className="text-blue-400">{item.user}</span> {item.action}</p><p className="text-[9px] text-slate-500 mt-0.5">{item.detail} • {item.time}</p></div><button className="text-slate-600 hover:text-amber-500"><Flame size={14}/></button></div>
                            ))}
                        </div>
                    </div>
                    {/* Leaderboard Mockup */}
                    <div className="w-full bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="bg-amber-900/20 p-3 border-b border-amber-500/20"><h3 className="text-xs font-black uppercase text-amber-400">Anytime Fitness: Downtown Rank</h3></div>
                        <div className="p-2">
                            {[{ r: 1, n: "Jin-Woo", l: 42, p: 9800 }, { r: 2, n: "Cha Hae-In", l: 40, p: 8500 }, { r: 3, n: "Thomas Andre", l: 39, p: 8200 }, { r: 4, n: "Go Gun-Hee", l: 35, p: 6000 }, { r: 5, n: "You", l: level, p: xp }].map((u, i) => (<div key={i} className={`flex justify-between items-center p-2 rounded-lg ${u.n === 'You' ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'}`}><div className="flex items-center gap-3"><span className={`text-xs font-black w-4 text-center ${i < 3 ? 'text-amber-400' : 'text-slate-500'}`}>{u.r}</span><span className="text-[10px] font-bold text-slate-300">{u.n}</span></div><span className="text-[9px] font-mono text-slate-500">Lv.{u.l} • {u.p} XP</span></div>))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* --- SHOP --- */}
            {activeTab === 'shop' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-end"><h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Merchant</h2><div className="flex items-center gap-2"><button onClick={() => setShowGoldLocker(true)} className="flex items-center gap-1.5 bg-amber-900/20 border border-amber-500/20 px-2 py-1 rounded-lg hover:bg-amber-900/40 transition-colors"><History size={12} className="text-amber-400" /><span className="text-[9px] font-bold text-amber-400 uppercase">Locker</span></button><div className="flex items-center gap-1 text-amber-400"><Coins size={12} fill="currentColor" /><span className="text-xs font-black">{gold.toLocaleString()} G</span></div></div></div>
                    {!isPremium ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6 border border-red-500/30 bg-red-900/10 rounded-3xl p-6"><div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]"><Lock size={32} className="text-red-500" /></div><div className="space-y-2"><h3 className="text-xl font-black uppercase italic text-red-500 tracking-tighter">Access Denied</h3><p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">S-Rank Authorization Required</p><p className="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">High-grade equipment and metabolic boosters are restricted to premium hunters.</p></div><button onClick={() => setShowPremiumModal(true)} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase italic tracking-widest text-xs transition-all active:scale-95 shadow-lg">Unlock S-Rank Access</button></div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                        {shopItems.map(item => (
                            <div key={item.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-3 flex flex-col group hover:border-blue-500/50 transition-colors">
                                <div className="aspect-square bg-slate-950 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                                {item.image === 'potion' ? <div className="w-10 h-10 rounded-full bg-blue-500 animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.8)]" /> : (item.image === 'shirt' ? <Shirt size={24} className="text-slate-700 group-hover:text-blue-500 transition-colors" /> : <ShoppingBag size={24} className="text-slate-700 group-hover:text-blue-500 transition-colors" />)}
                                <div className="absolute top-2 right-2 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">-{item.discount}%</div>
                                </div>
                                <h3 className="text-[10px] font-black uppercase text-slate-200 truncate">{item.name}</h3>
                                {item.desc && <p className="text-[8px] text-slate-500 my-1 leading-tight">{item.desc}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                {item.type === 'gold' ? (<div className="flex items-center gap-1 text-amber-400"><Coins size={10} fill="currentColor" /><span className="text-xs font-bold">{item.price}</span></div>) : (<span className="text-xs font-bold text-blue-400">${item.price}</span>)}
                                </div>
                                <button onClick={() => handlePurchase(item)} disabled={item.type === 'gold' && gold < item.price} className={`mt-3 w-full text-[9px] font-black py-2 rounded-lg uppercase transition-all ${item.type === 'gold' && gold < item.price ? 'bg-slate-800 text-slate-600' : 'bg-white/5 hover:bg-blue-600 hover:text-white text-slate-400'}`}>{item.type === 'gold' && gold < item.price ? 'Insufficient Gold' : 'Purchase'}</button>
                            </div>
                        ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div onClick={() => { if(isPremium && deadline) setShowTimeAttackModal(true) }} className={`p-4 bg-slate-900/50 border rounded-3xl relative overflow-hidden transition-all ${isPremium && deadline ? (themeColor === 'red' ? 'cursor-pointer border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse' : 'cursor-pointer hover:border-blue-500/50') : 'border-white/5'}`}>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <div className="flex items-center gap-2"><Calendar size={16} className={themeColor === 'red' ? "text-red-500" : (isPremium ? "text-blue-500" : "text-slate-600")} /><h2 className={`text-xs font-black uppercase tracking-widest ${themeColor === 'red' ? 'text-red-400' : 'text-slate-200'}`}>Time Attack Protocol</h2></div>
                            {deadline && <button onClick={(e) => { e.stopPropagation(); setShowTimeAttackModal(true); }} className="text-[8px] font-black px-2 py-0.5 rounded border border-blue-500 text-blue-400 flex items-center gap-1">OPEN DOSSIER <ExternalLink size={8}/></button>}
                        </div>
                        {!isPremium ? (
                            <div className="text-center py-4 relative z-10"><Lock size={20} className="mx-auto text-slate-600 mb-2" /><p className="text-[9px] text-slate-500 font-bold uppercase">Unlock to set specific Goal Deadlines</p><button onClick={() => setShowPremiumModal(true)} className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-black uppercase rounded-lg border border-white/10 transition-colors">View Plans</button></div>
                        ) : (
                            <div className="space-y-3 relative z-10">
                                {deadline ? (<div className="flex items-center justify-between text-xs"><span className="text-slate-400 font-bold uppercase">Target Date:</span><span className="text-white font-black font-mono">{new Date(deadline).toLocaleDateString()}</span></div>) : (<p className="text-[9px] text-slate-400">Set a deadline to engage <span className="text-red-400 font-bold">Hard Mode</span>.</p>)}
                                <input type="date" value={deadline} onChange={(e) => handleSetDeadline(e.target.value)} onClick={(e) => e.stopPropagation()} className={`w-full bg-slate-950 border text-xs font-bold rounded-xl p-3 outline-none uppercase ${themeColor === 'red' ? 'border-red-900/30 text-red-400' : 'border-blue-900/30 text-blue-400'}`}/>
                            </div>
                        )}
                        {!isPremium && <div className="absolute inset-0 bg-slate-950/80 z-0" />} 
                    </div>

                    <div className="p-4 bg-slate-900/50 border border-white/5 rounded-3xl">
                        <div className="flex justify-between items-center mb-4"><h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Combat Strategy (Workouts)</h2><button onClick={() => setIsConfiguringWorkout(true)} className="p-2 bg-blue-600 rounded-lg text-white"><Settings size={16} /></button></div>
                        <div className="flex gap-2"><div className="flex-1 bg-slate-950 p-2 rounded-xl text-center border border-white/5"><p className="text-[8px] text-slate-500 uppercase">Push</p><p className="text-xs font-bold">{workoutData.PUSH.length} Ex</p></div><div className="flex-1 bg-slate-950 p-2 rounded-xl text-center border border-white/5"><p className="text-[8px] text-slate-500 uppercase">Pull</p><p className="text-xs font-bold">{workoutData.PULL.length} Ex</p></div><div className="flex-1 bg-slate-950 p-2 rounded-xl text-center border border-white/5"><p className="text-[8px] text-slate-500 uppercase">Legs</p><p className="text-xs font-bold">{workoutData.LEGS.length} Ex</p></div></div>
                    </div>

                    <div className="p-4 bg-slate-900/50 border border-white/5 rounded-3xl">
                        <div className="flex justify-between items-center mb-4"><h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Hunter Parameters</h2><button onClick={() => setIsEditingProfile(!isEditingProfile)} className={`p-1.5 rounded-lg transition-colors ${isEditingProfile ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-blue-400'}`}>{isEditingProfile ? <Save size={14} /> : <Edit2 size={14} />}</button></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950 p-3 rounded-xl border border-white/5"><span className="text-[8px] font-black text-slate-500 uppercase">Age</span>{isEditingProfile ? (<input value={userProfile.age} inputMode="numeric" onChange={(e) => setUserProfile({...userProfile, age: e.target.value})} className="w-full bg-slate-900 text-xs font-bold border-b border-blue-500 focus:outline-none mt-1" />) : (<p className="text-xs font-bold">{userProfile.age || '--'}</p>)}</div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-white/5"><span className="text-[8px] font-black text-slate-500 uppercase">Weight Target (kg)</span>{isEditingProfile ? (<input value={userProfile.targetWeight} inputMode="decimal" onChange={(e) => setUserProfile({...userProfile, targetWeight: e.target.value})} className="w-full bg-slate-900 text-xs font-bold text-blue-400 border-b border-blue-500 focus:outline-none mt-1" />) : (<p className="text-xs font-bold text-blue-400">{userProfile.targetWeight || '--'} kg</p>)}</div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* --- QUESTS TAB --- */}
            {activeTab === 'quests' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className={`text-xs font-black uppercase tracking-widest ${themeColor === 'red' ? 'text-red-400' : 'text-blue-400'}`}>Active Gate Keys</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setShowOracle(true)} className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-600/40"><Bot size={16}/></button>
                            <button onClick={() => setShowDungeonArchitect(true)} className="p-1.5 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-600/40"><BrainCircuit size={16}/></button>
                        </div>
                    </div>
                    {quests.map(q => (
                        <div key={q.id} className={`p-4 bg-white/5 border rounded-2xl space-y-3 ${themeColor === 'red' ? 'border-red-500/30' : 'border-white/5'}`}>
                            <div className="flex justify-between items-start">
                                <div><h4 className="text-[11px] font-black uppercase text-slate-200">{q.title}</h4><div className="flex items-center gap-2 mt-1"><span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${themeColor === 'red' ? 'bg-red-900/20 text-red-400 border-red-500/20' : 'bg-blue-900/20 text-blue-400 border-blue-500/20'}`}>+{q.rewardXp} XP</span><span className="text-[8px] text-amber-400 font-bold uppercase bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-500/20">+{q.rewardGold} G</span></div></div>
                                {q.completed ? <div className="flex items-center gap-1 text-emerald-500"><CheckCircle size={12}/><span className="text-[8px] font-black">CLEARED</span></div> : 
                                (q.id === 1 && checkingLocation ? <Loader2 size={12} className="animate-spin text-blue-500"/> : <button onClick={() => handleQuestProgress(q.id)} className={`text-[9px] font-black text-white px-3 py-1.5 rounded-lg ${themeColor === 'red' ? 'bg-red-600' : 'bg-blue-600'}`}>{q.id === 2 && activeCardio ? 'LIVE' : 'ENTER'}</button>)}
                            </div>
                            <div className="flex items-center gap-3"><ProgressBar current={q.current} max={q.goal} color={q.completed ? "bg-emerald-500" : (themeColor === 'red' ? "bg-red-600" : "bg-blue-600")} /><span className="text-[9px] font-mono whitespace-nowrap">{q.current}/{q.goal} {q.unit}</span></div>
                        </div>
                    ))}
                </div>
            )}

        </main>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 px-6 py-2 bg-slate-900/90 backdrop-blur border border-blue-500/30 rounded-full shadow-2xl z-50"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full animate-pulse ${themeColor === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} /><span className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeColor === 'red' ? 'text-red-400' : 'text-blue-400'}`}>{themeColor === 'red' ? 'SYSTEM ENRAGED' : 'SYSTEM ONLINE'}</span><div className="w-[1px] h-3 bg-white/10 mx-1" /><span className="text-[10px] font-black uppercase text-slate-400">Day {loginStreak}</span></div></div>
      </div>
      
      {/* Modals placed outside main div for correct layering */}
      
      {/* System Oracle (Chat) */}
      {showOracle && (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-in fade-in slide-in-from-bottom-10">
            <header className="p-4 border-b border-white/10 bg-slate-900/90 flex justify-between items-center">
            <div className="flex items-center gap-2"><Bot size={20} className="text-blue-400" /><h2 className="text-sm font-black uppercase text-blue-400 tracking-widest">System Oracle</h2></div>
            <button onClick={() => setShowOracle(false)}><X size={20} className="text-slate-500" /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {oracleMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'}`}>
                    {msg.text}
                    </div>
                </div>
            ))}
            {isOracleThinking && <div className="flex justify-start"><div className="bg-white/10 p-3 rounded-2xl rounded-tl-none"><Loader2 size={16} className="animate-spin text-blue-400"/></div></div>}
            <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-white/10 bg-slate-900 pb-8">
            <div className="relative">
                <input 
                    value={oracleInput}
                    onChange={(e) => setOracleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleOracleSend()}
                    placeholder="Ask the System..."
                    className="w-full bg-slate-950 border border-white/20 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-blue-500 outline-none"
                />
                <button 
                    onClick={handleOracleSend}
                    disabled={!oracleInput.trim() || isOracleThinking}
                    className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50"
                >
                    <Send size={16} />
                </button>
            </div>
            </div>
        </div>
      )}

      {/* Dungeon Architect Modal */}
      {showDungeonArchitect && (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col p-6 animate-in fade-in zoom-in">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2"><BrainCircuit size={20} className="text-purple-400" /><h2 className="text-lg font-black uppercase italic text-purple-400">Dungeon Architect</h2></div>
                <button onClick={() => setShowDungeonArchitect(false)}><X size={20} className="text-slate-500"/></button>
            </header>
            <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="text-center space-y-2">
                    <Sparkles size={48} className="text-purple-500 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400 uppercase font-bold">Construct Custom Instance</p>
                    <p className="text-[10px] text-slate-600">Enter parameters. The Architect will generate the path.</p>
                </div>
                <textarea 
                    value={customDungeonPrompt}
                    onChange={(e) => setCustomDungeonPrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-purple-500/30 rounded-xl p-4 text-sm text-white focus:border-purple-500 outline-none h-32 resize-none"
                    placeholder="e.g. 20 min high intensity cardio, bodyweight only, focus on legs."
                />
                <button 
                    onClick={handleGenerateDungeon}
                    disabled={isGeneratingDungeon || !customDungeonPrompt.trim()}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isGeneratingDungeon ? <Loader2 size={18} className="animate-spin"/> : <Swords size={18}/>}
                    {isGeneratingDungeon ? 'Constructing...' : 'Initialize Dungeon'}
                </button>
            </div>
        </div>
      )}

      {showPremiumModal && (
          <div className="absolute inset-0 bg-slate-950 z-[100] flex flex-col p-6 animate-in fade-in duration-300">
              <header className="flex justify-between items-center mb-6"><div className="flex items-center gap-2 text-amber-400"><Crown size={24} /><h2 className="text-lg font-black uppercase italic">Hunter's License</h2></div><button onClick={() => setShowPremiumModal(false)} className="p-2 bg-slate-900 rounded-lg text-slate-500 hover:text-white"><X size={20}/></button></header>
              <div className="space-y-4 overflow-y-auto pb-8">
                  {[
                      { title: "Monthly Pass", price: "$9.99 / mo", desc: "Access to Time Attack & Advanced Analytics." },
                      { title: "Annual Permit", price: "$99.99 / yr", desc: "Save 20%. Includes S-Rank Gym Gear access." },
                      { title: "Protocol 30 (Sprint)", price: "$14.99", desc: "1-Month Intensive Attack Protocol." },
                      { title: "Protocol 90 (Standard)", price: "$29.99", desc: "3-Month Transformation Protocol." },
                      { title: "Protocol 180 (Elite)", price: "$49.99", desc: "6-Month Body Recomposition." },
                      { title: "Protocol 365 (Monarch)", price: "$89.99", desc: "12-Month Total Rebirth." }
                  ].map((plan, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-center mb-2"><h3 className="text-sm font-black uppercase text-white group-hover:text-amber-400">{plan.title}</h3><span className="text-xs font-bold text-amber-400">{plan.price}</span></div>
                          <p className="text-[10px] text-slate-400">{plan.desc}</p>
                          <button onClick={() => { setIsPremium(true); setShowPremiumModal(false); }} className="mt-4 w-full py-3 bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] hover:bg-amber-500">Purchase Access</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {showGoldLocker && (
             <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col p-6 animate-in fade-in duration-300">
                <header className="flex justify-between items-center mb-6"><h2 className="text-lg font-black uppercase italic text-amber-400">Gold Locker</h2><button onClick={() => setShowGoldLocker(false)}><X size={20} className="text-slate-500"/></button></header>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-amber-500/20 mb-6 text-center"><p className="text-xs font-bold text-slate-500 uppercase">Current Balance</p><h1 className="text-4xl font-black text-amber-400 mt-1">{gold.toLocaleString()} G</h1></div>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {transactions.length === 0 ? <p className="text-center text-slate-600 text-xs italic mt-10">No transaction history found.</p> : transactions.map(t => (<div key={t.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl"><div><p className="text-xs font-bold text-slate-200">{t.description}</p><p className="text-[9px] text-slate-500 font-mono">{t.date} • {t.time}</p></div><span className={`text-xs font-black ${t.type === 'EARN' ? 'text-emerald-400' : 'text-red-400'}`}>{t.type === 'EARN' ? '+' : '-'}{t.amount}</span></div>))}
                </div>
             </div>
      )}

      {showTimeAttackModal && timeAttackStats && (
            <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col p-6 animate-in fade-in slide-in-from-bottom-10">
                <header className="flex justify-between items-center mb-6"><h2 className="text-lg font-black uppercase italic text-red-500">Protocol Dossier</h2><button onClick={() => setShowTimeAttackModal(false)}><X size={20} className="text-slate-500"/></button></header>
                <div className="space-y-6">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-red-500/20 text-center"><p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Time Remaining</p><h1 className="text-5xl font-black text-white mt-2 font-mono">{timeAttackStats.daysLeft} <span className="text-lg text-slate-500">DAYS</span></h1></div>
                    
                    {/* NEW: Detailed Stats Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border bg-white/5 border-white/5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Daily Calories</p>
                            <p className="text-xl font-black text-amber-400">{targetCalories} kcal</p>
                        </div>
                        <div className="p-4 rounded-xl border bg-white/5 border-white/5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Min. Workout</p>
                            <p className="text-xl font-black text-blue-400">{minWorkoutMinutes} mins</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-white/5 border-white/5">
                         <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold uppercase text-slate-400">Projected (Today)</span>
                             <span className="text-xl font-black text-slate-200">{timeAttackStats.expectedWeight} kg</span>
                         </div>
                         <div className="flex justify-between items-center mb-4">
                             <span className="text-xs font-bold uppercase text-slate-400">Actual (Current)</span>
                             <span className={`text-xl font-black ${timeAttackStats.status === 'BEHIND' ? 'text-red-500' : 'text-emerald-400'}`}>{timeAttackStats.currentWeight} kg</span>
                         </div>
                         <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                             <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${timeAttackStats.totalProgress}%` }} />
                         </div>
                         <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                             <span>Start: {userProfile.startWeight}</span>
                             <span>Final Goal: {timeAttackStats.finalTarget}</span>
                         </div>
                    </div>
                </div>
            </div>
      )}

      {showGatePass && (
            <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-6 backdrop-blur">
                <div className="w-full bg-slate-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
                    <div className="flex justify-center mb-6"><div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center"><QrCode size={48} className="text-slate-900" /></div></div>
                    <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">Gate Pass</h2>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-8">Access Granted</p>
                    <button onClick={() => setShowGatePass(false)} className="text-xs font-black text-slate-500 hover:text-white uppercase">Close Gate</button>
                </div>
            </div>
      )}

      {isConfiguringWorkout && (
            <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col p-4 animate-in slide-in-from-bottom duration-300">
                <header className="flex justify-between items-center mb-6 pt-4"><h2 className="text-lg font-black uppercase italic text-blue-400">Combat Strategy</h2><button onClick={saveWorkoutConfig} className="text-xs font-bold bg-blue-600 px-3 py-1.5 rounded-lg">SAVE</button></header>
                <div className="flex gap-2 mb-4">{['PUSH', 'PULL', 'LEGS'].map(type => (<button key={type} onClick={() => setConfigType(type)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg border ${configType === type ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-transparent text-slate-500'}`}>{type}</button>))}</div>
                <div className="flex-1 overflow-y-auto space-y-3 pb-8">
                {workoutData[configType].map((ex, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                        <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-300">{ex.name}</span></div>
                        <div className="flex items-center gap-2"><span className="text-[10px] font-black text-slate-500 uppercase w-8">Reps:</span><input value={ex.sets.join(', ')} onChange={(e) => handleUpdateExercise(configType, idx, 'sets', e.target.value)} className="flex-1 bg-slate-950 border border-white/10 rounded p-2 text-xs font-mono text-blue-400 focus:border-blue-500 outline-none" placeholder="e.g. 12, 10, 8"/></div>
                    </div>
                ))}
                </div>
            </div>
      )}

      {showReportModal && monthlyReport && (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col p-6 animate-in fade-in duration-300 relative">
            <header className="flex justify-between items-center mb-6"><h2 className="text-lg font-black uppercase italic text-blue-400">System Report</h2><button onClick={() => setShowReportModal(false)} className="p-2 bg-slate-900 rounded-lg text-slate-500 hover:text-white"><X size={20}/></button></header>
            <div className="flex-1 overflow-y-auto space-y-6 pb-20"><div className="p-6 bg-white rounded-lg text-slate-900 shadow-2xl relative overflow-hidden" id="report-content"><div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start"><div><h1 className="text-2xl font-black uppercase italic tracking-tighter">Monthly Evaluation</h1><p className="text-xs font-bold uppercase text-slate-500">Hunter: {userProfile.name}</p></div><div className="text-right"><div className="text-4xl font-black text-blue-600">{monthlyReport.grade}</div><p className="text-[10px] font-bold uppercase">Overall Rank</p></div></div><div className="space-y-4"><div><h3 className="text-xs font-black uppercase text-blue-600 mb-1">Executive Summary</h3><p className="text-xs font-medium leading-relaxed">{monthlyReport.summary}</p></div><div className="grid grid-cols-2 gap-4"><div className="bg-slate-100 p-3 rounded-lg"><h4 className="text-[10px] font-black uppercase text-slate-500 mb-1">Strength</h4><p className="text-[10px] leading-tight">{monthlyReport.strength_analysis}</p></div><div className="bg-slate-100 p-3 rounded-lg"><h4 className="text-[10px] font-black uppercase text-slate-500 mb-1">Diet</h4><p className="text-[10px] leading-tight">{monthlyReport.diet_analysis}</p></div></div><div><h3 className="text-xs font-black uppercase text-red-600 mb-2">System Mandates (Next Month)</h3><ul className="space-y-1">{monthlyReport.mandates?.map((m, i) => (<li key={i} className="flex items-start gap-2 text-xs font-bold"><span className="text-red-500">⚠</span> {m}</li>))}</ul></div></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-slate-900/5 -rotate-45 pointer-events-none">SYSTEM</div></div></div><div className="fixed bottom-6 left-0 right-0 px-6 flex gap-3"><button onClick={handleSendEmail} disabled={emailStatus !== 'idle'} className={`flex-1 py-3 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all ${emailStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>{emailStatus === 'sending' ? <Loader2 size={18} className="animate-spin" /> : emailStatus === 'success' ? <CheckCircle size={18} /> : <Mail size={18} />}{emailStatus === 'success' ? 'Transmitted' : 'Transmit to Neural Link'}</button><button className="py-3 px-4 bg-slate-800 text-slate-300 rounded-xl font-black hover:bg-slate-700"><Download size={20} /></button></div>
        </div>
      )}

      {activeAlarm && (
        <div className="fixed inset-0 bg-red-950 text-white font-sans flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300 z-[200]">
            <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />
            <BellRing size={64} className="text-white mb-6 animate-bounce" />
            <h1 className="text-4xl font-black uppercase italic mb-2 tracking-tighter">System Alert</h1>
            <p className="text-sm font-bold uppercase tracking-widest text-red-200 mb-8">{activeAlarm.label}</p>
            <div className="text-6xl font-mono font-black mb-12">{activeAlarm.time}</div>
            <button onClick={dismissAlarm} className="w-full max-w-xs py-5 bg-white text-red-900 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_50px_rgba(255,255,255,0.3)] active:scale-95 transition-transform">Acknowledge</button>
        </div>
      )}

    </div>
  );
};

export default App;
