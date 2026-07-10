import { initUI, switchTab, toggleCard, renderHistory, clearAllHistory, loadHistoryItem } from './ui.js';

window.switchTab = switchTab;
window.toggleCard = toggleCard;
window.clearAllHistory = clearAllHistory;
window.loadHistoryItem = loadHistoryItem;

document.addEventListener('DOMContentLoaded', initUI);