import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Platform } from 'react-native';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../contexts/AppContext'; // Adjusted path
import { tw } from '../lib/utils';
import { Target, CheckCircle, Calendar, Award, ChevronRight, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    icon: Target,
    title: 'Welcome to GoalGetter!',
    description: "Let's help you achieve your daily goals and build amazing streaks.",
  },
  {
    icon: CheckCircle,
    title: 'Track Your Progress',
    description: 'Easily log your completed tasks and see your accomplishments grow.',
  },
  {
    icon: Calendar,
    title: 'Build Streaks',
    description: 'Stay consistent and build motivating streaks for your habits.',
  },
  {
    icon: Award,
    title: 'Earn Badges',
    description: 'Unlock cool badges as you reach milestones and conquer challenges.',
  },
];

interface OnboardingStepProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isActive: boolean;
}

const OnboardingStepComponent: React.FC<OnboardingStepProps> = ({ icon: Icon, title, description, isActive }) => {
  const stepAnim = useRef(new Animated.Value(0)).current; // For individual step animation

  useEffect(() => {
    if (isActive) {
      Animated.spring(stepAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      // Optionally, define an animation for when it becomes inactive
      Animated.timing(stepAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, stepAnim]);

  const translateY = stepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const opacity = stepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const iconScale = stepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const iconRotate = stepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '0deg'],
  });

  if (!isActive) return null; // Render nothing if not active (or animate out)

  return (
    <Animated.View style={[tw`absolute w-full items-center px-6`, { opacity, transform: [{ translateY }] }]}>
      <Animated.View style={{ transform: [{ scale: iconScale }, { rotate: iconRotate }] }}>
        <Icon size={80} style={tw`text-slate-700 mb-6`} />
      </Animated.View>
      <Text style={tw`text-3xl font-bold text-slate-900 mb-3 text-center`}>{title}</Text>
      <Text style={tw`text-lg text-slate-600 text-center leading-relaxed`}>{description}</Text>
    </Animated.View>
  );
};

const OnboardingScreen: React.FC = (/* { navigation } */) => {
  const { setShowOnboarding } = useAppContext(); // Assuming context provides this setter
  const [currentStep, setCurrentStep] = useState(0);

  const containerAnim = useRef(new Animated.Value(0)).current; // For overall container animation
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial animation for the container and logo
    Animated.parallel([
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoAnim, {
        toValue: 1,
        tension: 30,
        friction: 5,
        delay: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [containerAnim, logoAnim]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finish onboarding
      if (setShowOnboarding) {
        setShowOnboarding(false);
      }
      // navigation.replace('Home'); // Or Login, depending on auth state
    }
  };

  const handleSkip = () => {
    if (setShowOnboarding) {
      setShowOnboarding(false);
    }
    // navigation.replace('Home'); // Or Login
  };

  const containerOpacity = containerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const containerTranslateY = containerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });
   const logoOpacity = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });


  return (
    <Animated.View style={[tw`flex-1 bg-slate-50 justify-between items-center p-6`, { opacity: containerOpacity, transform: [{ translateY: containerTranslateY }] }]}>
      {/* Header/Logo section */}
      <View style={tw`absolute top-10 ${Platform.OS === 'ios' ? 'pt-8' : 'pt-4'}`}>
        <Animated.View style={{transform: [{scale: logoScale}], opacity: logoOpacity }}>
          {/* Replace with your app's logo if you have one */}
          <Award size={40} style={tw`text-slate-700`} /> 
        </Animated.View>
      </View>

      {/* Skip Button */}
      <View style={tw`absolute top-10 right-6 ${Platform.OS === 'ios' ? 'pt-8' : 'pt-4'}`}>
        {currentStep < onboardingSteps.length -1 && (
          <Button variant="ghost" onPress={handleSkip} style={tw`px-2 py-1`}>
            <Text style={tw`text-slate-600`}>Skip</Text>
          </Button>
        )}
      </View>

      {/* Onboarding Steps Area */}
      <View style={tw`flex-1 justify-center items-center w-full mt-20 mb-20`}>
        {onboardingSteps.map((step, index) => (
          <OnboardingStepComponent
            key={index}
            icon={step.icon}
            title={step.title}
            description={step.description}
            isActive={currentStep === index}
          />
        ))}
      </View>

      {/* Navigation and Indicators */}
      <View style={tw`w-full items-center pb-8`}>
        {/* Step Indicators */}
        <View style={tw`flex-row justify-center mb-8`}>
          {onboardingSteps.map((_, index) => {
            const dotAnim = useRef(new Animated.Value(0.5)).current;
            useEffect(() => {
                Animated.spring(dotAnim, {
                    toValue: currentStep === index ? 1 : 0.5,
                    friction: 5,
                    tension: 80,
                    useNativeDriver: true,
                }).start();
            }, [currentStep, dotAnim, index]);

            const dotScale = dotAnim; // Directly use the animated value for scale

            return (
              <Animated.View
                key={index}
                style={[
                  tw`h-2.5 w-2.5 rounded-full mx-1.5`,
                  currentStep === index ? tw`bg-slate-700` : tw`bg-slate-300`,
                  { transform: [{ scale: dotScale }] }
                ]}
              />
            );
          })}
        </View>

        {/* Next/Get Started Button */}
        <Button onPress={handleNext} style={tw`w-full py-3`} size="lg">
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-white font-semibold text-lg mr-2`}>
              {currentStep === onboardingSteps.length - 1 ? "Let's Get Started!" : 'Next'}
            </Text>
            {currentStep < onboardingSteps.length - 1 && <ChevronRight size={20} style={tw`text-white`} />}
          </View>
        </Button>
      </View>
    </Animated.View>
  );
};

export default OnboardingScreen;
