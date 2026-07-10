import { HANGZHOU_CITY, HANGZHOU_DISTRICTS, BUSINESS_DISTRICTS, SCHOOLS } from './cityKnowledge.js';

export function calcAreaModifier(area) {
  if (area < 50) return 1.05;
  if (area < 90) return 1.02;
  if (area < 120) return 1.00;
  if (area < 144) return 0.98;
  return 0.95;
}

export function calcOrientationModifier(orientation) {
  const map = {
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

export function calcFloorModifier(floor, totalFloors, hasElevator) {
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

export function calcDecorationModifier(decoration) {
  const map = {
    '精装修': 1.10,
    '简装修': 1.03,
    '毛坯': 0.95,
    '豪华装修': 1.15,
  };
  return map[decoration] || 1.00;
}

export function calcAgeModifier(buildingAge) {
  if (!buildingAge || buildingAge <= 0) return 1.00;
  const depreciation = Math.min(buildingAge * 0.005, 0.30);
  return 1 - depreciation;
}

export function calcElevatorModifier(hasElevator, totalFloors) {
  if (totalFloors && totalFloors <= 6) {
    return hasElevator ? 1.02 : 0.98;
  }
  return hasElevator ? 1.00 : 0.90;
}

export function calcSchoolPremium(schoolName) {
  if (!schoolName) return 0;
  const school = SCHOOLS[schoolName];
  if (school) return school.premium;
  if (schoolName.includes('实验') || schoolName.includes('师范') || schoolName.includes('附属')) {
    return 0.15;
  }
  return 0.05;
}

export function calcLocationCoefficient(districtName, businessDistrict) {
  const district = HANGZHOU_DISTRICTS[districtName];
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

  if (businessDistrict && BUSINESS_DISTRICTS[businessDistrict]) {
    const bd = BUSINESS_DISTRICTS[businessDistrict];
    coefficient = bd.coefficient;
    level = bd.level;
    detail = `${businessDistrict}（${level}级板块）`;
  }

  return { coefficient, level, detail };
}

export function calcAmenitiesScore(input) {
  const { metroDistance, metroLines, busRoutes, schoolName,
    mallCount, hasMarket, restaurantCount,
    hasTier3Hospital, hospitalDistance, hasCommunityHospital,
    hasPark, parkDistance, hasWater } = input;

  let trafficScore = 0;
  let trafficDetail = [];
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
  let educationDetail = [];
  if (schoolName) {
    const school = SCHOOLS[schoolName];
    if (school) {
      educationScore = school.level === '顶级' ? 20 : school.level === '优质' ? 15 : 10;
      educationDetail.push(`${schoolName}（${school.level}，+${educationScore}）`);
    } else {
      educationScore = 8;
      educationDetail.push(`${schoolName}（普通学区+8）`);
    }
  }

  let commercialScore = 0;
  let commercialDetail = [];
  if (mallCount >= 2) { commercialScore += 12; commercialDetail.push(`${mallCount}个商场（+12）`); }
  else if (mallCount === 1) { commercialScore += 8; commercialDetail.push(`1个商场（+8）`); }
  if (hasMarket) { commercialScore += 3; commercialDetail.push('有菜市场（+3）'); }
  if (restaurantCount >= 20) { commercialScore += 3; commercialDetail.push(`${restaurantCount}家餐饮（+3）`); }
  else if (restaurantCount >= 10) { commercialScore += 1; }

  commercialScore = Math.min(commercialScore, 15);

  let medicalScore = 0;
  let medicalDetail = [];
  if (hasTier3Hospital) {
    if (hospitalDistance && hospitalDistance <= 3000) { medicalScore += 10; medicalDetail.push(`三甲医院${hospitalDistance}m（+10）`); }
    else { medicalScore += 6; medicalDetail.push('三甲医院5km内（+6）'); }
  }
  if (hasCommunityHospital) { medicalScore += 5; medicalDetail.push('社区医院（+5）'); }
  if (medicalScore === 0) { medicalScore = 3; medicalDetail.push('医疗配套信息不足'); }

  medicalScore = Math.min(medicalScore, 10);

  let natureScore = 0;
  let natureDetail = [];
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

export function calcDefects(selectedDefects) {
  const defectRules = {
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
  const defects = [];

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

export function calcBuildingPositionModifier(position) {
  const map = {
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

export function calcMarketSentiment(districtName) {
  const district = HANGZHOU_DISTRICTS[districtName];
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

export function getCapRate(districtName) {
  const district = HANGZHOU_DISTRICTS[districtName];
  if (!district) return HANGZHOU_CITY.capitalizationRate.normal;

  switch (district.level) {
    case 'core': return HANGZHOU_CITY.capitalizationRate.core;
    case 'subCore': return (HANGZHOU_CITY.capitalizationRate.core + HANGZHOU_CITY.capitalizationRate.normal) / 2;
    case 'development': return HANGZHOU_CITY.capitalizationRate.normal;
    case 'suburb': return HANGZHOU_CITY.capitalizationRate.suburb;
    default: return HANGZHOU_CITY.capitalizationRate.normal;
  }
}

export function calculateValuation(input) {
  const {
    district, businessDistrict, communityName,
    area, floor, totalFloors, orientation, decoration, buildingAge, hasElevator,
    marketPrice, monthlyRent,
    metroDistance, metroLines, busRoutes, schoolName,
    mallCount, hasMarket, restaurantCount,
    hasTier3Hospital, hospitalDistance, hasCommunityHospital,
    hasPark, parkDistance, hasWater,
    buildingPosition, selectedDefects,
  } = input;

  const results = {};
  const factors = {};

  let marketTotal = null;
  if (marketPrice && area) {
    let unitPrice = marketPrice;
    const areaMod = calcAreaModifier(area);
    const oriMod = calcOrientationModifier(orientation);
    const floorMod = calcFloorModifier(floor, totalFloors, hasElevator);
    const decMod = calcDecorationModifier(decoration);
    const ageMod = calcAgeModifier(buildingAge);
    const elevMod = calcElevatorModifier(hasElevator, totalFloors);
    const schoolPrem = calcSchoolPremium(schoolName);

    const marketSentiment = calcMarketSentiment(district);

    unitPrice = unitPrice * areaMod * oriMod * floorMod * decMod * ageMod * elevMod * (1 + schoolPrem) * marketSentiment.coefficient;

    factors.marketComparison = {
      areaMod, oriMod, floorMod, decMod, ageMod, elevMod,
      schoolPrem, marketSentiment: marketSentiment.coefficient,
    };

    marketTotal = unitPrice * area;
  }

  let incomeTotal = null;
  if (monthlyRent && area) {
    const annualRent = monthlyRent * 12 * (1 - 0.03);
    const capRate = getCapRate(district);
    incomeTotal = annualRent / capRate;

    factors.incomeApproach = {
      annualRent, capRate,
      capRatePercent: (capRate * 100).toFixed(1) + '%',
    };
  }

  let costTotal = null;
  if (marketPrice && area) {
    const landCost = marketPrice * 0.60;
    const buildCost = 3000;
    const depreciation = buildingAge ? Math.min(buildingAge * 0.01, 0.30) : 0;
    const depreciatedBuild = buildCost * (1 - depreciation);
    const costUnitPrice = landCost + depreciatedBuild;
    costTotal = costUnitPrice * area;

    factors.costApproach = { landCost, buildCost, depreciation };
  }

  let weights = { market: 0.50, income: 0.25, cost: 0.10, expert: 0.15 };
  let weightedSum = 0;
  let totalWeight = 0;

  if (marketTotal !== null) { weightedSum += marketTotal * weights.market; totalWeight += weights.market; }
  if (incomeTotal !== null) { weightedSum += incomeTotal * weights.income; totalWeight += weights.income; }
  if (costTotal !== null) { weightedSum += costTotal * weights.cost; totalWeight += weights.cost; }

  let baseValuation = totalWeight > 0 ? weightedSum / totalWeight : 0;

  const location = calcLocationCoefficient(district, businessDistrict);

  const amenities = calcAmenitiesScore(input);
  const amenitiesCoefficient = 1 + ((amenities.total - 60) / 100) * 0.3;

  const defects = calcDefects(selectedDefects || []);

  const buildingPosMod = calcBuildingPositionModifier(buildingPosition);

  const expertFactor = location.coefficient * amenitiesCoefficient * defects.coefficient * buildingPosMod;

  const finalValuation = baseValuation * expertFactor;

  const lowerBound = finalValuation * 0.90;
  const upperBound = finalValuation * 1.10;

  let confidence = 50;
  if (marketPrice) confidence += 20;
  if (monthlyRent) confidence += 15;
  if (metroDistance != null) confidence += 5;
  if (schoolName) confidence += 5;
  if (selectedDefects && selectedDefects.length > 0) confidence += 5;
  confidence = Math.min(confidence, 95);

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
    factors: {
      location,
      amenities,
      amenitiesCoefficient,
      defects,
      buildingPosition: { coefficient: buildingPosMod, position: buildingPosition },
      marketComparison: factors.marketComparison || null,
      incomeApproach: factors.incomeApproach || null,
    },
  };
}

export function formatPrice(price) {
  if (price >= 10000) {
    return (price / 10000).toFixed(1) + '万';
  }
  return Math.round(price).toString();
}

export function formatWan(price) {
  return (price / 10000).toFixed(1) + '万';
}

export function getScoreColor(score, max) {
  const ratio = score / max;
  if (ratio >= 0.8) return '#059669';
  if (ratio >= 0.6) return '#d97706';
  if (ratio >= 0.4) return '#ea580c';
  return '#dc2626';
}

export function getConfidenceClass(confidence) {
  if (confidence >= 80) return 'confidence-high';
  if (confidence >= 60) return 'confidence-medium';
  return 'confidence-low';
}