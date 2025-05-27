
import { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Task, User } from '../types';

export const useTasks = (user: User | null, isLoggedIn: boolean) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasksPercentage, setCompletedTasksPercentage] = useState(0);

  useEffect(() => {
    if (user && isLoggedIn && user.username) {
      fetchUserTasks(user.username);
    } else {
      setTasks([]);
    }
  }, [user, isLoggedIn]);

  const fetchUserTasks = async (username: string) => {
    try {
      const tasksList = await firestoreService.getUserTasks(username);
      setTasks(tasksList);
      
      if (tasksList.length > 0) {
        const completedCount = tasksList.filter(task => task.isCompleted).length;
        const percentage = (completedCount / tasksList.length) * 100;
        setCompletedTasksPercentage(Math.round(percentage));
      } else {
        setCompletedTasksPercentage(0);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    if (!user || !user.username) return;
    
    try {
      const taskId = await firestoreService.addTask(user.username, task);
      const newTask = {
        ...task,
        id: taskId,
      };
      
      setTasks(prev => [...prev, newTask as Task]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const completeTask = async (id: string, onUpdateUser: (points: number, streak: number) => void) => {
    if (!user || !user.username) return;
    
    try {
      await firestoreService.updateTask(user.username, id, { isCompleted: true });
      
      setTasks(prev => {
        const updatedTasks = prev.map(task => 
          task.id === id ? { ...task, isCompleted: true } : task
        );
        
        // Calculate percentage
        const completedCount = updatedTasks.filter(task => task.isCompleted).length;
        const percentage = (completedCount / updatedTasks.length) * 100;
        setCompletedTasksPercentage(Math.round(percentage));
        
        return updatedTasks;
      });
      
      // Add points for completing task
      if (user) {
        const newPoints = (user.points || 0) + 10;
        await firestoreService.updateUser(user.username, { points: newPoints });
        onUpdateUser(newPoints, user.currentStreak);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const uncompleteTask = async (id: string) => {
    if (!user || !user.username) return;
    
    try {
      await firestoreService.updateTask(user.username, id, { isCompleted: false });
      
      setTasks(prev => {
        const updatedTasks = prev.map(task => 
          task.id === id ? { ...task, isCompleted: false } : task
        );
        
        const completedCount = updatedTasks.filter(task => task.isCompleted).length;
        const percentage = updatedTasks.length > 0 ? (completedCount / updatedTasks.length) * 100 : 0;
        setCompletedTasksPercentage(Math.round(percentage));
        
        return updatedTasks;
      });
    } catch (error) {
      console.error('Error uncompleting task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user || !user.username) return;
    
    try {
      await firestoreService.deleteTask(user.username, id);
      
      setTasks(prev => {
        const updatedTasks = prev.filter(task => task.id !== id);
        const completedCount = updatedTasks.filter(task => task.isCompleted).length;
        const percentage = updatedTasks.length > 0 ? (completedCount / updatedTasks.length) * 100 : 0;
        setCompletedTasksPercentage(Math.round(percentage));
        
        return updatedTasks;
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const reorderTasks = (sourceIndex: number, destinationIndex: number) => {
    setTasks(prev => {
      const newTasks = Array.from(prev);
      const [reorderedItem] = newTasks.splice(sourceIndex, 1);
      newTasks.splice(destinationIndex, 0, reorderedItem);
      return newTasks;
    });
  };

  return {
    tasks,
    completedTasksPercentage,
    addTask,
    completeTask,
    uncompleteTask,
    deleteTask,
    reorderTasks
  };
};
