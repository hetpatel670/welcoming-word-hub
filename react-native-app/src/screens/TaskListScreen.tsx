import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { tw } from '../lib/utils'; // Adjusted path
import { Button } from '../components/ui/Button'; // Adjusted path
import TaskItem from '../components/TaskItem'; // Adjusted path
import TaskFilters from '../components/TaskFilters'; // Adjusted path
import { useAppContext } from '../contexts/AppContext'; // Adjusted path
import { useTasks } from '../hooks/useTasks'; // Import useTasks
import type { Task } from '../types'; // Adjusted path
import { PlusCircle, LayoutGrid, BarChart3, FileText, Search } from 'lucide-react-native'; // For Add Task and Tab icons

type TabType = 'tasks' | 'analytics' | 'reports';
type FilterByType = 'all' | 'completed' | 'pending';
type SortByType = 'dueDate' | 'title' | 'createdAt';
type SortOrderType = 'asc' | 'desc';

interface TabButtonProps {
  title: string;
  Icon: React.ElementType;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, Icon, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`flex-row items-center px-4 py-2.5 rounded-lg mr-2 ${isActive ? 'bg-slate-200' : 'bg-slate-50'}`}
  >
    <Icon size={18} style={tw`mr-2 ${isActive ? 'text-slate-700' : 'text-slate-500'}`} />
    <Text style={tw`font-semibold ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>{title}</Text>
  </TouchableOpacity>
);


const TaskListScreen: React.FC = () => {
  const { user } = useAppContext(); // Get user from context
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError, 
    fetchTasks, 
    // addTask, // Not directly used here for adding, usually a separate screen/modal
    completeTask, 
    deleteTask,
    // updateTask, // For full edit functionality, not just complete/uncomplete
  } = useTasks(user); // Use the real hook

  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<FilterByType>('all');
  const [sortBy, setSortBy] = useState<SortByType>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrderType>('desc');

  useEffect(() => {
    // Fetch tasks when the component mounts or user changes
    // useTasks hook already handles initial fetch and re-fetch on user change.
  }, [user]);

  const handleToggleComplete = async (id: string, currentIsCompleted: boolean) => {
    await completeTask(id, !currentIsCompleted);
    // Optionally, can call useStreak's recordTaskCompletion here if needed
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const handleEditTask = (task: Task) => {
    console.log(`Editing task ${task.id} - (Not implemented in TaskListScreen directly)`);
    // This would typically navigate to an edit screen or open a modal
  };
  
  const filteredAndSortedTasks = useMemo(() => {
    let processedTasks = [...tasks];

    // Filter by search term
    if (searchTerm) {
      processedTasks = processedTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by completion status
    if (filterBy === 'completed') {
      processedTasks = processedTasks.filter(task => task.isCompleted);
    } else if (filterBy === 'pending') {
      processedTasks = processedTasks.filter(task => !task.isCompleted);
    }

    // Sort tasks
    processedTasks.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (sortBy) {
        case 'dueDate':
          compareA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          compareB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'title':
          compareA = a.title.toLowerCase();
          compareB = b.title.toLowerCase();
          break;
        case 'createdAt':
        default:
          compareA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          compareB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
      }
      
      // Handle cases where dates might be null or undefined for sorting
      if (compareA === 0 && compareB !== 0) return sortOrder === 'asc' ? 1 : -1; // Put nulls/undefined last in asc, first in desc
      if (compareB === 0 && compareA !== 0) return sortOrder === 'asc' ? -1 : 1; // Put nulls/undefined last in asc, first in desc
      if (compareA === 0 && compareB === 0) return 0;


      if (compareA < compareB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (compareA > compareB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return processedTasks;
  }, [tasks, searchTerm, filterBy, sortBy, sortOrder]);
  
  const completedTasksPercentage = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completedCount = tasks.filter(task => task.isCompleted).length;
    return Math.round((completedCount / tasks.length) * 100);
  }, [tasks]);


  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <View>
            {/* Search Input - Basic version */}
            <View style={tw`flex-row items-center bg-white p-2 rounded-lg shadow mb-4 border border-slate-200`}>
                <Search size={20} style={tw`text-slate-400 mr-2`} />
                <TextInput
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    style={tw`flex-1 h-8 text-base text-slate-700`}
                    placeholderTextColor={tw.color('slate-400')}
                />
            </View>
            <TaskFilters /> {/* Placeholder for actual filter/sort UI controls */}
            {tasksLoading && filteredAndSortedTasks.length === 0 ? ( // Check loading state from useTasks
              <Text style={tw`text-center text-slate-500 py-10`}>Loading tasks...</Text>
            ) : tasksError ? (
                <Text style={tw`text-center text-red-500 py-10`}>Error loading tasks: {tasksError.message}</Text>
            ) : filteredAndSortedTasks.length === 0 ? (
              <View style={tw`items-center justify-center py-10 bg-white rounded-lg shadow`}>
                <Text style={tw`text-lg text-slate-500 mb-2`}>
                  {searchTerm || filterBy !== 'all' ? 'No tasks match your filters.' : 'No tasks yet!'}
                </Text>
                <Text style={tw`text-slate-400 mb-4 text-center px-4`}>
                  {searchTerm || filterBy !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by adding a new task.'}
                </Text>
                <Button onPress={() => console.log("Navigate to Add Task screen or open modal")}>
                  <PlusCircle size={18} style={tw`mr-2 text-white`} />
                  Add First Task
                </Button>
              </View>
            ) : (
              <FlatList
                data={filteredAndSortedTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TaskItem
                    task={item}
                    onToggleComplete={() => handleToggleComplete(item.id, item.isCompleted)}
                    onDelete={() => handleDeleteTask(item.id)}
                    onEdit={() => handleEditTask(item)}
                  />
                )}
              />
            )}
          </View>
        );
      case 'analytics':
        return (
          <View style={tw`p-4 items-center justify-center bg-white rounded-lg shadow mt-4`}>
            <BarChart3 size={48} style={tw`text-slate-400 mb-4`} />
            <Text style={tw`text-xl font-semibold text-slate-700`}>Task Analytics</Text>
            <Text style={tw`text-slate-500 mt-1 text-center`}>
              Completed: {completedTasksPercentage}%
            </Text>
            <Text style={tw`text-slate-500 mt-1 text-center`}>
              Detailed charts and insights about your task completion, productivity trends, etc., will be shown here.
            </Text>
          </View>
        );
      case 'reports':
        return (
          <View style={tw`p-4 items-center justify-center bg-white rounded-lg shadow mt-4`}>
            <FileText size={48} style={tw`text-slate-400 mb-4`} />
            <Text style={tw`text-xl font-semibold text-slate-700`}>Reports Page</Text>
            <Text style={tw`text-slate-500 mt-1 text-center`}>
              Generate and view reports on your task history, achievements, and more.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={tw`flex-1 bg-slate-100`}>
      {/* Header */}
      <View style={tw`bg-white pt-12 pb-4 px-4 shadow-sm`}>
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw`text-3xl font-bold text-slate-800`}>
            Hello, {user?.username || 'User'}!
          </Text>
          <Button onPress={() => console.log("Navigate to Add Task screen or open modal")} size="sm">
             <PlusCircle size={18} style={tw`mr-2 text-white`} />
            Add Task
          </Button>
        </View>
        
        {/* Custom Tab Switcher */}
        <View style={tw`mt-6`}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`pb-1`}>
                <TabButton title="My Tasks" Icon={LayoutGrid} isActive={activeTab === 'tasks'} onPress={() => setActiveTab('tasks')} />
                <TabButton title="Analytics" Icon={BarChart3} isActive={activeTab === 'analytics'} onPress={() => setActiveTab('analytics')} />
                <TabButton title="Reports" Icon={FileText} isActive={activeTab === 'reports'} onPress={() => setActiveTab('reports')} />
            </ScrollView>
        </View>
      </View>

      {/* Content Area */}
      <ScrollView contentContainerStyle={tw`p-4`}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default TaskListScreen;
