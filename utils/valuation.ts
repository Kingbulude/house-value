import { hangzhouCity, hangzhouDistricts, hangzhouBusinessDistricts, SCHOOLS, matchCommunityDefects } from './cityKnowledge';

export interface ValuationInput {
  district: string;
  businessDistrict: string;
  communityName: string;
  area: number;
  floor: number;
  totalFloors: number;
  orientation: string;
  decoration: string;
  buildingAge: number;
  hasElevator: boolean;
  marketPrice: number;
  monthlyRent: number;
  metroDistance: number | null;
  metroLines: number;
  busRoutes: number;
  kindergarten: string;
  primarySchool: string;
  middleSchool: string;
  highSchool: string;
  mallCount: number;
  hasMarket: boolean;
  restaurantCount: number;
  hasTier3Hospital: boolean;
  hospitalDistance: number | null;
  hasCommunityHospital: boolean;
  hasPark: boolean;
  parkDistance: number | null;
  hasWater: boolean;
  buildingPosition: string;
  selectedDefects: string[];
  hasParkingSpace: boolean;
  parkingPrice: number;
  parkingType: string;
  propertyFee: number;
  holdingYears: number;
  riskFreeRate: number;
}

export interface DefectRule {
  name: string;
  coefficient: number;
  severity: string;
  desc: string;
}

export interface AmenitiesScore {
  total: number;
  traffic: { score: number; max: number; detail: string[] };
  education: { score: number; max: number; detail: string[] };
  commercial: { score: number; max: number; detail: string[] };
  medical: { score: number; max: number; detail: string[] };
  nature: { score: number; max: number; detail: string[] };
}

export interface HoldingCostResult {
  annualCost: number;
  totalCost: number;
  monthlyEquivalent: number;
  annualBreakdown: {
    opportunityCost: number;
    buildingDepreciation: number;
    propertyFee: number;
    parkingCost: number;
  };
  parking: {
    hasParkingSpace: boolean;
    parkingPrice: number;
    parkingType: string;
    parkingDetail: string;
  };
  parameters: {
    riskFreeRate: number;
    holdingYears: number;
    propertyFee: number;
  };
}

export interface ValuationResult {
  finalValuation: number;
  unitPrice: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  methods: { market: number | null; income: number | null; cost: number | null };
  weights: { market: number; income: number; cost: number };
  marketAnchor: string | null;
  factors: {
    location: { coefficient: number; level: string; detail: string };
    amenities: AmenitiesScore;
    defects: { coefficient: number; defects: DefectRule[] };
    buildingPosition: { coefficient: number; position: string };
    buildingModifiers: BuildingModifiers;
    marketComparison: any;
    incomeApproach: any;
    costApproach: any;
    liquidityDiscount: number;
  };
  holdingCost: HoldingCostResult;
  communityDefectMatch: any;
}

export interface BuildingModifiers {
  areaMod: number;
  oriMod: number;
  floorMod: number;
  decMod: number;
  ageMod: number;
  elevMod: number;
  buildingPosMod: number;
  defectsCoefficient: number;
  total: number;
}

export function calcAreaModifier(area: number): number {
  if (area < 50) return 1.05;
  if (area < 90) return 1.02;
  if (area < 120) return 1.00;
  if (area < 144) return 0.98;
  return 0.95;
}

export function calcOrientationModifier(orientation: string): number {
  const map: Record<string, number> = {
    '南北通透': 1.08,
    '朝南': 1.05,
    '东南': 1.03,
    '南北': 1.02,
    '东西': 0.97,
    '朝北': 0.95,
    '西北': 0.96,
    '东北': 0.98,
  };
  return map[orientation] || 1.00;
}

export function calcFloorModifier(floor: number, totalFloors: number, hasElevator: boolean): number {
  if (!totalFloors || totalFloors <= 0) return 1.00;

  if (floor === 1) return 0.90;

  if (floor === totalFloors) return 0.92;

  if (!hasElevator && totalFloors <= 6) {
    if (floor <= 3) return 1.03;
    if (floor === totalFloors - 1) return 0.98;
    return 1.00;
  }

  const middleStart = Math.ceil(totalFloors / 3);
  const middleEnd = Math.floor((totalFloors * 2) / 3);

  if (floor >= middleStart && floor <= middleEnd) return 1.05;
  if (floor === totalFloors - 1) return 1.03;
  if (floor <= 3) return 0.95;

  return 1.00;
}

export function calcDecorationModifier(decoration: string): number {
  const map: Record<string, number> = {
    '精装修': 1.10,
    '简装修': 1.03,
    '毛坯': 0.95,
    '豪华装修': 1.15,
  };
  return map[decoration] || 1.00;
}

export function calcAgeModifier(buildingAge: number): number {
  if (!buildingAge || buildingAge <= 0) return 1.00;
  const depreciation = Math.min(buildingAge * 0.005, 0.30);
  return 1 - depreciation;
}

export function calcElevatorModifier(hasElevator: boolean, totalFloors: number): number {
  if (totalFloors && totalFloors <= 6) {
    return hasElevator ? 1.02 : 0.98;
  }
  return hasElevator ? 1.00 : 0.90;
}

export function calcSchoolPremium(schoolInput: { kindergarten: string; primarySchool: string; middleSchool: string; highSchool: string }): { total: number; schools: any[] } {
  if (!schoolInput) return { total: 0, schools: [] };

  const { kindergarten, primarySchool, middleSchool, highSchool } = schoolInput;
  const schools: any[] = [];
  let totalPremium = 0;

  const typeWeights: Record<string, number> = {
    kindergarten: 0.4,
    primary: 1.0,
    middle: 1.0,
    high: 0.6,
  };

  const processSchool = (name: string, type: string) => {
    if (!name) return;
    const key = `${name}-${type}`;
    const school = SCHOOLS[key];
    if (school) {
      const weightedPremium = school.premium * typeWeights[type];
      totalPremium += weightedPremium;
      schools.push({ name: school.name, type, level: school.level, premium: school.premium, weightedPremium });
    } else {
      const defaultPremium = type === 'primary' || type === 'middle' ? 0.08 : 0.03;
      const weightedPremium = defaultPremium * typeWeights[type];
      totalPremium += weightedPremium;
      schools.push({ name, type, level: '普通', premium: defaultPremium, weightedPremium });
    }
  };

  processSchool(kindergarten, 'kindergarten');
  processSchool(primarySchool, 'primary');
  processSchool(middleSchool, 'middle');
  processSchool(highSchool, 'high');

  totalPremium = Math.min(totalPremium, 0.50);

  return { total: totalPremium, schools };
}

export function calcLocationCoefficient(districtName: string, businessDistrict: string): { coefficient: number; level: string; detail: string } {
  const district = hangzhouDistricts[districtName];
  let coefficient = 1.00;
  let level = 'B';
  let detail = '';

  if (district) {
    switch (district.level) {
      case 'core': coefficient = 1.10; level = 'A'; break;
      case 'subCore': coefficient = 1.05; level = 'B'; break;
      case 'development': coefficient = 1.00; level = 'C'; break;
      case 'suburb': coefficient = 0.90; level = 'D'; break;
    }
    detail = `${district.levelName}，${district.positioning}`;
  }

  if (businessDistrict && hangzhouBusinessDistricts[businessDistrict]) {
    const bd = hangzhouBusinessDistricts[businessDistrict];
    coefficient = bd.coefficient;
    level = bd.level;
    detail = `${businessDistrict}（${level}级板块）`;
  }

  return { coefficient, level, detail };
}

export function getDistrictBasePrice(districtName: string, businessDistrict: string): number | null {
  if (businessDistrict && hangzhouBusinessDistricts[businessDistrict]) {
    const bd = hangzhouBusinessDistricts[businessDistrict];
    return bd.basePrice || null;
  }
  const district = hangzhouDistricts[districtName] as any;
  if (district && district.basePrice) {
    return district.basePrice;
  }
  return null;
}

export function calcLiquidityDiscount(area: number, finalValuation: number): number {
  let discount = 0;
  if (area > 200) discount += 0.03;
  else if (area > 144) discount += 0.02;
  else if (area > 120) discount += 0.01;

  const totalWan = finalValuation / 10000;
  if (totalWan > 1000) discount += 0.03;
  else if (totalWan > 600) discount += 0.02;
  else if (totalWan > 400) discount += 0.01;

  return Math.min(discount, 0.05);
}

export function calcAmenitiesScore(input: ValuationInput): AmenitiesScore {
  const { metroDistance, metroLines, busRoutes,
    kindergarten, primarySchool, middleSchool, highSchool,
    mallCount, hasMarket, restaurantCount,
    hasTier3Hospital, hospitalDistance, hasCommunityHospital,
    hasPark, parkDistance, hasWater } = input;

  let trafficScore = 0;
  let trafficDetail: string[] = [];
  if (metroDistance != null) {
    if (metroDistance <= 300) { trafficScore += 15; trafficDetail.push(`地铁${metroDistance}m（地铁上盖+15）`); }
    else if (metroDistance <= 500) { trafficScore += 12; trafficDetail.push(`地铁${metroDistance}m（步行5分钟+12）`); }
    else if (metroDistance <= 800) { trafficScore += 8; trafficDetail.push(`地铁${metroDistance}m（步行10分钟+8）`); }
    else if (metroDistance <= 1000) { trafficScore += 4; trafficDetail.push(`地铁${metroDistance}m（步行15分钟+4）`); }
    else { trafficDetail.push(`地铁${metroDistance}m（较远）`); }
  }
  if (metroLines >= 3) { trafficScore += 10; trafficDetail.push(`${metroLines}条地铁线（换乘站+10）`); }
  else if (metroLines === 2) { trafficScore += 7; trafficDetail.push(`2条地铁线（+7）`); }
  else if (metroLines === 1) { trafficScore += 4; trafficDetail.push(`1条地铁线（+4）`); }

  if (busRoutes >= 10) { trafficScore += 5; trafficDetail.push(`${busRoutes}条公交线（+5）`); }
  else if (busRoutes >= 5) { trafficScore += 3; trafficDetail.push(`${busRoutes}条公交线（+3）`); }
  else if (busRoutes > 0) { trafficScore += 1; }

  trafficScore = Math.min(trafficScore, 25);

  let educationScore = 0;
  let educationDetail: string[] = [];

  const schoolInputs = [
    { name: kindergarten, type: 'kindergarten', label: '幼儿园' },
    { name: primarySchool, type: 'primary', label: '小学' },
    { name: middleSchool, type: 'middle', label: '初中' },
    { name: highSchool, type: 'high', label: '高中' },
  ];

  const typeMaxScores: Record<string, number> = {
    kindergarten: 5,
    primary: 8,
    middle: 8,
    high: 4,
  };

  const levelScoreMap: Record<string, Record<string, number>> = {
    '顶尖': { kindergarten: 5, primary: 8, middle: 8, high: 4 },
    '优质': { kindergarten: 4, primary: 6, middle: 6, high: 3 },
    '普通': { kindergarten: 2, primary: 3, middle: 3, high: 1 },
  };

  schoolInputs.forEach(({ name, type, label }) => {
    if (!name) return;
    const key = `${name}-${type}`;
    const school = SCHOOLS[key];
    let score = 0;
    if (school) {
      score = levelScoreMap[school.level][type] || typeMaxScores[type];
      educationDetail.push(`${label}：${school.name}（${school.level}，+${score}）`);
    } else {
      score = typeMaxScores[type] * 0.3;
      educationDetail.push(`${label}：${name}（普通，+${Math.round(score)}）`);
    }
    educationScore += score;
  });

  educationScore = Math.min(educationScore, 25);
  let commercialScore = 0;
  let commercialDetail: string[] = [];
  if (mallCount >= 2) { commercialScore += 12; commercialDetail.push(`${mallCount}个商场（+12）`); }
  else if (mallCount === 1) { commercialScore += 8; commercialDetail.push(`1个商场（+8）`); }
  if (hasMarket) { commercialScore += 3; commercialDetail.push('有菜市场（+3）'); }
  if (restaurantCount >= 20) { commercialScore += 3; commercialDetail.push(`${restaurantCount}家餐饮（+3）`); }
  else if (restaurantCount >= 10) { commercialScore += 1; }

  commercialScore = Math.min(commercialScore, 15);

  let medicalScore = 0;
  let medicalDetail: string[] = [];
  if (hasTier3Hospital) {
    if (hospitalDistance && hospitalDistance <= 3000) { medicalScore += 10; medicalDetail.push(`三甲医院${hospitalDistance}m（+10）`); }
    else { medicalScore += 6; medicalDetail.push('三甲医院5km内（+6）'); }
  }
  if (hasCommunityHospital) { medicalScore += 5; medicalDetail.push('社区医院（+5）'); }
  if (medicalScore === 0) { medicalScore = 3; medicalDetail.push('医疗配套信息不足'); }

  medicalScore = Math.min(medicalScore, 10);

  let natureScore = 0;
  let natureDetail: string[] = [];
  if (hasPark) {
    if (parkDistance && parkDistance <= 500) { natureScore += 10; natureDetail.push(`公园${parkDistance}m（+10）`); }
    else { natureScore += 6; natureDetail.push('有公园（+6）'); }
  }
  if (hasWater) { natureScore += 8; natureDetail.push('有水域景观（+8）'); }
  if (natureScore === 0) { natureScore = 2; natureDetail.push('自然环境一般'); }

  natureScore = Math.min(natureScore, 10);

  const totalScore = trafficScore + educationScore + commercialScore + medicalScore + natureScore;

  return {
    total: totalScore,
    traffic: { score: trafficScore, max: 25, detail: trafficDetail },
    education: { score: educationScore, max: 20, detail: educationDetail },
    commercial: { score: commercialScore, max: 15, detail: commercialDetail },
    medical: { score: medicalScore, max: 10, detail: medicalDetail },
    nature: { score: natureScore, max: 10, detail: natureDetail },
  };
}

export function calcDefects(selectedDefects: string[]): { coefficient: number; defects: DefectRule[] } {
  const defectRules: Record<string, DefectRule> = {
    'highway_noise': {
      name: '高架/高速噪音',
      coefficient: 0.80,
      severity: '严重',
      desc: '距离高架/高速公路<50m，噪音污染严重',
    },
    'main_road_noise': {
      name: '主干道噪音',
      coefficient: 0.90,
      severity: '中等',
      desc: '临城市主干道，距离<30m，有一定噪音',
    },
    'cemetery': {
      name: '公墓/殡仪馆',
      coefficient: 0.70,
      severity: '严重',
      desc: '距离公墓/殡仪馆<1km，心理忌讳影响大',
    },
    'substation': {
      name: '变电站/高压线',
      coefficient: 0.85,
      severity: '严重',
      desc: '距离大型变电站/高压线<300m',
    },
    'garbage_station': {
      name: '垃圾处理站',
      coefficient: 0.80,
      severity: '严重',
      desc: '距离垃圾处理站<500m，异味污染',
    },
    'sewage_plant': {
      name: '污水处理厂',
      coefficient: 0.75,
      severity: '严重',
      desc: '距离污水处理厂<1km，异味污染',
    },
    'airport_noise': {
      name: '机场航线噪音',
      coefficient: 0.88,
      severity: '中等',
      desc: '飞机起降航线正下方',
    },
    'low_ground': {
      name: '地势低洼易涝',
      coefficient: 0.85,
      severity: '严重',
      desc: '地势低于周边区域，大雨容易积水',
    },
    'gas_station': {
      name: '加油站/加气站',
      coefficient: 0.92,
      severity: '中等',
      desc: '距离加油站/加气站较近',
    },
    'poor_lighting': {
      name: '采光严重不足',
      coefficient: 0.88,
      severity: '严重',
      desc: '楼层低+楼间距小，日照<2小时',
    },
    'factory_pollution': {
      name: '工厂污染',
      coefficient: 0.82,
      severity: '严重',
      desc: '附近有化工厂/制药厂等污染企业',
    },
    'red_light': {
      name: '红灯区/治安差',
      coefficient: 0.90,
      severity: '中等',
      desc: '周边治安环境较差',
    },
  };

  let combinedCoefficient = 1.0;
  const defects: DefectRule[] = [];

  for (const key of selectedDefects) {
    const rule = defectRules[key];
    if (rule) {
      combinedCoefficient *= rule.coefficient;
      defects.push(rule);
    }
  }

  combinedCoefficient = Math.max(combinedCoefficient, 0.50);

  return { coefficient: combinedCoefficient, defects };
}

export function calcBuildingPositionModifier(position: string): number {
  const map: Record<string, number> = {
    '楼王': 1.10,
    '好位置': 1.04,
    '一般位置': 1.00,
    '临小区路': 0.96,
    '临市政路': 0.88,
    '临底商': 0.92,
    '临垃圾站': 0.82,
  };
  return map[position] || 1.00;
}

export function calcMarketSentiment(districtName: string): { coefficient: number; description: string } {
  const district = hangzhouDistricts[districtName];
  if (!district) return { coefficient: 1.00, description: '市场信息不足，按平稳估算' };

  if (district.priceTrend === 'up' && district.growthRate > 1.0) {
    return { coefficient: 1.05, description: `${district.name}人口持续流入，市场温和上行` };
  }
  if (district.priceTrend === 'up') {
    return { coefficient: 1.02, description: `${district.name}市场平稳偏热` };
  }
  if (district.priceTrend === 'down') {
    return { coefficient: 0.92, description: `${district.name}人口流出，市场偏冷` };
  }
  return { coefficient: 1.00, description: `${district.name}市场平稳` };
}

export function getCapRate(districtName: string): number {
  const district = hangzhouDistricts[districtName];
  if (!district) return hangzhouCity.capitalizationRate.normal;

  switch (district.level) {
    case 'core': return hangzhouCity.capitalizationRate.core;
    case 'subCore': return (hangzhouCity.capitalizationRate.core + hangzhouCity.capitalizationRate.normal) / 2;
    case 'development': return hangzhouCity.capitalizationRate.normal;
    case 'suburb': return hangzhouCity.capitalizationRate.suburb;
    default: return hangzhouCity.capitalizationRate.normal;
  }
}

export function calculateValuation(input: ValuationInput): ValuationResult {
  const {
    district, businessDistrict, communityName,
    area, floor, totalFloors, orientation, decoration, buildingAge, hasElevator,
    marketPrice, monthlyRent,
    metroDistance, metroLines, busRoutes,
    kindergarten, primarySchool, middleSchool, highSchool,
    mallCount, hasMarket, restaurantCount,
    hasTier3Hospital, hospitalDistance, hasCommunityHospital,
    hasPark, parkDistance, hasWater,
    buildingPosition, selectedDefects,
    hasParkingSpace, parkingPrice, parkingType,
    propertyFee, holdingYears, riskFreeRate,
  } = input;

  const factors: any = {};

  const areaMod = calcAreaModifier(area);
  const oriMod = calcOrientationModifier(orientation);
  const floorMod = calcFloorModifier(floor, totalFloors, hasElevator);
  const decMod = calcDecorationModifier(decoration);
  const ageMod = calcAgeModifier(buildingAge);
  const elevMod = calcElevatorModifier(hasElevator, totalFloors);
  const buildingPosMod = calcBuildingPositionModifier(buildingPosition);

  const communityDefectMatch = matchCommunityDefects(communityName);
  let autoDefectKeys: string[] = [];
  if (communityDefectMatch) {
    const nameToKey: Record<string, string> = {
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
    autoDefectKeys = communityDefectMatch.defects
      .map(d => nameToKey[d])
      .filter(Boolean);
  }

  const userDefects = selectedDefects || [];
  const allDefects = [...new Set([...userDefects, ...autoDefectKeys])];
  const defects = calcDefects(allDefects);

  const buildingModifier = areaMod * oriMod * floorMod * decMod * ageMod * elevMod * buildingPosMod * defects.coefficient;

  factors.buildingModifiers = {
    areaMod, oriMod, floorMod, decMod, ageMod, elevMod, buildingPosMod,
    defectsCoefficient: defects.coefficient,
    total: buildingModifier,
  };

  let marketTotal: number | null = null;
  let marketAnchor: string | null = null;
  if (marketPrice && area) {
    marketAnchor = '同小区均价';
    marketTotal = marketPrice * area * buildingModifier;
    factors.marketComparison = {
      anchor: marketAnchor,
      anchorPrice: marketPrice,
      buildingModifier,
      modifiers: { areaMod, oriMod, floorMod, decMod, ageMod, elevMod, buildingPosMod },
    };
  } else {
    const basePrice = getDistrictBasePrice(district, businessDistrict);
    if (basePrice) {
      marketAnchor = '板块基准价';
      const location = calcLocationCoefficient(district, businessDistrict);
      const schoolPremResult = calcSchoolPremium({ kindergarten, primarySchool, middleSchool, highSchool });
      const schoolPrem = schoolPremResult.total;
      const marketSentiment = calcMarketSentiment(district);

      const estimatedUnitPrice = basePrice * buildingModifier * (1 + schoolPrem) * marketSentiment.coefficient;
      marketTotal = estimatedUnitPrice * area;

      factors.marketComparison = {
        anchor: marketAnchor,
        anchorPrice: basePrice,
        buildingModifier,
        locationCoefficient: location.coefficient,
        schoolPrem,
        schoolDetails: schoolPremResult.schools,
        marketSentiment: marketSentiment.coefficient,
      };
    }
  }

  let incomeTotal: number | null = null;
  if (monthlyRent && area) {
    const annualRent = monthlyRent * 12 * (1 - 0.03);
    const capRate = getCapRate(district);
    incomeTotal = annualRent / capRate;

    factors.incomeApproach = {
      annualRent, capRate,
      capRatePercent: (capRate * 100).toFixed(1) + '%',
    };
  }

  let costTotal: number | null = null;
  if (marketPrice && area) {
    const landCost = marketPrice * 0.60;
    const buildCost = 3000;
    const depreciation = buildingAge ? Math.min(buildingAge * 0.01, 0.30) : 0;
    const depreciatedBuild = buildCost * (1 - depreciation);
    const costUnitPrice = landCost + depreciatedBuild;
    costTotal = costUnitPrice * area;

    factors.costApproach = { landCost, buildCost, depreciation };
  }

  let weights: { market: number; income: number; cost: number };
  if (marketPrice && monthlyRent) {
    weights = { market: 0.75, income: 0.15, cost: 0.10 };
  } else if (marketPrice) {
    weights = { market: 0.80, income: 0, cost: 0.20 };
  } else if (monthlyRent) {
    weights = { market: 0.25, income: 0.60, cost: 0.15 };
  } else {
    weights = { market: 0.50, income: 0.30, cost: 0.20 };
  }

  let weightedSum = 0;
  let totalWeight = 0;

  if (marketTotal !== null) { weightedSum += marketTotal * weights.market; totalWeight += weights.market; }
  if (incomeTotal !== null) { weightedSum += incomeTotal * weights.income; totalWeight += weights.income; }
  if (costTotal !== null) { weightedSum += costTotal * weights.cost; totalWeight += weights.cost; }

  let finalValuation = totalWeight > 0 ? weightedSum / totalWeight : 0;

  const liquidityDiscount = calcLiquidityDiscount(area, finalValuation);
  finalValuation = finalValuation * (1 - liquidityDiscount);

  const lowerBound = finalValuation * 0.90;
  const upperBound = finalValuation * 1.10;

  let confidence = 40;
  if (marketPrice) confidence += 25;
  if (monthlyRent) confidence += 15;
  if (metroDistance != null) confidence += 5;
  if (kindergarten || primarySchool || middleSchool || highSchool) confidence += 5;
  if (selectedDefects && selectedDefects.length > 0) confidence += 5;
  confidence = Math.min(confidence, 95);

  const holdingCost = calculateHoldingCost({
    finalValuation,
    area,
    hasParkingSpace,
    parkingPrice,
    parkingType,
    propertyFee,
    holdingYears,
    riskFreeRate,
  });

  const amenities = calcAmenitiesScore(input);
  const location = calcLocationCoefficient(district, businessDistrict);

  return {
    finalValuation: Math.round(finalValuation),
    unitPrice: Math.round(finalValuation / area),
    lowerBound: Math.round(lowerBound),
    upperBound: Math.round(upperBound),
    confidence,
    methods: {
      market: marketTotal ? Math.round(marketTotal) : null,
      income: incomeTotal ? Math.round(incomeTotal) : null,
      cost: costTotal ? Math.round(costTotal) : null,
    },
    weights,
    marketAnchor,
    factors: {
      location,
      amenities,
      defects,
      buildingPosition: { coefficient: buildingPosMod, position: buildingPosition },
      buildingModifiers: factors.buildingModifiers,
      marketComparison: factors.marketComparison || null,
      incomeApproach: factors.incomeApproach || null,
      costApproach: factors.costApproach || null,
      liquidityDiscount,
    },
    holdingCost,
    communityDefectMatch: communityDefectMatch || null,
  };
}

export function calculateHoldingCost(params: {
  finalValuation: number;
  area: number;
  hasParkingSpace: boolean;
  parkingPrice: number;
  parkingType: string;
  propertyFee: number;
  holdingYears: number;
  riskFreeRate: number;
}): HoldingCostResult {
  const {
    finalValuation,
    area,
    hasParkingSpace,
    parkingPrice,
    parkingType,
    propertyFee,
    holdingYears,
    riskFreeRate,
  } = params;

  const actualRiskFreeRate = riskFreeRate !== undefined ? riskFreeRate / 100 : 0.035;
  const actualHoldingYears = holdingYears || 5;
  const actualPropertyFee = propertyFee || 0;

  const opportunityCost = finalValuation * actualRiskFreeRate;

  const buildingDepreciation = finalValuation * 0.02;

  const annualPropertyFee = actualPropertyFee * area * 12;

  let parkingCost = 0;
  let parkingDetail = '';
  if (hasParkingSpace && parkingPrice) {
    if (parkingType === '产权') {
      parkingCost = parkingPrice * actualRiskFreeRate;
      parkingDetail = `产权车位 ${formatWan(parkingPrice)}，机会成本`;
    } else if (parkingType === '租赁') {
      parkingCost = parkingPrice * 12;
      parkingDetail = `租赁车位 ${parkingPrice}元/月`;
    }
  }

  const annualCost = opportunityCost + buildingDepreciation + annualPropertyFee + parkingCost;

  const totalCost = annualCost * actualHoldingYears;

  const monthlyEquivalent = annualCost / 12;

  return {
    annualCost: Math.round(annualCost),
    totalCost: Math.round(totalCost),
    monthlyEquivalent: Math.round(monthlyEquivalent),
    annualBreakdown: {
      opportunityCost: Math.round(opportunityCost),
      buildingDepreciation: Math.round(buildingDepreciation),
      propertyFee: Math.round(annualPropertyFee),
      parkingCost: Math.round(parkingCost),
    },
    parking: {
      hasParkingSpace: !!hasParkingSpace,
      parkingPrice,
      parkingType,
      parkingDetail,
    },
    parameters: {
      riskFreeRate: actualRiskFreeRate,
      holdingYears: actualHoldingYears,
      propertyFee: actualPropertyFee,
    },
  };
}

export function formatPrice(price: number): string {
  if (price >= 10000) {
    return (price / 10000).toFixed(1) + '万';
  }
  return Math.round(price).toString();
}

export function formatWan(price: number): string {
  return (price / 10000).toFixed(1) + '万';
}

export function getScoreColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio >= 0.8) return '#059669';
  if (ratio >= 0.6) return '#d97706';
  if (ratio >= 0.4) return '#ea580c';
  return '#dc2626';
}

export function getConfidenceClass(confidence: number): string {
  if (confidence >= 80) return 'confidence-high';
  if (confidence >= 60) return 'confidence-medium';
  return 'confidence-low';
}
