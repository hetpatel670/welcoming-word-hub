import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { Task, User } from '../types';

export class FirestoreService {
  private db = getFirebaseFirestore();

  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const userDocRef = doc(this.db, 'users', username);
      const userDoc = await getDoc(userDocRef);
      return !userDoc.exists();
    } catch (error) {
      console.error('Error checking username availability:', error);
      // If we get a permission error, assume username is taken for security
      return false;
    }
  }

  // Create user document with username as ID
  async createUser(username: string, userData: Omit<User, 'id'>): Promise<void> {
    try {
      const userDocRef = doc(this.db, 'users', username);
      await setDoc(userDocRef, {
        ...userData,
        id: username,
        username
      });

      // Create initial streak document
      const streakDocRef = doc(this.db, 'users', username, 'streaks', 'current');
      await setDoc(streakDocRef, {
        currentStreak: 0,
        lastCompletedDate: new Date()
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const userDocRef = doc(this.db, 'users', username);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return {
          id: username,
          ...userDoc.data()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  // Update user data
  async updateUser(username: string, updates: Partial<User>): Promise<void> {
    try {
      const userDocRef = doc(this.db, 'users', username);
      await updateDoc(userDocRef, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Migrate user from UID to username (for existing users)
  async migrateUserToUsername(uid: string, username: string): Promise<void> {
    try {
      const batch = writeBatch(this.db);

      // Get old user data
      const oldUserDocRef = doc(this.db, 'users', uid);
      const oldUserDoc = await getDoc(oldUserDocRef);
      
      if (!oldUserDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = oldUserDoc.data();

      // Create new user document with username as ID
      const newUserDocRef = doc(this.db, 'users', username);
      batch.set(newUserDocRef, {
        ...userData,
        id: username,
        username
      });

      // Migrate tasks
      const tasksCollectionRef = collection(this.db, 'users', uid, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollectionRef);
      
      tasksSnapshot.forEach((taskDoc) => {
        const newTaskDocRef = doc(this.db, 'users', username, 'tasks', taskDoc.id);
        batch.set(newTaskDocRef, taskDoc.data());
      });

      // Migrate streaks
      const streaksCollectionRef = collection(this.db, 'users', uid, 'streaks');
      const streaksSnapshot = await getDocs(streaksCollectionRef);
      
      streaksSnapshot.forEach((streakDoc) => {
        const newStreakDocRef = doc(this.db, 'users', username, 'streaks', streakDoc.id);
        batch.set(newStreakDocRef, streakDoc.data());
      });

      // Delete old user document and subcollections
      batch.delete(oldUserDocRef);
      
      // Delete old tasks
      tasksSnapshot.forEach((taskDoc) => {
        batch.delete(taskDoc.ref);
      });

      // Delete old streaks
      streaksSnapshot.forEach((streakDoc) => {
        batch.delete(streakDoc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error migrating user to username:', error);
      throw error;
    }
  }

  // Task operations
  async getUserTasks(username: string): Promise<Task[]> {
    try {
      const tasksCollectionRef = collection(this.db, 'users', username, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollectionRef);
      const tasks: Task[] = [];
      
      tasksSnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async addTask(username: string, task: Omit<Task, 'id'>): Promise<string> {
    try {
      const tasksCollectionRef = collection(this.db, 'users', username, 'tasks');
      const newTaskRef = doc(tasksCollectionRef);
      
      await setDoc(newTaskRef, {
        ...task,
        id: newTaskRef.id,
      });
      
      return newTaskRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  async updateTask(username: string, taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const taskDocRef = doc(this.db, 'users', username, 'tasks', taskId);
      await updateDoc(taskDocRef, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(username: string, taskId: string): Promise<void> {
    try {
      const taskDocRef = doc(this.db, 'users', username, 'tasks', taskId);
      await deleteDoc(taskDocRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Streak operations
  async getUserStreak(username: string): Promise<any> {
    try {
      const streakDocRef = doc(this.db, 'users', username, 'streaks', 'current');
      const streakDoc = await getDoc(streakDocRef);
      
      if (streakDoc.exists()) {
        return streakDoc.data();
      }
      
      // Create initial streak if it doesn't exist
      const initialStreak = {
        currentStreak: 0,
        lastCompletedDate: new Date()
      };
      await setDoc(streakDocRef, initialStreak);
      return initialStreak;
    } catch (error) {
      console.error('Error fetching streak:', error);
      return { currentStreak: 0, lastCompletedDate: new Date() };
    }
  }

  async updateStreak(username: string, streakData: any): Promise<void> {
    try {
      const streakDocRef = doc(this.db, 'users', username, 'streaks', 'current');
      await updateDoc(streakDocRef, streakData);
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  // Get public profiles
  async getPublicProfiles(): Promise<any[]> {
    try {
      const usersCollectionRef = collection(this.db, 'users');
      const publicProfilesQuery = query(usersCollectionRef, where('isPublicProfile', '==', true));
      const snapshot = await getDocs(publicProfilesQuery);
      
      const profiles: any[] = [];
      snapshot.forEach((doc) => {
        profiles.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return profiles;
    } catch (error) {
      console.error('Error fetching public profiles:', error);
      return [];
    }
  }
}

export const firestoreService = new FirestoreService();