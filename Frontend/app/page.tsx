"use client";

import { motion, useInView } from "motion/react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { 
  Compass, 
  Route, 
  Sparkles, 
  Clock, 
  Wallet, 
  ShieldCheck,
  Camera,
  BookOpen,
  MapPin,
  Calendar,
  Heart,
  Plus,
  Minus,
  Menu,
  X,
  Mail,
  MessageCircle,
  ArrowRight,
  MessageSquare,
  Lock,
  CheckCircle,
  Clock3,
  Twitter,
  Linkedin,
  Instagram,
  Play,
  AlertTriangle,
  Zap,
  Target,
  Users,
  Package,
  Truck,
  Radio,
  Satellite,
  Activity,
  TrendingUp,
  BarChart3,
  FileText,
  Brain,
  Eye,
  Signal,
  Sun,
  Moon
} from "lucide-react";
import { useEffect, useRef, useState, createContext, useContext } from "react";

// Theme Context
const ThemeContext = createContext<{
  isDarkMode: boolean;
  toggleTheme: () => void;
}>({
  isDarkMode: true,
  toggleTheme: () => {}
});

// Theme Provider
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('disasteriq-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('disasteriq-theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Toggle Component
function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-white/10 ring-1 ring-white/15 hover:bg-white/15 text-white/90' 
          : 'bg-gray-900/10 ring-1 ring-gray-900/15 hover:bg-gray-900/15 text-gray-900/90'
      }`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDarkMode ? 0 : 180, scale: isDarkMode ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon className="h-4 w-4" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: isDarkMode ? 180 : 0, scale: isDarkMode ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun className="h-4 w-4" />
      </motion.div>
    </motion.button>
  );
}

// Page Loader Component
function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed inset-0 z-50 bg-[#0B0F12] flex items-center justify-center"
      style={{ pointerEvents: 'none' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white font-geist text-sm"
        >
          Initializing DisasterIQ...
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Mobile menu component
function MobileMenu({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: isOpen ? 1 : 0, 
        height: isOpen ? 'auto' : 0 
      }}
      transition={{ duration: 0.2 }}
      className={`md:hidden border-t border-white/10 mt-2 pt-2 pb-3 overflow-hidden`}
    >
      <div className="grid gap-2">
        <a href="#" className="px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-sm font-medium text-white/90 font-geist">Dashboard</a>
        <a href="#" className="px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-sm font-medium text-white/80 font-geist">Inventory</a>
        <a href="#" className="px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-sm font-medium text-white/80 font-geist">Reports</a>
        <a href="#" className="px-3 py-2 rounded-lg bg-white/5 ring-1 ring-white/10 text-sm font-medium text-white/80 font-geist">Resources</a>
        <div className="flex items-center justify-between gap-2 pt-2">
          <a href="#" className="text-sm font-medium text-white/80 font-geist">Sign in</a>
          <a href="#" className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-4 py-2 text-sm font-semibold hover:bg-white/90 transition font-geist">
            <Sparkles className="h-4 w-4" />
            Get started
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// Navigation Component
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode } = useTheme();

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative z-30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <a href="#" className="flex items-center gap-2">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md backdrop-blur ${
              isDarkMode 
                ? 'bg-white/10 ring-1 ring-white/15' 
                : 'bg-gray-900/10 ring-1 ring-gray-900/15'
            }`}>
              <Compass className={`h-4 w-4 ${isDarkMode ? 'text-white/90' : 'text-gray-900/90'}`} />
            </span>
            <span className={`uppercase text-lg font-semibold tracking-tighter font-bricolage ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>DisasterIQ</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <a href="#" className={`px-3 py-1.5 rounded-full ring-1 text-sm font-medium transition font-geist ${
              isDarkMode 
                ? 'bg-white/5 ring-white/15 text-white/90 hover:bg-white/10' 
                : 'bg-gray-900/5 ring-gray-900/15 text-gray-900/90 hover:bg-gray-900/10'
            }`}>Dashboard</a>
            <a href="#" className={`px-3 py-1.5 rounded-full ring-1 text-sm font-medium transition font-geist ${
              isDarkMode 
                ? 'bg-white/5 ring-white/15 text-white/70 hover:text-white/90 hover:bg-white/10' 
                : 'bg-gray-900/5 ring-gray-900/15 text-gray-900/70 hover:text-gray-900/90 hover:bg-gray-900/10'
            }`}>Inventory</a>
            <a href="#" className={`px-3 py-1.5 rounded-full ring-1 text-sm font-medium transition font-geist ${
              isDarkMode 
                ? 'bg-white/5 ring-white/15 text-white/70 hover:text-white/90 hover:bg-white/10' 
                : 'bg-gray-900/5 ring-gray-900/15 text-gray-900/70 hover:text-gray-900/90 hover:bg-gray-900/10'
            }`}>Reports</a>
            <a href="#" className={`px-3 py-1.5 rounded-full ring-1 text-sm font-medium transition font-geist ${
              isDarkMode 
                ? 'bg-white/5 ring-white/15 text-white/70 hover:text-white/90 hover:bg-white/10' 
                : 'bg-gray-900/5 ring-gray-900/15 text-gray-900/70 hover:text-gray-900/90 hover:bg-gray-900/10'
            }`}>Resources</a>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <a href="#" className={`text-sm font-medium transition font-geist ${
              isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-900/80 hover:text-gray-900'
            }`}>Sign in</a>
            <a href="#" className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition font-geist ${
              isDarkMode 
                ? 'bg-white text-gray-900 hover:bg-white/90' 
                : 'bg-gray-900 text-white hover:bg-gray-900/90'
            }`}>
              Get started
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md ring-1 transition ${
                isDarkMode 
                  ? 'bg-white/10 ring-white/15 hover:bg-white/15' 
                  : 'bg-gray-900/10 ring-gray-900/15 hover:bg-gray-900/15'
              }`}
            aria-label="Open menu"
          >
              {mobileMenuOpen ? (
                <X className={`h-5 w-5 ${isDarkMode ? 'text-white/90' : 'text-gray-900/90'}`} />
              ) : (
                <Menu className={`h-5 w-5 ${isDarkMode ? 'text-white/90' : 'text-gray-900/90'}`} />
              )}
          </button>
          </div>
        </div>

        <MobileMenu isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
      </div>
    </motion.nav>
  );
}

// Hero Section  
function HeroSection() {
  const { isDarkMode } = useTheme();

  return (
    <section className="relative z-30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-28 pb-24 lg:pb-40 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 backdrop-blur ${
            isDarkMode 
              ? 'bg-white/10 ring-white/20' 
              : 'bg-gray-900/10 ring-gray-900/20'
          }`}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
           <Route className={`h-4 w-4 ${isDarkMode ? 'text-white/80' : 'text-gray-900/80'}`} />
          </motion.div>
          <span className={`text-xs font-medium font-geist ${
            isDarkMode ? 'text-white/80' : 'text-gray-900/80'
          }`}>Real-time Emergency Coordination</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6"
        >
          <TextGenerateEffect 
            words="Respond faster, manage smarter."
            className={`text-4xl sm:text-5xl lg:text-7xl font-geist font-light tracking-tighter ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            duration={0.8}
            filter={true}
          />
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className={`mx-auto mt-4 max-w-3xl text-base sm:text-lg font-geist ${
            isDarkMode ? 'text-white/80' : 'text-gray-900/80'
          }`}
        >
          DisasterIQ coordinates emergency response with real-time inventory tracking, intelligent weather analysis, and AI-powered decision support. Every crisis response is optimized, coordinated, and effective.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex gap-3 mt-8 items-center justify-center"
        >
          <motion.a 
            href="#" 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm sm:text-base font-semibold transition font-geist ${
              isDarkMode 
                ? 'bg-white text-gray-900 hover:bg-white/90' 
                : 'bg-gray-900 text-white hover:bg-gray-900/90'
            }`}
          >
            Access Dashboard
          </motion.a>
          <motion.a 
            href="#" 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 sm:text-base ring-1 transition text-sm font-medium font-geist rounded-full pt-3 pr-5 pb-3 pl-5 backdrop-blur ${
              isDarkMode 
                ? 'hover:bg-white/15 ring-white/15 text-white bg-white/10' 
                : 'hover:bg-gray-900/15 ring-gray-900/15 text-gray-900 bg-gray-900/10'
            }`}
          >
            View Demo
          </motion.a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className={`mt-8 flex items-center justify-center gap-2 text-xs ${
            isDarkMode ? 'text-white/60' : 'text-gray-900/60'
          }`}
        >
          <Lock className="h-3 w-3" />
          <span className="uppercase tracking-wider font-geist">Private by design</span>
        </motion.div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { isDarkMode } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="relative z-10 -mt-12 -top-20 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`rounded-2xl ring-1 p-4 backdrop-blur cursor-pointer ${
              isDarkMode 
                ? 'bg-white/5 ring-white/10' 
                : 'bg-yellow-300 ring-yellow-500/30'
            }`}
          >
            <div className="flex gap-3 items-start">
              <motion.span 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${
                  isDarkMode 
                    ? 'bg-white/10 ring-white/15' 
                    : 'bg-yellow-500 ring-yellow-600/30'
                }`}
              >
                <Sparkles className={`h-4 w-4 ${
                  isDarkMode ? 'text-white/90' : 'text-gray-900/90'
                }`} />
              </motion.span>
              <div>
                <p className={`text-sm font-semibold tracking-tight font-geist ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Smart Inventory</p>
                <p className={`text-xs font-geist ${
                  isDarkMode ? 'text-white/70' : 'text-gray-900/70'
                }`}>Real-time resource tracking and allocation.</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`rounded-2xl ring-1 p-4 backdrop-blur cursor-pointer ${
              isDarkMode 
                ? 'bg-white/5 ring-white/10' 
                : 'bg-yellow-300 ring-yellow-500/30'
            }`}
          >
            <div className="flex gap-3 items-start">
              <motion.span 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${
                  isDarkMode 
                    ? 'bg-white/10 ring-white/15' 
                    : 'bg-yellow-500 ring-yellow-600/30'
                }`}
              >
                <Clock className={`h-4 w-4 ${
                  isDarkMode ? 'text-white/90' : 'text-gray-900/90'
                }`} />
              </motion.span>
              <div>
                <p className={`text-sm font-semibold tracking-tight font-geist ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Weather Intelligence</p>
                <p className={`text-xs font-geist ${
                  isDarkMode ? 'text-white/70' : 'text-gray-900/70'
                }`}>Advanced forecasting and impact analysis.</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`rounded-2xl ring-1 p-4 backdrop-blur cursor-pointer ${
              isDarkMode 
                ? 'bg-white/5 ring-white/10' 
                : 'bg-yellow-300 ring-yellow-500/30'
            }`}
          >
            <div className="flex gap-3 items-start">
              <motion.span 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${
                  isDarkMode 
                    ? 'bg-white/10 ring-white/15' 
                    : 'bg-yellow-500 ring-yellow-600/30'
                }`}
              >
                <Wallet className={`h-4 w-4 ${
                  isDarkMode ? 'text-white/90' : 'text-gray-900/90'
                }`} />
              </motion.span>
              <div>
                <p className={`text-sm font-semibold tracking-tight font-geist ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>AI Analytics</p>
                <p className={`text-xs font-geist ${
                  isDarkMode ? 'text-white/70' : 'text-gray-900/70'
                }`}>Predictive insights and automated reporting.</p>
          </div>
            </div>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`ring-1 rounded-2xl pt-4 pr-4 pb-4 pl-4 backdrop-blur cursor-pointer ${
              isDarkMode 
                ? 'ring-white/10 bg-white/5' 
                : 'ring-yellow-500/30 bg-yellow-300'
            }`}
          >
            <div className="flex gap-3 items-start">
              <motion.span 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${
                  isDarkMode 
                    ? 'bg-white/10 ring-white/15' 
                    : 'bg-yellow-500 ring-yellow-600/30'
                }`}
              >
                <ShieldCheck className={`h-4 w-4 ${
                  isDarkMode ? 'text-white/90' : 'text-gray-900/90'
                }`} />
              </motion.span>
              <div>
                <p className={`text-sm font-semibold tracking-tight font-geist ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Secure Operations</p>
                <p className={`text-xs font-geist ${
                  isDarkMode ? 'text-white/70' : 'text-gray-900/70'
                }`}>Enterprise-grade security and compliance.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
          </div>
    </section>
  );
}

// Enhanced Phase Components
function AlertPhaseComponent() {
  const [threatLevel, setThreatLevel] = useState(3);
  const [assessmentProgress, setAssessmentProgress] = useState(75);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setThreatLevel(prev => (prev === 5 ? 1 : prev + 1));
      setAssessmentProgress(prev => (prev >= 100 ? 45 : prev + 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getThreatColor = (level: number) => {
    if (isDarkMode) {
      switch(level) {
        case 1: return 'text-green-400';
        case 2: return 'text-yellow-400';
        case 3: return 'text-orange-400';
        case 4: return 'text-red-400';
        case 5: return 'text-red-600';
        default: return 'text-gray-400';
      }
    } else {
      switch(level) {
        case 1: return 'text-green-600';
        case 2: return 'text-yellow-600';
        case 3: return 'text-orange-600';
        case 4: return 'text-red-600';
        case 5: return 'text-red-700';
        default: return 'text-gray-600';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="relative"
        >
          <AlertTriangle className={`h-6 w-6 ${getThreatColor(threatLevel)}`} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </motion.div>
              <div>
          <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Threat Level: {threatLevel}/5
              </div>
          <div className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Real-time assessment
            </div>
          </div>
        </div>
      
      <div className="space-y-2">
        <div className={`flex justify-between text-xs ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
          <span>AI Analysis Progress</span>
          <span>{assessmentProgress}%</span>
      </div>
        <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-white/10' : 'bg-gray-900/10'}`}>
          <motion.div 
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${assessmentProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Eye className="h-3 w-3 text-blue-500" />
          <span className={isDarkMode ? 'text-white/70' : 'text-gray-700'}>Monitoring</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-3 w-3 text-purple-500" />
          <span className={isDarkMode ? 'text-white/70' : 'text-gray-700'}>AI Processing</span>
        </div>
      </div>
    </div>
  );
}

function DeployPhaseComponent() {
  const [resources, setResources] = useState([
    { name: 'Medical Teams', allocated: 12, total: 15, icon: Users },
    { name: 'Equipment', allocated: 8, total: 10, icon: Package },
    { name: 'Vehicles', allocated: 6, total: 8, icon: Truck }
  ]);
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-4">
      {resources.map((resource, index) => (
        <motion.div 
          key={resource.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <resource.icon className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <span className={`text-xs ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>{resource.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {resource.allocated}/{resource.total}
            </div>
            <div className={`w-12 rounded-full h-1.5 ${isDarkMode ? 'bg-white/10' : 'bg-gray-900/10'}`}>
              <div 
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${(resource.allocated / resource.total) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      ))}
      
      <div className={`mt-4 p-2 rounded-lg border ${
        isDarkMode 
          ? 'bg-green-500/10 border-green-500/20' 
          : 'bg-green-100 border-green-200'
      }`}>
        <div className="flex items-center gap-2">
          <CheckCircle className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          <span className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Deployment Optimized</span>
        </div>
      </div>
    </div>
  );
}

function MonitorPhaseComponent() {
  const [metrics, setMetrics] = useState({
    activeTeams: 12,
    weatherCondition: 'Stable',
    communicationStatus: 'Strong',
    resourceUtilization: 87
  });
  const { isDarkMode } = useTheme();
  const [signals, setSignals] = useState([1, 2, 3, 4, 5]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeTeams: Math.floor(Math.random() * 5) + 10,
        resourceUtilization: Math.floor(Math.random() * 20) + 75
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-xs ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>Live Teams</span>
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{metrics.activeTeams}</div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Signal className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <span className={`text-xs ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>Communication</span>
          </div>
          <div className="flex items-center gap-1">
            {signals.map((signal, index) => (
              <motion.div
                key={signal}
                className={`w-1 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-500'}`}
                style={{ height: `${8 + index * 2}px` }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className={`flex justify-between text-xs ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`}>
          <span>Resource Utilization</span>
          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{metrics.resourceUtilization}%</span>
        </div>
        <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-white/10' : 'bg-gray-900/10'}`}>
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
            animate={{ width: `${metrics.resourceUtilization}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <Satellite className={`h-3 w-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <span className={isDarkMode ? 'text-white/70' : 'text-gray-700'}>GPS Tracking Active</span>
        <div className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-green-400' : 'bg-green-500'}`} />
      </div>
    </div>
  );
}

function AnalyzePhaseComponent() {
  const [analysisData, setAnalysisData] = useState({
    responseTime: '4.2 min',
    efficiency: 94,
    reportStatus: 'Generating...',
    learningPoints: 3
  });
  const { isDarkMode } = useTheme();
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false);
      setAnalysisData(prev => ({ ...prev, reportStatus: 'Complete' }));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <span className={`text-xs ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>Response Time</span>
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{analysisData.responseTime}</div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-xs ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>Efficiency</span>
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{analysisData.efficiency}%</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className={`h-4 w-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
          <span className={`text-xs ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>Report Status</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{analysisData.reportStatus}</span>
          {isGenerating && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`w-3 h-3 border border-t-transparent rounded-full ${
                isDarkMode ? 'border-orange-400' : 'border-orange-600'
              }`}
            />
          )}
        </div>
      </div>

      <div className={`p-2 rounded-lg border ${
        isDarkMode 
          ? 'bg-purple-500/10 border-purple-500/20' 
          : 'bg-purple-100 border-purple-200'
      }`}>
        <div className="flex items-center gap-2">
          <Brain className={`h-4 w-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <span className={`text-xs ${
            isDarkMode ? 'text-purple-300' : 'text-purple-700'
          }`}>
            {analysisData.learningPoints} AI insights identified
          </span>
        </div>
      </div>
    </div>
  );
}

// Journey Section
function JourneySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { isDarkMode } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const cardTransition = { duration: 0.6 };

  return (
    <motion.section 
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
      className={`sm:p-8 ring-1 backdrop-blur rounded-3xl mx-8 pt-6 pr-6 pb-6 pl-6 ${
        isDarkMode 
          ? 'bg-white/5 ring-white/10' 
          : 'bg-yellow-400 ring-yellow-600/20'
      }`}
    >
      <div className={`flex items-center gap-2 text-sm ${
        isDarkMode ? 'text-white/70' : 'text-gray-900'
      }`}>
        <Route className="h-4 w-4" />
        <span className="font-normal font-geist">Response Lifecycle</span>
      </div>
      <div className="mt-2">
        <h2 className={`text-[44px] sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.9] font-medium tracking-tighter font-geist ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Every second counts.</h2>
        <p className={`mt-1 text-sm sm:text-base font-normal font-geist ${
          isDarkMode ? 'text-white/70' : 'text-gray-900/80'
        }`}>Coordinated response begins with intelligent preparation</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {/* Alert phase */}
        <motion.article 
          variants={cardVariants}
          transition={cardTransition}
          whileHover={{ scale: 1.02, y: -5 }}
          className={`sm:p-6 flex flex-col min-h-[420px] ring-1 backdrop-blur rounded-2xl pt-5 pr-5 pb-5 pl-5 justify-between cursor-pointer ${
            isDarkMode 
              ? 'bg-white/10 ring-white/15' 
              : 'bg-yellow-300 ring-yellow-600/30'
          }`}
        >
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="h-12 w-12 rounded-full bg-red-500/20 ring-1 ring-red-500/25 flex items-center justify-center"
              >
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </motion.div>
              <div>
                <h3 className={`text-lg font-semibold font-geist tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>01. Alert</h3>
                <p className={`text-xs font-geist uppercase tracking-wider ${
                  isDarkMode ? 'text-white/60' : 'text-gray-600'
                }`}>Threat Assessment</p>
              </div>
            </div>
            <p className={`text-sm font-geist ${
              isDarkMode ? 'text-white/80' : 'text-gray-800'
            }`}>Rapid threat assessment and resource mobilization. AI analyzes incoming data to determine severity and required response level.</p>
            
            <AlertPhaseComponent />
          </div>
          <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "25%" }}
              transition={{ duration: 2, delay: 1 }}
            />
          </div>
        </motion.article>

        {/* Deploy phase */}
        <motion.article 
          variants={cardVariants}
          transition={cardTransition}
          whileHover={{ scale: 1.02, y: -5 }}
          className={`sm:p-6 flex flex-col min-h-[420px] ring-1 backdrop-blur rounded-2xl pt-5 pr-5 pb-5 pl-5 justify-between cursor-pointer ${
            isDarkMode 
              ? 'bg-white/10 ring-white/15' 
              : 'bg-yellow-300 ring-yellow-600/30'
          }`}
        >
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="h-12 w-12 rounded-full bg-green-500/20 ring-1 ring-green-500/25 flex items-center justify-center"
              >
                <Target className="h-5 w-5 text-green-400" />
              </motion.div>
              <div>
                <h3 className={`text-lg font-semibold font-geist tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>02. Deploy</h3>
                <p className={`text-xs font-geist uppercase tracking-wider ${
                  isDarkMode ? 'text-white/60' : 'text-gray-600'
                }`}>Resource Allocation</p>
              </div>
            </div>
            <p className={`text-sm font-geist ${
              isDarkMode ? 'text-white/80' : 'text-gray-800'
            }`}>Coordinated response with real-time inventory allocation. Teams deploy with optimal resources based on current availability and predicted needs.</p>
            
            <DeployPhaseComponent />
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                <div className="h-6 w-6 rounded-full bg-white/20 ring-2 ring-white/20 flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-white/70" />
                </div>
                <div className="h-6 w-6 rounded-full bg-white/20 ring-2 ring-white/20 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-white/70" />
                </div>
                <div className="h-6 w-6 rounded-full bg-white/20 ring-2 ring-white/20 flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white/70" />
                </div>
              </div>
              <span className="text-xs text-white/60 font-geist">Personalized suggestions</span>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "50%" }}
              transition={{ duration: 2, delay: 1.5 }}
            />
          </div>
        </motion.article>

        {/* Monitor phase */}
        <motion.article 
          variants={cardVariants}
          transition={cardTransition}
          whileHover={{ scale: 1.02, y: -5 }}
          className={`sm:p-6 flex flex-col min-h-[420px] ring-1 backdrop-blur rounded-2xl pt-5 pr-5 pb-5 pl-5 justify-between cursor-pointer ${
            isDarkMode 
              ? 'bg-white/10 ring-white/15' 
              : 'bg-yellow-300 ring-yellow-600/30'
          }`}
        >
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.4)",
                    "0 0 0 10px rgba(59, 130, 246, 0)",
                    "0 0 0 0 rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-12 w-12 rounded-full bg-blue-500/20 ring-1 ring-blue-500/25 flex items-center justify-center"
              >
                <Activity className="h-5 w-5 text-blue-400" />
              </motion.div>
              <div>
                <h3 className={`text-lg font-semibold font-geist tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>03. Monitor</h3>
                <p className={`text-xs font-geist uppercase tracking-wider ${
                  isDarkMode ? 'text-white/60' : 'text-gray-600'
                }`}>Live Tracking</p>
              </div>
            </div>
            <p className={`text-sm font-geist ${
              isDarkMode ? 'text-white/80' : 'text-gray-800'
            }`}>Live tracking of weather, resources, and team status. Real-time adjustments ensure optimal response as conditions evolve.</p>
            
            <MonitorPhaseComponent />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-xs font-geist">Real-time updates</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                <span className="text-xs font-geist">Adaptive routing</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                <span className="text-xs font-geist">Seamless flow</span>
              </div>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "75%" }}
              transition={{ duration: 2, delay: 2 }}
            />
          </div>
        </motion.article>

        {/* Analyze phase */}
        <motion.article 
          variants={cardVariants}
          transition={cardTransition}
          whileHover={{ scale: 1.02, y: -5 }}
          className={`sm:p-6 flex flex-col min-h-[420px] ring-1 backdrop-blur rounded-2xl pt-5 pr-5 pb-5 pl-5 justify-between cursor-pointer ${
            isDarkMode 
              ? 'bg-white/10 ring-white/15' 
              : 'bg-yellow-300 ring-yellow-600/30'
          }`}
        >
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="h-12 w-12 rounded-full bg-purple-500/20 ring-1 ring-purple-500/25 flex items-center justify-center"
              >
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </motion.div>
              <div>
                <h3 className={`text-lg font-semibold font-geist tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>04. Analyze</h3>
                <p className={`text-xs font-geist uppercase tracking-wider ${
                  isDarkMode ? 'text-white/60' : 'text-gray-600'
                }`}>Post-Incident</p>
              </div>
            </div>
            <p className={`text-sm font-geist ${
              isDarkMode ? 'text-white/80' : 'text-gray-800'
            }`}>Post-incident reporting and system learning. Comprehensive analysis improves future response effectiveness and resource allocation.</p>
            
            <AnalyzePhaseComponent />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15">
              <Sparkles className="h-3 w-3 text-white/70" />
              <span className="text-xs text-white/70 font-geist">Smart learning</span>
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, delay: 2.5 }}
            />
          </div>
        </motion.article>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="mt-8 text-center"
      >
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition font-geist ${
            isDarkMode 
              ? 'bg-white text-neutral-900 hover:bg-white/90' 
              : 'bg-gray-900 text-white hover:bg-gray-900/90'
          }`}
        >
          <Play className="h-4 w-4" />
          Start Emergency Response
        </motion.button>
        <p className={`mt-2 text-xs font-geist ${
          isDarkMode ? 'text-white/60' : 'text-gray-600'
        }`}>Deploy systems in under 60 seconds</p>
      </motion.div>
    </motion.section>
  );
}

// FAQ Section
function FAQSection() {
  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({ 0: true });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { isDarkMode } = useTheme();

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqs = [
    {
      question: "How does DisasterIQ integrate with existing emergency systems?",
      answer: "DisasterIQ seamlessly integrates with national weather services, emergency communication networks, and existing inventory systems through secure APIs. Our platform supports standard emergency protocols and can be deployed alongside current infrastructure without disrupting ongoing operations."
    },
    {
      question: "Can multiple agencies coordinate through the platform?",
      answer: "Absolutely. DisasterIQ enables multi-agency coordination with role-based access controls, shared dashboards, and real-time collaboration tools. Fire departments, police, medical teams, and NGOs can all work together with unified visibility into resources, weather conditions, and response status."
    },
    {
      question: "How accurate is the weather prediction and impact analysis?",
      answer: "Our AI-powered weather analysis combines data from multiple meteorological sources with historical incident patterns to provide highly accurate predictions. Impact analysis includes infrastructure risk assessment, population vulnerability mapping, and resource requirement forecasting with typical accuracy rates above 85%."
    },
    {
      question: "Does the system work during network outages?",
      answer: "Yes. DisasterIQ includes offline capabilities for critical functions. Local data synchronization ensures access to essential information, inventory status, and communication tools even when connectivity is limited. The system automatically syncs when connections are restored."
    },
    {
      question: "How does AI improve disaster response efficiency?",
      answer: "Our AI analyzes patterns from thousands of past incidents to optimize resource allocation, predict equipment needs, and identify the most effective response strategies. Machine learning continuously improves decision-making speed while reducing human error in high-stress situations."
    },
    {
      question: "What makes DisasterIQ different from other emergency management systems?",
      answer: "DisasterIQ combines three critical capabilities in one platform: intelligent inventory management, advanced weather analysis, and AI-powered decision support. Unlike traditional systems that handle these separately, our integrated approach provides a complete operational picture for faster, more effective responses."
    }
  ];

  return (
    <motion.section 
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
      id="faq" 
      className="max-w-7xl sm:px-6 sm:mt-20 mr-auto mb-24 ml-auto pr-4 pl-4"
    >
      <div className={`relative overflow-hidden rounded-3xl ring-1 backdrop-blur ${
        isDarkMode 
          ? 'ring-white/10 bg-white/5' 
          : 'ring-yellow-600/20 bg-yellow-400'
      }`}>
        <div className="relative sm:p-8 pt-6 pr-6 pb-6 pl-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Intro */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-5"
            >
              <h2 className={`text-[56px] sm:text-[80px] leading-none font-semibold tracking-tighter font-geist ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Questions.</h2>
              <p className={`mt-3 text-sm sm:text-base font-geist ${
                isDarkMode ? 'text-white/80' : 'text-gray-900/80'
              }`}>
                Find answers to common questions about DisasterIQ, our emergency management platform, and how we help coordinate effective disaster response.
              </p>
              <a href="#contact" className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium tracking-tight backdrop-blur ring-1 ${
                isDarkMode 
                  ? 'text-white/90 bg-white/10 hover:bg-white/15 ring-white/15' 
                  : 'text-gray-900 bg-yellow-500 hover:bg-yellow-600 ring-yellow-600/30'
              }`}>
                <span className="font-geist">Emergency Support</span>
                <MessageCircle className="w-4 h-4 stroke-1.5" />
              </a>
            </motion.div>

            {/* Accordion */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="md:col-span-7"
            >
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className={`rounded-2xl ring-1 backdrop-blur ${
                      isDarkMode 
                        ? 'ring-white/10 bg-white/5' 
                        : 'ring-yellow-600/30 bg-yellow-300'
                    }`}
                  >
                    <button 
                      type="button" 
                      className="w-full flex items-center justify-between gap-4 p-5 text-left" 
                      aria-expanded={openItems[index] || false}
                      onClick={() => toggleItem(index)}
                    >
                      <span className={`text-base sm:text-lg font-semibold tracking-tight font-geist ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{faq.question}</span>
                      <span className="shrink-0">
                        {openItems[index] ? (
                          <Minus className={`w-5 h-5 stroke-1.5 ${
                            isDarkMode ? 'text-white/70' : 'text-gray-700'
                          }`} />
                        ) : (
                          <Plus className={`w-5 h-5 stroke-1.5 ${
                            isDarkMode ? 'text-white/70' : 'text-gray-700'
                          }`} />
                        )}
                      </span>
                    </button>
                    {openItems[index] && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`px-5 pb-5 text-sm font-geist ${
                          isDarkMode ? 'text-white/70' : 'text-gray-700'
                        }`}
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            </div>
          </div>
        </div>
    </motion.section>
  );
}

// Contact Section
function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const { isDarkMode } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section className="w-full mr-auto mb-8 ml-auto">
      <div className="max-w-7xl sm:px-6 lg:px-8 mr-auto ml-auto pr-4 pl-4">
        <div className={`relative overflow-hidden ring-1 rounded-3xl backdrop-blur ${
          isDarkMode 
            ? 'ring-white/10 bg-white/5' 
            : 'ring-yellow-600/20 bg-yellow-400'
        }`}>
          {/* Content */}
          <div className="relative z-10 md:p-12 lg:p-16 pt-8 pr-8 pb-8 pl-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Form card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-white/95 backdrop-blur ring-1 ring-white/20 shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-neutral-500 font-geist uppercase tracking-wider">DisasterIQ Support</p>
                      <h3 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 font-geist">
                        Need emergency coordination?
                      </h3>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="ct-name" className="block text-xs text-neutral-600 font-geist">Your name<span className="text-neutral-400"> *</span></label>
                      <input 
                        id="ct-name" 
                        name="name" 
                        type="text" 
                        required 
                        placeholder="Jane Doe" 
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 w-full pl-3 pr-3 py-2.5 text-sm rounded-xl ring-1 ring-black/10 focus:ring-2 focus:ring-neutral-900 outline-none bg-white placeholder:text-neutral-400 font-geist"
                      />
                    </div>
                    <div>
                      <label htmlFor="ct-email" className="block text-xs text-neutral-600 font-geist">Email<span className="text-neutral-400"> *</span></label>
                      <div className="relative mt-1">
                        <Mail className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          id="ct-email" 
                          name="email" 
                          type="email" 
                          required 
                          placeholder="you@example.com" 
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl ring-1 ring-black/10 focus:ring-2 focus:ring-neutral-900 outline-none bg-white placeholder:text-neutral-400 font-geist"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="ct-msg" className="block text-xs text-neutral-600 font-geist">Message</label>
                      <textarea 
                        id="ct-msg" 
                        name="message" 
                        rows={4} 
                        placeholder="How can we help?" 
                        value={formData.message}
                        onChange={handleChange}
                        className="mt-1 w-full resize-y pl-3 pr-3 py-2.5 text-sm rounded-xl ring-1 ring-black/10 focus:ring-2 focus:ring-neutral-900 outline-none bg-white placeholder:text-neutral-400 font-geist"
                      />
                    </div>
                    <button type="submit" className="w-full inline-flex items-center justify-center rounded-xl bg-neutral-900 text-white px-4 py-3 text-sm font-semibold hover:bg-neutral-800 transition-colors font-geist">
                      Send message
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                    <p className="text-[11px] text-neutral-500 font-geist">By submitting, you agree to our Terms and Privacy Policy.</p>
                  </form>
                </div>
              </div>

              {/* Copy + highlights */}
              <div className="lg:col-span-7">
                <h2 className={`text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-semibold tracking-tight font-geist ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Let's coordinate.</h2>
                <p className={`text-base sm:text-lg max-w-2xl mt-4 font-geist ${
                  isDarkMode ? 'text-white/80' : 'text-gray-900/80'
                }`}>
                  Tell us about your emergency management needs—system integration, training, or enterprise deployment. We respond within one business day.
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg backdrop-blur ring-1 flex items-center justify-center ${
                      isDarkMode 
                        ? 'bg-white/10 ring-white/15 text-white/90' 
                        : 'bg-yellow-500 ring-yellow-600/30 text-gray-900'
                    }`}>
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm font-geist ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Quick response</p>
                      <p className={`text-xs font-geist ${
                        isDarkMode ? 'text-white/70' : 'text-gray-700'
                      }`}>Most messages receive a reply in under 24h.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg backdrop-blur ring-1 flex items-center justify-center ${
                      isDarkMode 
                        ? 'bg-white/10 ring-white/15 text-white/90' 
                        : 'bg-yellow-500 ring-yellow-600/30 text-gray-900'
                    }`}>
                      <Route className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm font-geist ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Clear next steps</p>
                      <p className={`text-xs font-geist ${
                        isDarkMode ? 'text-white/70' : 'text-gray-700'
                      }`}>We'll follow up with a concise plan and timeline.</p>
                    </div>
                  </div>
                </div>

                {/* Direct contact card */}
                <div className="mt-8">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur ring-1 ring-white/20 shadow-lg p-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      AK
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-neutral-500 leading-none font-geist uppercase tracking-wider">Team Lead</p>
                      <p className="text-neutral-900 font-semibold tracking-tight truncate font-geist">Ava Kim</p>
                    </div>
                    <a href="mailto:emergency@disasteriq.com" className="ml-1 inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white px-3 py-2 text-xs font-semibold hover:bg-neutral-800 transition-colors font-geist">
                      Contact Direct
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Section
function FooterSection() {
  const { isDarkMode } = useTheme();

  return (
    <footer className="w-full py-8">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className={`text-sm font-geist ${
          isDarkMode ? 'text-white/70' : 'text-gray-700'
        }`}>
          Made with ❤️ By Pratyush
        </p>
      </div>
    </footer>
  );
}

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Debug: Check if motion is working
    console.log("Motion library loaded:", typeof motion);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen antialiased transition-colors duration-300 ${
        isDarkMode 
          ? 'text-white bg-[#0B0F12]' 
          : 'text-gray-900 bg-yellow-50'
      }`}
      style={{fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}
    >
      {isLoading && <PageLoader />}
      <header className="relative">
        <div className="absolute inset-0 z-0">
          {/* Animated gradient background as fallback */}
          <motion.div 
            className={`absolute inset-0 pointer-events-none ${
              isDarkMode 
                ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800' 
                : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100'
            }`}
            animate={{
              background: isDarkMode ? [
                "linear-gradient(45deg, #0f172a, #1e293b, #334155)",
                "linear-gradient(45deg, #1e293b, #334155, #475569)",
                "linear-gradient(45deg, #334155, #475569, #64748b)",
                "linear-gradient(45deg, #0f172a, #1e293b, #334155)"
              ] : [
                "linear-gradient(45deg, #f8fafc, #e2e8f0, #cbd5e1)",
                "linear-gradient(45deg, #e2e8f0, #cbd5e1, #94a3b8)",
                "linear-gradient(45deg, #cbd5e1, #94a3b8, #64748b)",
                "linear-gradient(45deg, #f8fafc, #e2e8f0, #cbd5e1)"
              ]
            }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          />
          
          <video 
            key={isDarkMode ? 'dark-video' : 'light-video'}
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover pointer-events-none"
            style={{ opacity: isDarkMode ? 0.7 : 0.4 }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          >
            <source 
              src={isDarkMode 
                ? "/3842236-hd_1920_1080_24fps.mp4" 
                : "/Strong Wind Blowing The Trees From Severe Weather 4K Stock Video - Download Video Clip Now - Australia, Gale, Storm - iStock.mp4"
              } 
              type="video/mp4" 
            />
          </video>
          
          <div className={`absolute inset-0 pointer-events-none ${
            isDarkMode 
              ? 'bg-gradient-to-b from-black/40 via-black/20 to-black/80' 
              : 'bg-gradient-to-b from-yellow-200/40 via-amber-200/30 to-orange-200/50'
          }`}></div>
        </div>
        <div className="relative z-20">
        <Navigation />
        <HeroSection />
        </div>
      </header>
      <FeaturesSection />
      <JourneySection />
      <FAQSection />
      <ContactSection />
      <FooterSection />
    </motion.div>
  );
}

// Main Export Component with Theme Provider
export default function Home() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

