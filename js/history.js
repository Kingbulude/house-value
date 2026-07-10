const STORAGE_KEY = 'house_value_history';
const MAX_ITEMS = 10;

export interface HistoryItem {
  id: string;
  timestamp: number;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}

export function saveHistory(input, result) {
  const history = getHistory();
  const item = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    input,
    result,
  };
  history.unshift(item);
  if (history.length > MAX_ITEMS) {
    history.pop();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function removeHistoryItem(id) {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

export function getHistorySummary(item) {
  const { input, result } = item;
  const district = input.district || '未知区域';
  const community = input.communityName || '未知小区';
  const area = input.area || 0;
  const price = result.finalValuation || 0;
  return {
    district,
    community,
    area,
    price,
    unitPrice: result.unitPrice || 0,
    date: new Date(item.timestamp).toLocaleDateString('zh-CN'),
    time: new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  };
}