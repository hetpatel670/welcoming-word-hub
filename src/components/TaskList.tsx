
import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { Plus } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';

const TaskList = () => {
  const { tasks, user, currentStreak, setActiveTab } = useAppContext();
  const [listHeight, setListHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize the sorted tasks to prevent unnecessary re-renders
  const sortedTasks = useMemo(() => {
    // Sort tasks with incomplete tasks first, then by name
    return [...tasks].sort((a, b) => {
      // First sort by completion status
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // Then sort by name
      return a.name.localeCompare(b.name);
    });
  }, [tasks]);

  // Use useCallback to prevent unnecessary function recreations
  const handleAddTaskClick = useCallback(() => {
    setActiveTab('add');
  }, [setActiveTab]);
  
  // Calculate the available height for the list
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        setListHeight(containerHeight - 20); // Subtract padding
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  // Render each task item in the virtualized list
  const renderTask = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const task = sortedTasks[index];
    return (
      <div style={style}>
        <TaskItem key={task.id} task={task} />
      </div>
    );
  }, [sortedTasks]);

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="text-pink-400 text-xl sm:text-2xl mr-2">🔥</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Today</h2>
        </div>
        <div className="text-app-purple text-base sm:text-lg font-bold flex items-center">
          <span className="hidden sm:inline">Streak: </span>
          <span className="inline sm:hidden">🔄 </span>
          <span className="ml-1">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</span>
        </div>
      </div>

      <Button 
        className="w-full bg-app-teal hover:bg-app-teal/90 text-black font-medium mb-5 sm:mb-6 rounded-xl h-12 sm:h-14 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        onClick={handleAddTaskClick}
      >
        <Plus className="mr-2" size={18} /> Add Task
      </Button>

      <div 
        ref={containerRef} 
        className="flex-1 overflow-hidden pb-20"
        aria-label="Your tasks"
      >
        {sortedTasks.length > 0 ? (
          <List
            height={listHeight}
            width="100%"
            itemCount={sortedTasks.length}
            itemSize={80} // Adjust based on your TaskItem height
            overscanCount={3} // Pre-render items for smoother scrolling
          >
            {renderTask}
          </List>
        ) : (
          <div className="text-center text-gray-400 mt-10 p-4">
            <p className="text-sm sm:text-base">No tasks yet. Add a new task to get started!</p>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">Complete tasks daily to build your streak and earn points.</p>
          </div>
        )}
      </div>

      {user && (
        <div className="mt-auto pt-4 pb-2 text-center bg-app-darkblue bg-opacity-80 backdrop-blur-sm rounded-lg">
          <div className="flex items-center justify-center">
            <span className="text-pink-400 text-lg sm:text-xl mr-1">🏆</span> 
            <span className="text-white text-sm sm:text-base font-medium">{user.points} Points</span>
            <span className="mx-2 text-gray-500">|</span>
            <span className="text-app-teal text-lg sm:text-xl mr-1">🔥</span>
            <span className="text-white text-sm sm:text-base font-medium">{currentStreak}-Day Streak</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
