import {
  initUI, switchTab, toggleCard, renderHistory, clearAllHistory,
  loadHistoryItem, showHistory, closeHistory, loadHistory, deleteHistoryItem,
  quickFill, copyResult, toggleDarkMode, showLoading, hideLoading, exportPDF,
} from './ui.js';

window.switchTab = switchTab;
window.toggleCard = toggleCard;
window.clearAllHistory = clearAllHistory;
window.loadHistoryItem = loadHistoryItem;
window.showHistory = showHistory;
window.closeHistory = closeHistory;
window.loadHistory = loadHistory;
window.deleteHistoryItem = deleteHistoryItem;
window.quickFill = quickFill;
window.copyResult = copyResult;
window.toggleDarkMode = toggleDarkMode;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.exportPDF = exportPDF;

document.addEventListener('DOMContentLoaded', initUI);
