import { useState, useEffect, useCallback } from 'react';
import { getFirebaseAuth, getFirebaseFirestore } from '../config/firebase';
import type { Task, User } from '../types';
import firebase from '@react-native-firebase/app'; // For FieldValue

export const useTasks = (user: User | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const firestore = getFirebaseFirestore();
  const auth = getFirebaseAuth(); // Though not directly used in all functions, good to have if needed for user ID consistency

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tasksCollection = firestore.collection('users').doc(user.id).collection('tasks');
      // const q = query(tasksCollection, orderBy('createdAt', 'desc')); // Original web query
      // For React Native Firebase, orderBy is chained:
      const querySnapshot = await tasksCollection.orderBy('createdAt', 'desc').get();
      
      const userTasks = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure dueDate is a string if it's a Timestamp from Firestore
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate().toISOString() : data.dueDate,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as Task;
      });
      setTasks(userTasks);
    } catch (e: any) {
      console.error("Error fetching tasks: ", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [user, firestore]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'isCompleted'>): Promise<string | null> => {
    if (!user) {
      setError(new Error("User not authenticated to add task."));
      return null;
    }
    setLoading(true);
    try {
      const tasksCollection = firestore.collection('users').doc(user.id).collection('tasks');
      const newTaskData = {
        ...taskData,
        userId: user.id,
        isCompleted: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        // Ensure dueDate is compatible, e.g., a Firestore Timestamp or ISO string
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      };
      const docRef = await tasksCollection.add(newTaskData);
      // Add task to local state or re-fetch
      // For simplicity, re-fetching after add/update/delete
      await fetchTasks(); 
      return docRef.id;
    } catch (e: any) {
      console.error("Error adding task: ", e);
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    if (!user) {
      setError(new Error("User not authenticated to update task."));
      return false;
    }
    setLoading(true);
    try {
      const taskDocRef = firestore.collection('users').doc(user.id).collection('tasks').doc(taskId);
      // Ensure dueDate is correctly formatted if present in updates
      if (updates.dueDate) {
        updates.dueDate = new Date(updates.dueDate);
      }
      await taskDocRef.update(updates);
      await fetchTasks(); // Re-fetch
      return true;
    } catch (e: any) {
      console.error("Error updating task: ", e);
      setError(e);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const completeTask = async (taskId: string, isCompleted: boolean, onUpdateUser?: (points: number, streak?: number) => void): Promise<boolean> => {
    if (!user) {
      setError(new Error("User not authenticated to complete task."));
      return false;
    }
    setLoading(true);
    try {
      const taskDocRef = firestore.collection('users').doc(user.id).collection('tasks').doc(taskId);
      await taskDocRef.update({ 
        isCompleted,
        completedAt: isCompleted ? firebase.firestore.FieldValue.serverTimestamp() : null 
      });
      
      // If a callback for updating user points/streak is provided
      if (isCompleted && onUpdateUser) {
        // This logic might be better suited in useStreak or AppContext directly
        // For now, assuming some points are awarded per task.
        // const pointsEarned = 10; 
        // onUpdateUser(pointsEarned); // Streak update would be more complex
      }
      
      await fetchTasks(); // Re-fetch tasks
      return true;
    } catch (e: any) {
      console.error("Error completing task: ", e);
      setError(e);
      return false;
    } finally {
      setLoading(false);
    }
  };


  const deleteTask = async (taskId: string): Promise<boolean> => {
    if (!user) {
      setError(new Error("User not authenticated to delete task."));
      return false;
    }
    setLoading(true);
    try {
      const taskDocRef = firestore.collection('users').doc(user.id).collection('tasks').doc(taskId);
      await taskDocRef.delete();
      await fetchTasks(); // Re-fetch
      return true;
    } catch (e: any) {
      console.error("Error deleting task: ", e);
      setError(e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask, completeTask };
};
