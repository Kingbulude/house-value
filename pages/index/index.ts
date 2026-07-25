import { ValuationInput, ValuationResult } from '../../utils/valuation';
import { formatWan } from '../../utils/valuation';

interface IndexData {
  hasCache: boolean;
  cacheSummary: string;
  hasHistory: boolean;
  [key: string]: unknown;
}

Page({
  data: {
    hasCache: false,
    cacheSummary: '',
    hasHistory: false,
  } as IndexData,

  onShow() {
    this.checkCache();
  },

  checkCache() {
    const input = wx.getStorageSync('valuationInput') as ValuationInput | undefined;
    if (input) {
      this.setData({
        hasCache: true,
        cacheSummary: `${input.district} · ${input.communityName} · ${input.area}m²`,
      });
    } else {
      this.setData({ hasCache: false, cacheSummary: '' });
    }
    const history = wx.getStorageSync('valuationHistory') as unknown[];
    this.setData({ hasHistory: Array.isArray(history) && history.length > 0 });
  },

  goToInput() {
    wx.navigateTo({ url: '/pages/input/input' });
  },

  goToResult() {
    wx.navigateTo({ url: '/pages/result/result' });
  },

  goToHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  goToDefects() {
    wx.navigateTo({ url: '/pages/defects/defects' });
  },

  goToAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  },

  onShareAppMessage() {
    return {
      title: '杭州房产估值计算器 - 多维度参考工具',
      path: '/pages/index/index',
    };
  },
});
