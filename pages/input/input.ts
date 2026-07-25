import { hangzhouDistricts, DISTRICT_BD_MAP, matchCommunity, matchCommunityDefects } from '../../utils/cityKnowledge';
import { ValuationInput } from '../../utils/valuation';

const DISTRICT_LIST = Object.keys(hangzhouDistricts);
const ORIENTATION_LIST = ['南北通透', '朝南', '东南', '南北', '东西', '朝北', '西北', '东北'];
const DECORATION_LIST = ['简装修', '精装修', '豪华装修', '毛坯'];
const ELEVATOR_LIST = ['有电梯', '无电梯'];
const BP_DISPLAY = ['楼王位置', '好位置', '一般位置', '临小区路', '临市政路', '临底商', '临垃圾站/变电站'];
const BP_VALUES = ['楼王', '好位置', '一般位置', '临小区路', '临市政路', '临底商', '临垃圾站'];
const PT_DISPLAY = ['产权车位', '租赁车位'];
const PT_VALUES = ['产权', '租赁'];

const DEFECT_OPTIONS = [
  { key: 'highway_noise', label: '高架/高速噪音' },
  { key: 'main_road_noise', label: '主干道噪音' },
  { key: 'cemetery', label: '公墓/殡仪馆' },
  { key: 'substation', label: '变电站/高压线' },
  { key: 'garbage_station', label: '垃圾处理站' },
  { key: 'sewage_plant', label: '污水处理厂' },
  { key: 'airport_noise', label: '机场航线噪音' },
  { key: 'low_ground', label: '地势低洼易涝' },
  { key: 'gas_station', label: '加油站/加气站' },
  { key: 'poor_lighting', label: '采光严重不足' },
  { key: 'factory_pollution', label: '工厂污染' },
  { key: 'red_light', label: '治安差/红灯区' },
];

const DEFECT_NAME_TO_KEY: Record<string, string> = {
  '高架/高速噪音': 'highway_noise',
  '主干道噪音': 'main_road_noise',
  '公墓/殡仪馆': 'cemetery',
  '变电站/高压线': 'substation',
  '垃圾处理站': 'garbage_station',
  '污水处理厂': 'sewage_plant',
  '机场航线噪音': 'airport_noise',
  '地势低洼易涝': 'low_ground',
  '加油站/加气站': 'gas_station',
  '采光严重不足': 'poor_lighting',
  '工厂污染': 'factory_pollution',
  '治安差/红灯区': 'red_light',
};

function makeDefectFlags(): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  DEFECT_OPTIONS.forEach(o => { flags[o.key] = false; });
  return flags;
}

Page({
  data: {
    loading: false,

    collapsedMap: {
      section1: false,
      section2: false,
      section3: true,
      section4: true,
      section5: true,
      section6: true,
      section7: true,
      section8: true,
      section9: true,
      section10: true,
      section11: true,
    },

    districtList: DISTRICT_LIST,
    bdList: [] as string[],
    orientationList: ORIENTATION_LIST,
    decorationList: DECORATION_LIST,
    elevatorList: ELEVATOR_LIST,
    buildingPositionList: BP_DISPLAY,
    parkingTypeList: PT_DISPLAY,
    defectOptions: DEFECT_OPTIONS,

    district: '',
    districtIndex: -1,
    businessDistrict: '',
    bdIndex: -1,
    communityName: '',

    area: 0,
    orientation: '南北通透',
    orientationIndex: 0,
    floor: 0,
    totalFloors: 0,
    decoration: '精装修',
    decorationIndex: 1,
    buildingAge: 0,
    hasElevator: true,
    elevatorIndex: 0,
    buildingPosition: '一般位置',
    buildingPositionIndex: 2,

    marketPrice: 0,
    monthlyRent: 0,

    hasParkingSpace: false,
    parkingType: '',
    parkingTypeIndex: -1,
    parkingPrice: 0,

    propertyFee: 2.5,
    holdingYears: 5,
    riskFreeRate: 3.5,

    metroDistance: 0,
    metroLines: 0,
    busRoutes: 0,

    kindergarten: '',
    primarySchool: '',
    middleSchool: '',
    highSchool: '',

    mallCount: 0,
    restaurantCount: 0,
    hasMarket: false,

    hasTier3Hospital: false,
    hospitalDistance: 0,
    hasCommunityHospital: false,

    hasPark: false,
    parkDistance: 0,
    hasWater: false,

    defectFlags: makeDefectFlags(),
    selectedDefects: [] as string[],
  },

  onLoad() {
    const cached = wx.getStorageSync('valuationInput') as ValuationInput | undefined;
    if (cached && cached.district) {
      const districtIndex = DISTRICT_LIST.indexOf(cached.district);
      const bdList = districtIndex >= 0 ? (DISTRICT_BD_MAP[cached.district] || []) : [];
      const bdIndex = bdList.indexOf(cached.businessDistrict);
      const orientationIndex = ORIENTATION_LIST.indexOf(cached.orientation);
      const decorationIndex = DECORATION_LIST.indexOf(cached.decoration);
      const buildingPositionIndex = BP_VALUES.indexOf(cached.buildingPosition);
      const parkingTypeIndex = PT_VALUES.indexOf(cached.parkingType);

      const defectFlags = makeDefectFlags();
      (cached.selectedDefects || []).forEach((key: string) => {
        if (key in defectFlags) defectFlags[key] = true;
      });

      this.setData({
        district: cached.district,
        districtIndex,
        businessDistrict: cached.businessDistrict || '',
        bdIndex,
        bdList,
        communityName: cached.communityName || '',
        area: cached.area || 0,
        orientation: cached.orientation || '南北通透',
        orientationIndex: orientationIndex >= 0 ? orientationIndex : 0,
        floor: cached.floor || 0,
        totalFloors: cached.totalFloors || 0,
        decoration: cached.decoration || '精装修',
        decorationIndex: decorationIndex >= 0 ? decorationIndex : 1,
        buildingAge: cached.buildingAge || 0,
        hasElevator: cached.hasElevator !== false,
        elevatorIndex: cached.hasElevator !== false ? 0 : 1,
        buildingPosition: cached.buildingPosition || '一般位置',
        buildingPositionIndex: buildingPositionIndex >= 0 ? buildingPositionIndex : 2,
        marketPrice: cached.marketPrice || 0,
        monthlyRent: cached.monthlyRent || 0,
        hasParkingSpace: cached.hasParkingSpace || false,
        parkingType: cached.parkingType || '',
        parkingTypeIndex,
        parkingPrice: cached.parkingPrice || 0,
        propertyFee: cached.propertyFee || 2.5,
        holdingYears: cached.holdingYears || 5,
        riskFreeRate: cached.riskFreeRate || 3.5,
        metroDistance: cached.metroDistance || 0,
        metroLines: cached.metroLines || 0,
        busRoutes: cached.busRoutes || 0,
        kindergarten: cached.kindergarten || '',
        primarySchool: cached.primarySchool || '',
        middleSchool: cached.middleSchool || '',
        highSchool: cached.highSchool || '',
        mallCount: cached.mallCount || 0,
        restaurantCount: cached.restaurantCount || 0,
        hasMarket: cached.hasMarket || false,
        hasTier3Hospital: cached.hasTier3Hospital || false,
        hospitalDistance: cached.hospitalDistance || 0,
        hasCommunityHospital: cached.hasCommunityHospital || false,
        hasPark: cached.hasPark || false,
        parkDistance: cached.parkDistance || 0,
        hasWater: cached.hasWater || false,
        defectFlags,
        selectedDefects: cached.selectedDefects || [],
      });
    }
  },

  toggleSection(e: any) {
    const section = e.currentTarget.dataset.section;
    this.setData({ ['collapsedMap.' + section]: !this.data.collapsedMap[section] });
  },

  onInput(e: any) {
    const field = e.currentTarget.dataset.field;
    if (field) this.setData({ [field]: e.detail.value });
  },

  onNumberInput(e: any) {
    const field = e.currentTarget.dataset.field;
    if (!field) return;
    const raw = e.detail.value;
    if (raw === '' || raw === null || raw === undefined) {
      this.setData({ [field]: 0 });
      return;
    }
    const num = parseFloat(raw);
    this.setData({ [field]: isNaN(num) ? 0 : num });
  },

  onInputNumber(e: any) {
    const field = e.currentTarget.dataset.field;
    if (!field) return;
    const raw = e.detail.value;
    if (raw === '' || raw === null || raw === undefined) {
      this.setData({ [field]: 0 });
      return;
    }
    const cleaned = raw.replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    this.setData({ [field]: isNaN(num) ? 0 : num });
  },

  onDistrictChange(e: any) {
    const index = Number(e.detail.value);
    const district = DISTRICT_LIST[index];
    const bdList = DISTRICT_BD_MAP[district] || [];
    this.setData({
      districtIndex: index,
      district,
      bdList,
      bdIndex: bdList.length > 0 ? 0 : -1,
      businessDistrict: bdList.length > 0 ? bdList[0] : '',
    });
  },

  onBdChange(e: any) {
    const index = Number(e.detail.value);
    this.setData({
      bdIndex: index,
      businessDistrict: this.data.bdList[index],
    });
  },

  onOrientationChange(e: any) {
    const index = Number(e.detail.value);
    this.setData({ orientationIndex: index, orientation: ORIENTATION_LIST[index] });
  },

  onDecorationChange(e: any) {
    const index = Number(e.detail.value);
    this.setData({ decorationIndex: index, decoration: DECORATION_LIST[index] });
  },

  onElevatorChange(e: any) {
    const index = Number(e.detail.value);
    this.setData({ elevatorIndex: index, hasElevator: index === 0 });
  },

  onBuildingPositionChange(e: any) {
    const index = Number(e.detail.value);
    this.setData({ buildingPositionIndex: index, buildingPosition: BP_VALUES[index] });
  },

  onParkingTypeChange(e: any) {
    const index = Number(e.detail.value);
    this.setData({ parkingTypeIndex: index, parkingType: PT_VALUES[index] });
  },

  onSwitchChange(e: any) {
    const field = e.currentTarget.dataset.field;
    if (field) this.setData({ [field]: e.detail.value });
  },

  onDefectToggle(e: any) {
    const key = e.currentTarget.dataset.key;
    if (!key) return;
    const defectFlags = { ...this.data.defectFlags };
    defectFlags[key] = !defectFlags[key];
    const selectedDefects = Object.keys(defectFlags).filter(k => defectFlags[k]);
    this.setData({ defectFlags, selectedDefects });
  },

  onCommunityBlur(e: any) {
    const name = (e.detail.value || '').trim();
    this.setData({ communityName: name });
    if (!name) return;

    this.setData({ loading: true });
    setTimeout(() => {
      const match = matchCommunity(name);
      if (match) {
        const districtIndex = DISTRICT_LIST.indexOf(match.district);
        const bdList = DISTRICT_BD_MAP[match.district] || [];
        const bdIndex = bdList.indexOf(match.businessDistrict);
        this.setData({
          district: match.district,
          districtIndex,
          bdList,
          businessDistrict: match.businessDistrict,
          bdIndex,
          loading: false,
        });
        wx.showToast({ title: '已匹配：' + match.district + '·' + match.businessDistrict, icon: 'none' });
      } else {
        this.setData({ loading: false });
      }

      const defectMatch = matchCommunityDefects(name);
      if (defectMatch && defectMatch.defects && defectMatch.defects.length > 0) {
        const defectFlags = { ...this.data.defectFlags };
        defectMatch.defects.forEach((defectName: string) => {
          const key = DEFECT_NAME_TO_KEY[defectName];
          if (key) defectFlags[key] = true;
        });
        const selectedDefects = Object.keys(defectFlags).filter(k => defectFlags[k]);
        this.setData({ defectFlags, selectedDefects });
        wx.showToast({ title: '已识别硬伤：' + defectMatch.defects.join('、'), icon: 'none', duration: 3000 });
      }
    }, 300);
  },

  quickFill() {
    const district = '西湖区';
    const bdList = DISTRICT_BD_MAP[district] || [];
    const businessDistrict = '申花';
    const bdIndex = bdList.indexOf(businessDistrict);

    this.setData({
      district,
      districtIndex: DISTRICT_LIST.indexOf(district),
      bdList,
      businessDistrict,
      bdIndex: bdIndex >= 0 ? bdIndex : 0,
      communityName: '绿城沁园',
      area: 89,
      orientation: '南北通透',
      orientationIndex: 0,
      floor: 15,
      totalFloors: 18,
      decoration: '精装修',
      decorationIndex: 1,
      buildingAge: 5,
      hasElevator: true,
      elevatorIndex: 0,
      buildingPosition: '好位置',
      buildingPositionIndex: 1,
      marketPrice: 45000,
      monthlyRent: 5500,
      hasParkingSpace: true,
      parkingType: '产权',
      parkingTypeIndex: 0,
      parkingPrice: 30,
      propertyFee: 3.2,
      holdingYears: 5,
      riskFreeRate: 3.5,
      metroDistance: 300,
      metroLines: 2,
      busRoutes: 12,
      kindergarten: '申花实验幼儿园',
      primarySchool: '申花小学',
      middleSchool: '',
      highSchool: '',
      mallCount: 2,
      restaurantCount: 20,
      hasMarket: true,
      hasTier3Hospital: false,
      hospitalDistance: 0,
      hasCommunityHospital: true,
      hasPark: true,
      parkDistance: 200,
      hasWater: false,
      collapsedMap: {
        section1: false,
        section2: false,
        section3: false,
        section4: true,
        section5: true,
        section6: true,
        section7: true,
        section8: true,
        section9: true,
        section10: true,
        section11: true,
      },
    });
    wx.showToast({ title: '已填充示例数据', icon: 'none' });
  },

  validate(): string | null {
    const d = this.data;
    if (!d.district) return '请选择所在区域';
    if (!d.area || d.area <= 0) return '请输入建筑面积';
    if (!d.marketPrice && !d.monthlyRent) return '请至少填写均价或月租金';
    return null;
  },

  submit() {
    const error = this.validate();
    if (error) {
      wx.showToast({ title: error, icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    setTimeout(() => {
      const d = this.data;
      const input: ValuationInput = {
        district: d.district,
        businessDistrict: d.businessDistrict,
        communityName: d.communityName,
        area: d.area,
        floor: d.floor,
        totalFloors: d.totalFloors,
        orientation: d.orientation,
        decoration: d.decoration,
        buildingAge: d.buildingAge,
        hasElevator: d.hasElevator,
        marketPrice: d.marketPrice,
        monthlyRent: d.monthlyRent,
        metroDistance: d.metroDistance || null,
        metroLines: d.metroLines,
        busRoutes: d.busRoutes,
        kindergarten: d.kindergarten,
        primarySchool: d.primarySchool,
        middleSchool: d.middleSchool,
        highSchool: d.highSchool,
        mallCount: d.mallCount,
        hasMarket: d.hasMarket,
        restaurantCount: d.restaurantCount,
        hasTier3Hospital: d.hasTier3Hospital,
        hospitalDistance: d.hospitalDistance || null,
        hasCommunityHospital: d.hasCommunityHospital,
        hasPark: d.hasPark,
        parkDistance: d.parkDistance || null,
        hasWater: d.hasWater,
        buildingPosition: d.buildingPosition,
        selectedDefects: d.selectedDefects,
        hasParkingSpace: d.hasParkingSpace,
        parkingPrice: d.parkingPrice,
        parkingType: d.parkingType,
        propertyFee: d.propertyFee,
        holdingYears: d.holdingYears,
        riskFreeRate: d.riskFreeRate,
      };

      wx.setStorageSync('valuationInput', input);
      wx.navigateTo({ url: '/pages/result/result' });
      this.setData({ loading: false });
    }, 400);
  },
});
