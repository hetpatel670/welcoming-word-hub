// Placeholder types for the application

// User type for authentication
export type User = {
  id: string;
  email?: string;
  username?: string;
  // Add other user-specific fields as necessary
  // e.g., displayName, photoURL from Firebase Auth
};

// Task type
export type Task = {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: Date | string; // Or timestamp
  userId: string; // To associate task with a user
  // Add other task-specific fields
};

// Badge type
export type Badge = {
  id: string;
  name: string;
  description: string;
  iconUrl?: string; // URL to the badge icon
  criteria: string; // Description of how the badge is earned
  // Add other badge-specific fields
};

// UserProfile type
export type UserProfile = {
  userId: string; // Corresponds to User.id
  username?: string;
  bio?: string;
  avatarUrl?: string;
  points?: number;
  level?: number;
  // Add other profile-specific fields
};

// Potentially, a type for EarnedBadges if it differs from Badge
export type EarnedBadge = {
  badgeId: string; // Corresponds to Badge.id
  userId: string;
  earnedAt: Date | string; // Or timestamp
  // Any specific properties for an earned instance
};

// You can add more types here as the application grows
// e.g., AppSettings, Notification, etc.
