import { initUI, switchTab, renderHistory, clearAllHistory, loadHistoryItem } from './ui.js';

window.switchTab = switchTab;
window.clearAllHistory = clearAllHistory;
window.loadHistoryItem = loadHistoryItem;

document.addEventListener('DOMContentLoaded', initUI);