import { HouseInfo, ReferenceData } from '../../utils/valuation';

interface IndexData {
  hasCache: boolean;
  cacheSummary: string;
  [key: string]: unknown;
}

Page({
  data: {
    hasCache: false,
    cacheSummary: '',
  } as IndexData,

  onShow() {
    this.checkCache();
  },

  checkCache() {
    const cachedInfo = wx.getStorageSync('houseInfo') as HouseInfo | undefined;
    const cachedRef = wx.getStorageSync('refData') as ReferenceData | undefined;
    if (cachedInfo && cachedRef) {
      this.setData({
        hasCache: true,
        cacheSummary: `${cachedInfo.city} · ${cachedInfo.community} · ${cachedInfo.area}m²`,
      });
    } else {
      this.setData({ hasCache: false, cacheSummary: '' });
    }
  },

  goToInput() {
    wx.navigateTo({ url: '/pages/input/input' });
  },

  goToResult() {
    wx.navigateTo({ url: '/pages/result/result' });
  },

  onShareAppMessage() {
    return {
      title: '房估计算器 - 快速测算合理房价参考',
      path: '/pages/index/index',
    };
  },
});
