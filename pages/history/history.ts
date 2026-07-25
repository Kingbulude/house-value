import { ValuationInput, ValuationResult, formatWan } from '../../utils/valuation';

interface HistoryItem {
  timestamp: number;
  input: ValuationInput;
  result: ValuationResult;
}

Page({
  data: {
    list: [] as HistoryItem[],
    isEmpty: true,
  },

  onShow() {
    this.refreshList();
  },

  refreshList() {
    const list = (wx.getStorageSync('valuationHistory') || []) as HistoryItem[];
    this.setData({
      list: list.reverse(),
      isEmpty: list.length === 0,
    });
  },

  formatDate(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  formatWanWrapper(v: number): string {
    return formatWan(v);
  },

  viewHistory(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as number;
    const item = this.data.list[index];
    if (!item) return;
    wx.setStorageSync('valuationInput', item.input);
    wx.navigateTo({ url: '/pages/result/result' });
  },

  deleteHistory(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as number;
    wx.showModal({
      title: '确认删除',
      content: '确定删除该条历史记录？',
      success: (res) => {
        if (!res.confirm) return;
        const fullList = wx.getStorageSync('valuationHistory') || [];
        const realIndex = fullList.length - 1 - index;
        fullList.splice(realIndex, 1);
        wx.setStorageSync('valuationHistory', fullList);
        this.refreshList();
      },
    });
  },

  clearHistory() {
    wx.showModal({
      title: '清空历史记录',
      content: '确定清空所有历史记录？此操作不可恢复。',
      confirmColor: '#dc2626',
      success: (res) => {
        if (!res.confirm) return;
        wx.setStorageSync('valuationHistory', []);
        this.refreshList();
      },
    });
  },
});
