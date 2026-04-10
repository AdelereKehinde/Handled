import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadows } from '../theme';

const STAGES = [
  { value: 0, label: 'To do' },
  { value: 1, label: 'Started' },
  { value: 2, label: 'Review' },
  { value: 3, label: 'Done' },
];

export default function MicroTaskBreakdownScreen({ navigation }) {
  const { themeMode, strings, hapticsEnabled } = useApp();
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');

  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;
  const secondaryColor = isDark ? Colors.textSoft : Colors.textMid;

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      setSubtasks(selectedTask.subtasks || []);
    }
  }, [selectedTask]);

  const loadTasks = async () => {
    const saved = JSON.parse(await AsyncStorage.getItem('microTasks')) || [];
    const normalized = saved.map((task) => ({
      ...task,
      completed: Boolean(task.completed),
      subtasks: (task.subtasks || []).map((subtask) => ({
        ...subtask,
        stage: typeof subtask.stage === 'number' ? subtask.stage : subtask.completed ? 3 : 0,
        completed: typeof subtask.stage === 'number' ? subtask.stage >= 3 : Boolean(subtask.completed),
      })),
    }));
    setTasks(normalized);
  };

  const saveTasks = async (updated) => {
    await AsyncStorage.setItem('microTasks', JSON.stringify(updated));
    setTasks(updated);
  };

  const addTask = () => {
    if (!newTaskName.trim()) {
      Alert.alert('Task Required', 'Please enter a task name');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      name: newTaskName,
      subtasks: [],
      createdAt: new Date().toISOString(),
      completed: false,
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);
    setNewTaskName('');
    setSelectedTask(newTask);
    setSubtasks([]);

    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const addSubtask = () => {
    if (!newSubtask.trim() || !selectedTask) {
      Alert.alert('Subtask Required', 'Please enter a subtask name');
      return;
    }

    const subtask = {
      id: Date.now().toString(),
      name: newSubtask,
      stage: 0,
      completed: false,
    };

    const updated = subtasks.concat(subtask);
    setSubtasks(updated);
    setNewSubtask('');

    const taskUpdate = tasks.map((t) =>
      t.id === selectedTask.id ? { ...t, subtasks: updated } : t
    );
    saveTasks(taskUpdate);
    setSelectedTask({ ...selectedTask, subtasks: updated });

    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const advanceSubtaskStage = (subtaskId) => {
    const updated = subtasks.map((s) => {
      if (s.id !== subtaskId) return s;
      const nextStage = s.stage >= 3 ? 3 : s.stage + 1;
      return { ...s, stage: nextStage, completed: nextStage >= 3 };
    });
    setSubtasks(updated);

    const taskUpdate = tasks.map((t) =>
      t.id === selectedTask.id ? { ...t, subtasks: updated } : t
    );
    saveTasks(taskUpdate);
    setSelectedTask({ ...selectedTask, subtasks: updated });

    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const regressSubtaskStage = (subtaskId) => {
    const updated = subtasks.map((s) => {
      if (s.id !== subtaskId) return s;
      const nextStage = s.stage <= 0 ? 0 : s.stage - 1;
      return { ...s, stage: nextStage, completed: nextStage >= 3 };
    });
    setSubtasks(updated);

    const taskUpdate = tasks.map((t) =>
      t.id === selectedTask.id ? { ...t, subtasks: updated } : t
    );
    saveTasks(taskUpdate);
    setSelectedTask({ ...selectedTask, subtasks: updated });
  };

  const deleteSubtask = (subtaskId) => {
    const updated = subtasks.filter((subtask) => subtask.id !== subtaskId);
    setSubtasks(updated);

    const taskUpdate = tasks.map((t) =>
      t.id === selectedTask.id ? { ...t, subtasks: updated } : t
    );
    saveTasks(taskUpdate);
    setSelectedTask({ ...selectedTask, subtasks: updated });
  };

  const markTaskComplete = async () => {
    if (!selectedTask) return;

    const allComplete = subtasks.every((s) => s.stage >= 3);

    if (!allComplete) {
      Alert.alert('Almost there!', 'Complete all subtasks first 🎉');
      return;
    }

    const updated = tasks.map((t) =>
      t.id === selectedTask.id ? { ...t, completed: true } : t
    );
    saveTasks(updated);
    setSelectedTask(null);
    setSubtasks([]);

    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert('🎉 Awesome!', 'You crushed this task! Take a moment to celebrate 💜');
  };

  const deleteTask = (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
      setSubtasks([]);
    }
  };

  const progress =
    subtasks.length > 0
      ? (subtasks.reduce((total, subtask) => total + (subtask.stage || 0), 0) / (subtasks.length * 3)) * 100
      : 0;

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar
          title={strings.microTasks || 'Task Breakdown'}
          onBack={() => navigation.goBack()}
          tintColor={textColor}
        />

        {!selectedTask ? (
          <>
            <Text style={[styles.title, { color: textColor }]}>Break it down</Text>
            <Text style={[styles.subtitle, { color: secondaryColor }]}>
              Large tasks got you overwhelmed? Break them into micro habits.
            </Text>

            <View style={[styles.inputRow, isDark && styles.inputRowDark]}>
              <TextInput
                placeholder="Add a new task..."
                placeholderTextColor={isDark ? Colors.textSoft : Colors.textMid}
                value={newTaskName}
                onChangeText={setNewTaskName}
                style={[styles.input, { color: textColor, borderColor: Colors.cardBorder }]}
              />
              <TouchableOpacity onPress={addTask} style={styles.addButton}>
                <Ionicons name="add" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.listTitle, { color: textColor }]}>Active tasks</Text>
            {tasks.filter((t) => !t.completed).length === 0 ? (
              <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.primary} />
                <Text style={[styles.emptyText, { color: secondaryColor }]}>
                  No active tasks. Great job! 🎉
                </Text>
              </View>
            ) : (
              tasks
                .filter((t) => !t.completed)
                .map((task) => {
                  const completed = task.subtasks.filter((s) => (s.stage || 0) >= 3).length;
                  const total = task.subtasks.length;
                  const taskProgress =
                    total > 0
                      ? (task.subtasks.reduce((sum, subtask) => sum + (subtask.stage || 0), 0) / (total * 3)) * 100
                      : 0;

                  return (
                    <TouchableOpacity
                      key={task.id}
                      onPress={() => setSelectedTask(task)}
                      style={[styles.taskCard, Shadows.card, isDark && styles.cardDark]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.taskHeader}>
                        <View style={styles.taskInfo}>
                          <Text style={[styles.taskName, { color: textColor }]}>{task.name}</Text>
                          <Text style={[styles.taskSubtext, { color: secondaryColor }]}>
                            {completed} of {total} steps
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={secondaryColor} />
                      </View>
                      <View style={[styles.progressBar, { backgroundColor: Colors.cardBorder }]}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${taskProgress}%`, backgroundColor: Colors.primary },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })
            )}

            {tasks.filter((t) => t.completed).length > 0 && (
              <>
                <Text style={[styles.listTitle, { color: textColor, marginTop: 24 }]}>
                  Completed ✓
                </Text>
                {tasks
                  .filter((t) => t.completed)
                  .map((task) => (
                    <View
                      key={task.id}
                      style={[styles.taskCard, styles.completedTask, isDark && styles.cardDark]}
                    >
                      <View style={styles.taskHeader}>
                        <View style={styles.taskInfo}>
                          <Text style={[styles.taskName, styles.completeText, { color: Colors.primary }]}>
                            {task.name}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => deleteTask(task.id)}>
                          <Ionicons name="trash" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setSelectedTask(null)} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={textColor} />
              <Text style={[styles.backButtonText, { color: textColor }]}>Back</Text>
            </TouchableOpacity>

            <Text style={[styles.detailTitle, { color: textColor }]}>
              {selectedTask.name}
            </Text>

            <View style={[styles.progressSection, isDark && styles.sectionDark]}>
              <View style={styles.progressStat}>
                <Text style={[styles.progressLabel, { color: secondaryColor }]}>Progress</Text>
                <Text style={[styles.progressValue, { color: Colors.primary }]}>
                  {progress.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.stageLegend}>
                {STAGES.map((stage) => (
                  <View key={stage.value} style={styles.stagePill}>
                    <Text style={styles.stagePillText}>{stage.label}</Text>
                  </View>
                ))}
              </View>
              <View
                style={[
                  styles.progressBarLarge,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                ]}
              >
                <View
                  style={[
                    styles.progressFillLarge,
                    { width: `${progress}%`, backgroundColor: Colors.primary },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.inputRow, isDark && styles.inputRowDark]}>
              <TextInput
                placeholder="Add a subtask..."
                placeholderTextColor={isDark ? Colors.textSoft : Colors.textMid}
                value={newSubtask}
                onChangeText={setNewSubtask}
                style={[styles.input, { color: textColor, borderColor: Colors.cardBorder }]}
              />
              <TouchableOpacity onPress={addSubtask} style={styles.addButton}>
                <Ionicons name="add" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.listTitle, { color: textColor }]}>Subtasks</Text>
            {subtasks.length === 0 ? (
              <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
                <Text style={[styles.emptyText, { color: secondaryColor }]}>
                  Add your first subtask to get started
                </Text>
              </View>
            ) : (
              <>
                {subtasks.map((subtask) => (
                  <View
                    key={subtask.id}
                    style={[
                      styles.subtaskItem,
                      isDark && styles.subtaskItemDark,
                      subtask.completed && styles.subtaskCompleted,
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => advanceSubtaskStage(subtask.id)}
                      style={styles.subtaskMainAction}
                      activeOpacity={0.7}
                    >
                      <View style={styles.checkbox}>
                        {subtask.stage >= 3 && (
                          <Ionicons name="checkmark" size={14} color={Colors.white} />
                        )}
                      </View>
                      <View style={styles.subtaskCopy}>
                        <Text
                          style={[
                            styles.subtaskName,
                            { color: textColor },
                            subtask.completed && styles.subtaskNameCompleted,
                          ]}
                        >
                          {subtask.name}
                        </Text>
                        <Text style={[styles.subtaskStage, { color: secondaryColor }]}>
                          {STAGES[subtask.stage || 0].label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => regressSubtaskStage(subtask.id)}
                      style={styles.stageBackButton}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="remove" size={14} color={Colors.textSoft} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteSubtask(subtask.id)}
                      style={styles.deleteSubtaskButton}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={14} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {subtasks.length > 0 && (
              <TouchableOpacity
                onPress={markTaskComplete}
                style={[styles.completeButton, progress < 100 && styles.completeButtonDisabled]}
                disabled={progress < 100}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                <Text style={styles.completeButtonText}>
                  {progress === 100 ? 'Mark task as done' : 'Move every step to Done first'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 13, marginBottom: 20, lineHeight: 18 },
  detailTitle: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButtonText: { fontSize: 16, fontWeight: '600', marginLeft: 4 },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 12,
    height: 48,
  },
  inputRowDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  input: {
    flex: 1,
    fontSize: 14,
    borderBottomWidth: 0,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  emptyText: { fontSize: 13, textAlign: 'center', marginTop: 12 },
  taskCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  cardDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  taskInfo: { flex: 1 },
  taskName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  taskSubtext: { fontSize: 12 },
  progressBar: { height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 4 },
  completedTask: { opacity: 0.6 },
  completeText: { textDecorationLine: 'line-through' },
  progressSection: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 20,
  },
  sectionDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  progressStat: { marginBottom: 12 },
  progressLabel: { fontSize: 12, marginBottom: 6 },
  progressValue: { fontSize: 24, fontWeight: '700' },
  stageLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  stagePill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stagePillText: {
    color: Colors.textMid,
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarLarge: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFillLarge: { height: 6 },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    marginBottom: 8,
  },
  subtaskItemDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  subtaskCompleted: { opacity: 0.6 },
  subtaskMainAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subtaskCopy: { flex: 1 },
  subtaskName: { fontSize: 13, fontWeight: '500', flex: 1 },
  subtaskStage: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  subtaskNameCompleted: { textDecorationLine: 'line-through' },
  stageBackButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteSubtaskButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
