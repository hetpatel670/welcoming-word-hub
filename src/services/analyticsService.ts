import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { getFirebaseAnalytics } from '../config/firebase';

export class AnalyticsService {
  private analytics = getFirebaseAnalytics();

  // Track user login
  trackLogin(method: string = 'email') {
    try {
      logEvent(this.analytics, 'login', {
        method: method
      });
    } catch (error) {
      console.error('Error tracking login:', error);
    }
  }

  // Track user registration
  trackSignUp(method: string = 'email') {
    try {
      logEvent(this.analytics, 'sign_up', {
        method: method
      });
    } catch (error) {
      console.error('Error tracking sign up:', error);
    }
  }

  // Track task creation
  trackTaskCreated(taskCategory?: string) {
    try {
      logEvent(this.analytics, 'task_created', {
        category: taskCategory || 'general'
      });
    } catch (error) {
      console.error('Error tracking task creation:', error);
    }
  }

  // Track task completion
  trackTaskCompleted(taskCategory?: string, points?: number) {
    try {
      logEvent(this.analytics, 'task_completed', {
        category: taskCategory || 'general',
        points: points || 0
      });
    } catch (error) {
      console.error('Error tracking task completion:', error);
    }
  }

  // Track streak milestone
  trackStreakMilestone(streakCount: number) {
    try {
      logEvent(this.analytics, 'streak_milestone', {
        streak_count: streakCount
      });
    } catch (error) {
      console.error('Error tracking streak milestone:', error);
    }
  }

  // Track badge earned
  trackBadgeEarned(badgeName: string, badgeType: string) {
    try {
      logEvent(this.analytics, 'badge_earned', {
        badge_name: badgeName,
        badge_type: badgeType
      });
    } catch (error) {
      console.error('Error tracking badge earned:', error);
    }
  }

  // Track profile visibility change
  trackProfileVisibilityChange(isPublic: boolean) {
    try {
      logEvent(this.analytics, 'profile_visibility_changed', {
        is_public: isPublic
      });
    } catch (error) {
      console.error('Error tracking profile visibility change:', error);
    }
  }

  // Track onboarding completion
  trackOnboardingCompleted() {
    try {
      logEvent(this.analytics, 'onboarding_completed');
    } catch (error) {
      console.error('Error tracking onboarding completion:', error);
    }
  }

  // Track username set
  trackUsernameSet() {
    try {
      logEvent(this.analytics, 'username_set');
    } catch (error) {
      console.error('Error tracking username set:', error);
    }
  }

  // Set user ID for analytics
  setAnalyticsUserId(userId: string) {
    try {
      setUserId(this.analytics, userId);
    } catch (error) {
      console.error('Error setting analytics user ID:', error);
    }
  }

  // Set user properties
  setUserProperties(properties: { [key: string]: any }) {
    try {
      setUserProperties(this.analytics, properties);
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  // Track page view
  trackPageView(pageName: string) {
    try {
      logEvent(this.analytics, 'page_view', {
        page_title: pageName
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track custom event
  trackCustomEvent(eventName: string, parameters?: { [key: string]: any }) {
    try {
      logEvent(this.analytics, eventName, parameters);
    } catch (error) {
      console.error('Error tracking custom event:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();