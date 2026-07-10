import {
  HouseInfo,
  ReferenceData,
  ValuationResult,
  calculateValuation,
  formatPrice,
  formatPricePerSqm,
} from '../../utils/valuation';

interface ResultData {
  loaded: boolean;
  houseInfo: HouseInfo | null;
  result: ValuationResult | null;
  formatPrice: (p: number) => string;
  formatPricePerSqm: (p: number, a: number) => string;
  [key: string]: unknown;
}

Page({
  data: {
    loaded: false,
    houseInfo: null,
    result: null,
    formatPrice,
    formatPricePerSqm,
  } as ResultData,

  onShow() {
    this.loadAndCalculate();
  },

  loadAndCalculate() {
    const houseInfo = wx.getStorageSync('houseInfo') as HouseInfo | undefined;
    const refData = wx.getStorageSync('refData') as ReferenceData | undefined;

    if (!houseInfo || !refData) {
      wx.showModal({
        title: '提示',
        content: '暂无估算数据，请先录入信息',
        showCancel: false,
        success: () => {
          wx.navigateBack({ delta: 1 });
        },
      });
      return;
    }

    const result = calculateValuation(houseInfo, refData);
    this.setData({ loaded: true, houseInfo, result });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  reInput() {
    wx.navigateTo({ url: '/pages/input/input' });
  },

  onShareAppMessage() {
    return {
      title: '房估测算结果分享',
      path: '/pages/index/index',
    };
  },
});
