import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_DECISIONS_KEY = 'localDecisionHistory';

const readAll = async () => {
  const saved = await AsyncStorage.getItem(LOCAL_DECISIONS_KEY);
  return saved ? JSON.parse(saved) : [];
};

const writeAll = async (items) => {
  await AsyncStorage.setItem(LOCAL_DECISIONS_KEY, JSON.stringify(items));
};

export const listLocalDecisions = async (userId) => {
  const items = await readAll();
  return items
    .filter((item) => String(item.user_id) === String(userId))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const addLocalDecision = async ({ userId, inputText, responseText, mode = 'text' }) => {
  const items = await readAll();
  const entry = {
    id: `local-${Date.now()}`,
    user_id: String(userId),
    input_text: inputText,
    ai_response: responseText,
    created_at: new Date().toISOString(),
    source: 'local',
    mode,
  };

  await writeAll([entry, ...items].slice(0, 100));
  return entry;
};

export const removeLocalDecision = async (id) => {
  const items = await readAll();
  await writeAll(items.filter((item) => item.id !== id));
};

export const clearLocalDecisions = async (userId) => {
  const items = await readAll();
  await writeAll(items.filter((item) => String(item.user_id) !== String(userId)));
};
