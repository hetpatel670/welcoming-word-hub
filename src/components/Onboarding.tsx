
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight, Target, Calendar, Award, ArrowRight, Sparkles } from 'lucide-react';

const OnboardingStep = ({ 
  title, 
  description, 
  icon, 
  isActive,
  showArrow 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  isActive: boolean;
  showArrow?: boolean;
}) => (
  <motion.div 
    className={`relative p-4 sm:p-6 rounded-xl ${isActive ? 'bg-app-lightblue border-2 border-app-teal' : 'bg-app-darkblue/50'} mb-3 sm:mb-4`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: isActive ? 1 : 0.6, 
      y: 0,
      scale: isActive ? 1.02 : 0.98
    }}
    transition={{ 
      duration: 0.4,
      type: isActive ? "spring" : "tween",
      stiffness: 100,
      damping: 15
    }}
  >
    <div className="flex items-start">
      <motion.div 
        className="mr-3 sm:mr-4 text-app-teal relative"
        initial={{ scale: 0.9 }}
        animate={{ 
          scale: isActive ? 1.1 : 1,
          rotate: isActive ? [0, -10, 10, -5, 5, 0] : 0
        }}
        transition={{ 
          duration: isActive ? 0.6 : 0.3,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          type: "spring"
        }}
      >
        {icon}
        {isActive && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles size={12} className="text-yellow-400" />
          </motion.div>
        )}
      </motion.div>
      <div className="flex-1">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-gray-400">{description}</p>
      </div>
      {showArrow && isActive && (
        <motion.div
          className="ml-4 text-app-teal"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight size={20} />
          </motion.div>
        </motion.div>
      )}
    </div>
    {isActive && (
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-app-teal/10 to-transparent pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    )}
  </motion.div>
);

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to DoTogether!",
      description: "Transform your life with small, consistent actions. Track habits, build streaks, and achieve your goals together with our engaging and intuitive app.",
      icon: <Target size={24} />,
      showArrow: true
    },
    {
      title: "Create Smart Micro-Tasks",
      description: "Break down big goals into bite-sized, achievable tasks. Set reminders and make progress every single day.",
      icon: <CheckCircle size={24} />,
      showArrow: true
    },
    {
      title: "Build Powerful Streaks",
      description: "Consistency is key! Maintain your streak by completing tasks daily. Watch your momentum grow and earn bonus points!",
      icon: <Calendar size={24} />,
      showArrow: true
    },
    {
      title: "Unlock Amazing Badges",
      description: "Celebrate your achievements! Earn special badges, track your progress, and share your success with others.",
      icon: <Award size={24} />,
      showArrow: false
    }
  ];
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  return (
    <div className="min-h-screen bg-app-darkblue flex flex-col p-4 sm:p-6">
      <motion.div 
        className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 sm:mb-8">
          <motion.div 
            className="w-16 h-16 sm:w-20 sm:h-20 bg-app-lightblue rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
          >
            <div className="flex flex-col">
              <span className="h-1.5 sm:h-2 w-8 sm:w-10 bg-blue-400 rounded-full mb-1"></span>
              <span className="h-1.5 sm:h-2 w-8 sm:w-10 bg-blue-400 rounded-full mb-1"></span>
              <span className="h-1.5 sm:h-2 w-5 sm:w-6 bg-pink-400 rounded-full"></span>
            </div>
          </motion.div>
        </div>
        
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <AnimatePresence mode="wait">
            {steps.map((s, i) => (
              <OnboardingStep 
                key={i} 
                title={s.title} 
                description={s.description} 
                icon={s.icon}
                isActive={i === step}
                showArrow={s.showArrow}
              />
            ))}
          </AnimatePresence>
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-gray-400 hover:text-white text-sm sm:text-base"
          >
            Skip
          </Button>
          
          <div className="flex space-x-2">
            {steps.map((_, i) => (
              <motion.div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i === step ? 'bg-app-teal' : 'bg-gray-600'}`}
                initial={{ scale: i === step ? 0.8 : 1 }}
                animate={{ scale: i === step ? 1.2 : 1 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          
          <Button 
            onClick={handleNext}
            className="bg-app-teal hover:bg-app-teal/90 text-black flex items-center text-sm sm:text-base"
          >
            {step === steps.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
