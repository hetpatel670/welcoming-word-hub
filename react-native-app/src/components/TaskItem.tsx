import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert, Platform } from 'react-native';
import { tw } from '../lib/utils'; // Adjusted path
import { CheckCircle, Circle, Edit3, Trash2, GripVertical } from 'lucide-react-native';
import { useAppContext } from '../../contexts/AppContext'; // Adjusted path
import type { Task } from '../../types'; // Adjusted path

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  // onReorder: (id: string, newOrder: number) => void; // For drag-and-drop, not in this subtask
  // isDragging?: boolean; // For drag-and-drop styling
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onEdit }) => {
  const { theme } = useAppContext(); // Assuming theme might be used for styling later

  const itemAnim = useRef(new Animated.Value(0)).current; // For initial appearance
  const [isPressed, setIsPressed] = useState(false); // For tap animation

  useEffect(() => {
    // Initial animation (fade in and slide up slightly)
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [itemAnim]);

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete task: "${task.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(task.id) }
      ]
    );
  };

  const handleToggleComplete = () => {
    Animated.spring(itemAnim, { // Little spring effect on toggle
        toValue: task.isCompleted ? 0.95 : 1.05,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
    }).start(() => {
        Animated.spring(itemAnim, {
            toValue: 1,
            friction: 7,
            tension: 100,
            useNativeDriver: true,
        }).start();
    });
    onToggleComplete(task.id, !task.isCompleted);
  };
  
  const containerOpacity = itemAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const containerTranslateY = itemAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0], // Slide up
  });

  // Tap animation for the container
  const pressAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(pressAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  // Hover effect is not directly applicable in RN. We use pressIn/pressOut for tap feedback.
  // Layout animation (AnimatePresence, layout prop) is complex in RN.
  // For item removal/addition, FlatList animations or libraries like react-native-reanimated-layout can be used.
  // For this component, we focus on initial render and tap feedback.

  return (
    <Animated.View
      style={[
        tw`p-4 mb-3 rounded-lg shadow-sm flex-row items-center justify-between`,
        task.isCompleted ? tw`bg-slate-100` : tw`bg-white`,
        isPressed ? tw`shadow-md` : tw`shadow-sm`, // Subtle shadow change on press
        { 
          opacity: containerOpacity, 
          transform: [{ translateY: containerTranslateY }, { scale: pressAnim }] 
        },
        Platform.OS === 'android' ? tw`elevation-2` : tw`shadow`, // Basic shadow for Android vs iOS
      ]}
    >
      <TouchableOpacity
        onPress={handleToggleComplete}
        style={tw`flex-row items-center flex-1 mr-2`}
        activeOpacity={0.7}
      >
        {task.isCompleted ? (
          <CheckCircle size={24} style={tw`text-green-500 mr-3`} />
        ) : (
          <Circle size={24} style={tw`text-slate-400 mr-3`} />
        )}
        <Text style={[tw`text-base ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`]}>
          {task.title}
        </Text>
      </TouchableOpacity>

      <View style={tw`flex-row items-center`}>
        <TouchableOpacity onPress={() => onEdit(task)} style={tw`p-2`}>
          <Edit3 size={20} style={tw`text-slate-500`} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={tw`p-2 ml-1`}>
          <Trash2 size={20} style={tw`text-red-500`} />
        </TouchableOpacity>
        {/* Grip icon for reordering, functionality not implemented in this subtask */}
        {/* <GripVertical size={20} style={tw`text-slate-400 ml-1`} /> */}
      </View>
    </Animated.View>
  );
};

// Need to import Easing for Animated.timing
import { Easing } from 'react-native';

export default TaskItem;
