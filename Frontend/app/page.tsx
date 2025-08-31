"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import { 
  Shield, 
  MapPin, 
  Users, 
  Activity, 
  CheckCircle, 
  ArrowRight, 
  Globe, 
  Database, 
  Zap,
  Heart,
  Building,
  Target
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 }
};

const cardVariants = {
  rest: { 
    scale: 1, 
    y: 0, 
    boxShadow: "0 4px 6px rgba(52, 227, 58, 0.1)" 
  },
  hover: { 
    scale: 1.02, 
    y: -5, 
    boxShadow: "0 20px 25px rgba(52, 227, 58, 0.2)",
    transition: { duration: 0.2 }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Counter component for statistics
function Counter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(countRef);

  useEffect(() => {
    if (inView) {
      let startTime: number;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }
  }, [inView, end, duration]);

  return <span ref={countRef}>{count.toLocaleString()}</span>;
}

// Navigation Component
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        mounted && isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-black/20 backdrop-blur-sm'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Shield className="h-8 w-8 text-green-500" />
            <span className={`text-xl font-bold transition-colors ${
              mounted && isScrolled ? 'text-gray-900' : 'text-white'
            }`}>DisasterGuard</span>
          </motion.div>
          
          <motion.div 
            className="hidden md:flex space-x-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.span 
              className={`font-medium transition-colors ${
                mounted && isScrolled ? 'text-gray-600' : 'text-gray-200'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Emergency Response Platform
            </motion.span>
          </motion.div>
          
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <motion.section 
      className="min-h-screen relative flex items-center justify-center overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/3842236-hd_1920_1080_24fps.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        {/* Green gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-green-600/20 to-green-400/30"></div>
      </div>

      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-green-400/20 rounded-full backdrop-blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 relative z-10">
        <div className="text-center">
          <motion.div 
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg"
              variants={itemVariants}
            >
              Transform{" "}
              <motion.span 
                className="text-green-400 glow-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 2 }}
                style={{
                  textShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
                }}
              >
                Disaster Response
              </motion.span>{" "}
              in Real-Time
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-200 mb-8 leading-relaxed drop-shadow-md text-justify max-w-3xl mx-auto"
              variants={itemVariants}
            >
              Comprehensive disaster management platform for India enabling real-time coordination, 
              resource tracking, and emergency response for government agencies and relief organizations.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
            >
              <motion.button 
                className="bg-green-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl hover:shadow-green-500/25"
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(34, 197, 94, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                }}
                onClick={() => window.location.href = '/dashboard'}
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button 
                className="border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                whileHover={{ scale: 1.05, borderColor: "rgba(255, 255, 255, 0.6)" }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center backdrop-blur-sm">
          <motion.div 
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <p className="text-white/70 text-sm mt-2 font-medium">Scroll down</p>
      </motion.div>
    </motion.section>
  );
}

// Features Section
function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  const features = [
    {
      icon: Activity,
      title: "Real-time Inventory Tracking",
      description: "Monitor resources, supplies, and equipment across multiple warehouses with live updates and automated alerts."
    },
    {
      icon: Users,
      title: "Disaster Response Coordination",
      description: "Coordinate teams, manage operations, and track relief efforts with integrated communication tools."
    },
    {
      icon: MapPin,
      title: "Resource Distribution Management",
      description: "Optimize distribution routes, track deliveries, and ensure resources reach affected areas efficiently."
    }
  ];

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gradient-to-br from-green-500 via-green-400 to-green-300 relative overflow-hidden"
      id="features"
    >
      {/* Geometric background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Features for Emergency Response
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Advanced tools designed specifically for disaster management teams to coordinate, 
            track, and respond effectively during emergencies.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 text-center hover:bg-white/30 transition-all duration-300"
              variants={cardVariants}
              initial="rest"
              whileHover="hover"
              custom={index}
            >
              <motion.div
                className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-white/90 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.button 
            className="bg-white text-green-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Interactive Demo
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Statistics Section
function StatisticsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  const stats = [
    { number: 500, label: "Disasters Managed", icon: Shield },
    { number: 10000, label: "Resources Distributed", icon: Target },
    { number: 250000, label: "Lives Impacted", icon: Heart },
    { number: 150, label: "Partner Organizations", icon: Building },
  ];

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gradient-to-br from-green-100 via-white to-green-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Making a Real Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform has been instrumental in coordinating disaster response efforts across India, 
            helping save lives and optimize resource allocation.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                animate={inView ? { 
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2 
                }}
              >
                <stat.icon className="h-8 w-8 text-green-500" />
              </motion.div>
              <motion.div 
                className="text-4xl font-bold text-gray-900 mb-2"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Counter end={stat.number} />+
              </motion.div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

// Technology Stack Section
function TechnologySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  const technologies = [
    { name: "Next.js", color: "text-gray-900" },
    { name: "FastAPI", color: "text-green-500" },
    { name: "PostgreSQL", color: "text-blue-500" },
    { name: "Tailwind", color: "text-cyan-500" },
    { name: "Framer Motion", color: "text-purple-500" },
    { name: "WebSockets", color: "text-red-500" },
  ];

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gray-900 relative overflow-hidden"
    >
      {/* Dot pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Built with Modern Technology
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Leveraging cutting-edge technologies to ensure scalability, reliability, 
            and real-time performance when it matters most.
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.div 
            className="relative w-80 h-80"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1 }}
          >
            {/* Center circle */}
            <motion.div 
              className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Zap className="h-8 w-8 text-white" />
            </motion.div>
            
            {/* Orbiting technology logos */}
            {technologies.map((tech, index) => {
              const angle = (index * 360) / technologies.length;
              return (
                <motion.div
                  key={tech.name}
                  className="absolute w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    rotate: 360,
                    x: Math.cos((angle * Math.PI) / 180) * 120 - 32,
                    y: Math.sin((angle * Math.PI) / 180) * 120 - 32,
                  }}
                  transition={{
                    rotate: {
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    x: {
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    y: {
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    },
                  }}
                >
                  <span className={`text-sm font-bold ${tech.color}`}>
                    {tech.name.slice(0, 2)}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div 
          className="text-center mt-16 grid grid-cols-2 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {[
            { metric: "99.9%", label: "Uptime" },
            { metric: "<500ms", label: "Response Time" },
            { metric: "Real-time", label: "Data Sync" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <div className="text-2xl font-bold text-green-400 mb-2">{item.metric}</div>
              <div className="text-gray-300">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

// CTA Section
function CTASection() {
  const [email, setEmail] = useState("");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.section 
      ref={ref}
      className="py-20 bg-gradient-to-r from-green-500 via-green-400 to-green-500 relative overflow-hidden"
    >
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-green-600 via-green-500 to-green-400 opacity-50"
        animate={{
          background: [
            "linear-gradient(45deg, #10b981, #34d399, #6ee7b7)",
            "linear-gradient(45deg, #34d399, #6ee7b7, #10b981)",
            "linear-gradient(45deg, #6ee7b7, #10b981, #34d399)",
          ],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Disaster Management?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join leading organizations across India in modernizing emergency response. 
            Get early access to our platform.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            whileFocus={{ scale: 1.02 }}
          />
          <motion.button 
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Add ripple effect
              console.log('Email signup:', email);
            }}
          >
            Get Started
          </motion.button>
        </motion.div>

        <motion.p 
          className="text-white/80 text-sm"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          No spam, unsubscribe at any time. By signing up you agree to our terms.
        </motion.p>
      </div>
    </motion.section>
  );
}

// Main component
export default function Home() {
  return (
    <motion.div 
      className="min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <StatisticsSection />
      <TechnologySection />
      <CTASection />
    </motion.div>
  );
}
