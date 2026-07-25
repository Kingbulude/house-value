import {
  ValuationInput,
  ValuationResult,
  calculateValuation,
  formatWan,
  getScoreColor,
  getConfidenceClass,
} from '../../utils/valuation';

interface Tab {
  key: string;
  label: string;
}

interface AmenityItem {
  name: string;
  score: number;
  max: number;
  color: string;
  percent: number;
  detailText: string;
}

interface DefectItem {
  name: string;
  severity: string;
  desc: string;
  penaltyPercent: number;
  isSevere: boolean;
}

interface ModifierItem {
  label: string;
  value: string;
  modClass: string;
}

Page({
  data: {
    loaded: false,
    input: null as ValuationInput | null,
    result: null as ValuationResult | null,
    activeTab: 'summary',
    tabs: [
      { key: 'summary', label: '概要' },
      { key: 'methods', label: '三把尺子' },
      { key: 'amenities', label: '配套评分' },
      { key: 'defects', label: '硬伤检测' },
      { key: 'holdingcost', label: '成本估算' },
      { key: 'factors', label: '系数明细' },
    ] as Tab[],
    amenitiesList: [] as AmenityItem[],
    defectsList: [] as DefectItem[],
    modifiersList: [] as ModifierItem[],
    summaryText: '',
    methodSummary: '',
    defectsTotalPenalty: 0,
    severeCount: 0,
    moderateCount: 0,
    showBackTop: false,
    holdingCostBreakdown: [] as { name: string; value: number; percent: number; color: string }[],
  },

  onPageScroll(e: { scrollTop: number }) {
    const showBackTop = e.scrollTop > 600;
    if (showBackTop !== this.data.showBackTop) {
      this.setData({ showBackTop });
    }
  },

  onShow() {
    this.loadAndCalculate();
  },

  loadAndCalculate() {
    const input = wx.getStorageSync('valuationInput') as ValuationInput | undefined;
    if (!input) {
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

    const result = calculateValuation(input);

    const f = result.factors;
    const bm = f.buildingModifiers;

    const r = result as any;
    r.finalValuationText = formatWan(result.finalValuation);
    r.lowerBoundText = formatWan(result.lowerBound);
    r.upperBoundText = formatWan(result.upperBound);
    r.confidenceClass = getConfidenceClass(result.confidence);
    r.marketText = result.methods.market ? formatWan(result.methods.market) : '';
    r.incomeText = result.methods.income ? formatWan(result.methods.income) : '';
    r.costText = result.methods.cost ? formatWan(result.methods.cost) : '';
    r.marketWeight = Math.round(result.weights.market * 100);
    r.incomeWeight = Math.round(result.weights.income * 100);
    r.costWeight = Math.round(result.weights.cost * 100);
    r.liquidityDiscountText = (result.factors.liquidityDiscount * 100).toFixed(1);
    r.capRateText = f.incomeApproach ? f.incomeApproach.capRatePercent : '-';
    if (r.factors.marketComparison && r.factors.marketComparison.schoolPrem != null) {
      r.factors.marketComparison.schoolPremPercent = (r.factors.marketComparison.schoolPrem * 100).toFixed(0);
    }
    if (r.holdingCost) {
      r.holdingCost.annualCostText = formatWan(r.holdingCost.annualCost);
      r.holdingCost.totalCostText = formatWan(r.holdingCost.totalCost);
    }

    const amenitiesList: AmenityItem[] = [
      { name: '交通配套', score: f.amenities.traffic.score, max: f.amenities.traffic.max, color: getScoreColor(f.amenities.traffic.score, f.amenities.traffic.max), percent: (f.amenities.traffic.score / f.amenities.traffic.max) * 100, detailText: f.amenities.traffic.detail.join('；') },
      { name: '教育配套', score: f.amenities.education.score, max: f.amenities.education.max, color: getScoreColor(f.amenities.education.score, f.amenities.education.max), percent: (f.amenities.education.score / f.amenities.education.max) * 100, detailText: f.amenities.education.detail.join('；') },
      { name: '商业配套', score: f.amenities.commercial.score, max: f.amenities.commercial.max, color: getScoreColor(f.amenities.commercial.score, f.amenities.commercial.max), percent: (f.amenities.commercial.score / f.amenities.commercial.max) * 100, detailText: f.amenities.commercial.detail.join('；') },
      { name: '医疗配套', score: f.amenities.medical.score, max: f.amenities.medical.max, color: getScoreColor(f.amenities.medical.score, f.amenities.medical.max), percent: (f.amenities.medical.score / f.amenities.medical.max) * 100, detailText: f.amenities.medical.detail.join('；') },
      { name: '自然环境', score: f.amenities.nature.score, max: f.amenities.nature.max, color: getScoreColor(f.amenities.nature.score, f.amenities.nature.max), percent: (f.amenities.nature.score / f.amenities.nature.max) * 100, detailText: f.amenities.nature.detail.join('；') },
    ];

    const defectsList: DefectItem[] = f.defects.defects.map(d => ({
      name: d.name,
      severity: d.severity,
      desc: d.desc,
      penaltyPercent: Math.round((1 - d.coefficient) * 100),
      isSevere: d.severity === '严重',
    }));

    const severeCount = defectsList.filter(d => d.severity === '严重').length;
    const moderateCount = defectsList.filter(d => d.severity !== '严重').length;
    const defectsTotalPenalty = defectsList.reduce((sum, d) => sum + d.penaltyPercent, 0);

    const getModClass = (v: number): string => {
      if (v > 1) return 'positive';
      if (v < 1) return 'negative';
      return 'neutral';
    };

    const formatMod = (v: number): string => v.toFixed(2);

    const modifiersList: ModifierItem[] = [
      { label: '面积修正', value: formatMod(bm.areaMod), modClass: getModClass(bm.areaMod) },
      { label: '朝向修正', value: formatMod(bm.oriMod), modClass: getModClass(bm.oriMod) },
      { label: '楼层修正', value: formatMod(bm.floorMod), modClass: getModClass(bm.floorMod) },
      { label: '装修修正', value: formatMod(bm.decMod), modClass: getModClass(bm.decMod) },
      { label: '房龄修正', value: formatMod(bm.ageMod), modClass: bm.ageMod < 1 ? 'negative' : 'neutral' },
      { label: '电梯修正', value: formatMod(bm.elevMod), modClass: getModClass(bm.elevMod) },
      { label: '楼栋位置', value: formatMod(bm.buildingPosMod), modClass: getModClass(bm.buildingPosMod) },
      { label: '硬伤系数', value: formatMod(bm.defectsCoefficient), modClass: bm.defectsCoefficient < 1 ? 'negative' : 'neutral' },
    ];

    // Summary text
    const district = input.district || '';
    const biz = input.businessDistrict || '';
    const locationStr = [district, biz].filter(Boolean).join('·');
    const summaryText = [
      locationStr,
      `${input.communityName || '未知'} ${input.area}㎡`,
      `参考价: ${r.finalValuationText} (${result.unitPrice}元/㎡)`,
      `区间: ${r.lowerBoundText}~${r.upperBoundText}`,
      `参考度: ${result.confidence}%`,
    ].join('\n');

    // Method summary
    const methodParts: string[] = [];
    if (result.methods.market) methodParts.push(`市场比较${r.marketText}(${r.marketWeight}%)`);
    if (result.methods.income) methodParts.push(`收益还原${r.incomeText}(${r.incomeWeight}%)`);
    if (result.methods.cost) methodParts.push(`成本法${r.costText}(${r.costWeight}%)`);
    const methodSummary = methodParts.join(' + ');

    // Holding cost breakdown
    const bd = result.holdingCost.annualBreakdown;
    const breakdownItems = [
      { name: '资金占用成本', value: bd.opportunityCost, color: '#3b82f6' },
      { name: '房屋折旧', value: bd.buildingDepreciation, color: '#f59e0b' },
      { name: '物业费', value: bd.propertyFee, color: '#10b981' },
    ];
    if (bd.parkingCost > 0) {
      breakdownItems.push({ name: '车位费用', value: bd.parkingCost, color: '#8b5cf6' });
    }
    const totalAnnual = result.holdingCost.annualCost || 1;
    const holdingCostBreakdown = breakdownItems.map(item => ({
      ...item,
      percent: Math.round((item.value / totalAnnual) * 100),
    }));

    this.setData({
      loaded: true,
      input,
      result,
      amenitiesList,
      defectsList,
      modifiersList,
      summaryText,
      methodSummary,
      defectsTotalPenalty,
      severeCount,
      moderateCount,
      holdingCostBreakdown,
    });

    this.saveHistory(input, result);
  },

  saveHistory(input: ValuationInput, result: ValuationResult) {
    const history = (wx.getStorageSync('valuationHistory') as Array<{ timestamp: number; input: ValuationInput; result: ValuationResult }>) || [];
    history.unshift({ timestamp: Date.now(), input, result });
    if (history.length > 50) history.length = 50;
    wx.setStorageSync('valuationHistory', history);
  },

  switchTab(e: WechatMiniprogram.CustomEvent) {
    const tab = e.currentTarget.dataset.tab;
    if (tab) {
      this.setData({ activeTab: tab });
    }
  },

  viewDefects() {
    this.setData({ activeTab: 'defects' });
  },

  copyResult() {
    const { summaryText, methodSummary } = this.data;
    const fullText = `房估测算结果\n${summaryText}\n\n三把尺子: ${methodSummary}`;
    (wx as any).setClipboardData({
      data: fullText,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      },
    });
  },

  sharePoster() {
    wx.showToast({ title: '海报功能开发中', icon: 'none', duration: 1500 });
  },

  scrollToTop() {
    (wx as any).pageScrollTo({ scrollTop: 0, duration: 300 });
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
