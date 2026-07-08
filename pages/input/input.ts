import { HouseInfo, ReferenceData } from '../../utils/valuation';

interface InputData extends HouseInfo, ReferenceData {
  directionIndex: number;
  decorationIndex: number;
  elevatorIndex: number;
  directionOptions: string[];
  decorationOptions: string[];
  elevatorOptions: string[];
  [key: string]: unknown;
}

const DIRECTION_OPTIONS = ['南北通透', '南向', '东南', '东向', '西南', '西向', '东北', '北向'];
const DECORATION_OPTIONS = ['精装', '简装', '毛坯'];
const ELEVATOR_OPTIONS = ['有电梯', '无电梯'];

function getCurrentYear(): number {
  return new Date().getFullYear();
}

Page({
  data: {
    city: '',
    community: '',
    area: '',
    roomCount: 2,
    hallCount: 1,
    floor: '',
    totalFloor: '',
    hasElevator: true,
    elevatorIndex: 0,
    direction: '南向',
    directionIndex: 1,
    decoration: '简装',
    decorationIndex: 1,
    buildYear: getCurrentYear() - 5,
    nearbyPrice: '',
    monthlyRent: '',
    govPrice: '',
    directionOptions: DIRECTION_OPTIONS,
    decorationOptions: DECORATION_OPTIONS,
    elevatorOptions: ELEVATOR_OPTIONS,
  } as unknown as InputData,

  onLoad() {
    const cachedInfo = wx.getStorageSync('houseInfo') as HouseInfo | undefined;
    const cachedRef = wx.getStorageSync('refData') as ReferenceData | undefined;
    if (cachedInfo) {
      this.setData({
        city: cachedInfo.city,
        community: cachedInfo.community,
        area: String(cachedInfo.area),
        roomCount: cachedInfo.roomCount,
        hallCount: cachedInfo.hallCount,
        floor: String(cachedInfo.floor),
        totalFloor: String(cachedInfo.totalFloor),
        hasElevator: cachedInfo.hasElevator,
        elevatorIndex: cachedInfo.hasElevator ? 0 : 1,
        direction: cachedInfo.direction,
        directionIndex: DIRECTION_OPTIONS.indexOf(cachedInfo.direction),
        decoration: cachedInfo.decoration,
        decorationIndex: DECORATION_OPTIONS.indexOf(cachedInfo.decoration),
        buildYear: cachedInfo.buildYear,
      });
    }
    if (cachedRef) {
      this.setData({
        nearbyPrice: String(cachedRef.nearbyPrice),
        monthlyRent: String(cachedRef.monthlyRent),
        govPrice: cachedRef.govPrice ? String(cachedRef.govPrice) : '',
      });
    }
  },

  onInput(e: WxEvent) {
    const field = String(e.currentTarget.dataset.field ?? '');
    const value = String((e.detail as { value: string }).value ?? '');
    this.setData({ [field]: value } as unknown as InputData);
  },

  onNumberInput(e: WxEvent) {
    const field = String(e.currentTarget.dataset.field ?? '');
    const value = String((e.detail as { value: string }).value ?? '');
    const num = parseFloat(value);
    this.setData({ [field]: isNaN(num) ? '' : String(num) } as unknown as InputData);
  },

  onDirectionChange(e: WxEvent) {
    const index = Number((e.detail as { value: number }).value);
    this.setData({ directionIndex: index, direction: DIRECTION_OPTIONS[index] });
  },

  onDecorationChange(e: WxEvent) {
    const index = Number((e.detail as { value: number }).value);
    this.setData({ decorationIndex: index, decoration: DECORATION_OPTIONS[index] });
  },

  onElevatorChange(e: WxEvent) {
    const index = Number((e.detail as { value: number }).value);
    this.setData({ elevatorIndex: index, hasElevator: index === 0 });
  },

  validate(): string | null {
    const d = this.data;
    if (!d.city.trim()) return '请输入城市';
    if (!d.community.trim()) return '请输入小区名称';
    const area = parseFloat(d.area as unknown as string);
    if (!area || area <= 0) return '请输入有效的建筑面积';
    const floor = parseInt(d.floor as unknown as string, 10);
    if (!floor || floor <= 0) return '请输入所在楼层';
    const totalFloor = parseInt(d.totalFloor as unknown as string, 10);
    if (!totalFloor || totalFloor <= 0) return '请输入总楼层';
    if (floor > totalFloor) return '所在楼层不能大于总楼层';
    const nearbyPrice = parseFloat(d.nearbyPrice as unknown as string);
    if (!nearbyPrice || nearbyPrice <= 0) return '请输入同小区近期成交均价';
    const monthlyRent = parseFloat(d.monthlyRent as unknown as string);
    if (!monthlyRent || monthlyRent <= 0) return '请输入同户型月租金';
    return null;
  },

  submit() {
    const error = this.validate();
    if (error) {
      wx.showToast({ title: error, icon: 'none' });
      return;
    }

    const d = this.data;
    const houseInfo: HouseInfo = {
      city: d.city.trim(),
      community: d.community.trim(),
      area: parseFloat(d.area as unknown as string),
      roomCount: d.roomCount,
      hallCount: d.hallCount,
      floor: parseInt(d.floor as unknown as string, 10),
      totalFloor: parseInt(d.totalFloor as unknown as string, 10),
      hasElevator: d.hasElevator,
      direction: d.direction,
      decoration: d.decoration,
      buildYear: d.buildYear,
    };

    const refData: ReferenceData = {
      nearbyPrice: parseFloat(d.nearbyPrice as unknown as string),
      monthlyRent: parseFloat(d.monthlyRent as unknown as string),
    };
    const govPriceStr = d.govPrice as unknown as string;
    if (govPriceStr) {
      const gp = parseFloat(govPriceStr);
      if (gp > 0) refData.govPrice = gp;
    }

    wx.setStorageSync('houseInfo', houseInfo);
    wx.setStorageSync('refData', refData);

    wx.navigateTo({ url: '/pages/result/result' });
  },
});
