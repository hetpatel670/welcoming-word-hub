
import { Task, User } from '../types';
import { useToast } from '@/hooks/use-toast';
import { analyticsService } from '../services/analyticsService';

interface UseEnhancedTasksProps {
  tasks: Task[];
  user: User | null | undefined;
  baseAddTask: (task: Omit<Task, 'id'>) => void;
  baseCompleteTask: (id: string, callback?: (newPoints: number, oldStreak: number) => Promise<void>) => void;
  checkAndUpdateStreak: (updatedTasks: Task[]) => Promise<number>;
  setCurrentStreak: (streak: number) => void;
  updateBadges: (newStreak: number) => void;
  evaluateAndAwardSpecialBadge: (taskName: string, userStats: { completedTasks: number; currentStreak: number; points: number; }) => Promise<any>;
}

export const useEnhancedTasks = ({
  tasks,
  user,
  baseAddTask,
  baseCompleteTask,
  checkAndUpdateStreak,
  setCurrentStreak,
  updateBadges,
  evaluateAndAwardSpecialBadge
}: UseEnhancedTasksProps) => {
  const { toast } = useToast();

  // Enhanced add task function
  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      await baseAddTask(task);
      
      // Track task creation
      if (typeof analyticsService?.trackTaskCreated === 'function') {
        analyticsService.trackTaskCreated(task.category || 'general');
      }
      
      toast({
        title: "Task added successfully",
        description: `"${task.name}" has been added to your tasks`,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error adding task",
        description: "Failed to add task. Please try again.",
      });
    }
  };

  // Enhanced complete task function
  const completeTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    
    try {
      await baseCompleteTask(id, async (newPoints: number, oldStreak: number) => {
        if (user && task) {
          const updatedTasks = tasks.map(task => 
            task.id === id ? { ...task, isCompleted: true } : task
          );
          
          // Check and update streak
          const newStreak = await checkAndUpdateStreak(updatedTasks);
          if (newStreak) {
            setCurrentStreak(newStreak);
            updateBadges(newStreak);
            
            // Award badge for completing task
            const badge = await evaluateAndAwardSpecialBadge(task.name, {
              completedTasks: updatedTasks.filter(t => t.isCompleted).length,
              currentStreak: newStreak,
              points: newPoints
            });
            
            if (badge) {
              toast({
                title: "🏆 New Badge Earned!",
                description: `You've earned the "${badge.name}" badge!`,
              });
            }
          }
        }
      });

      toast({
        title: "Task completed!",
        description: task ? `Great job completing "${task.name}"!` : "Task completed successfully!",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error completing task",
        description: "Failed to complete task. Please try again.",
      });
    }
  };

  return {
    addTask,
    completeTask
  };
};
