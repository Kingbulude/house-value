import { describe, it, expect } from 'vitest';
import {
  calcAreaModifier,
  calcOrientationModifier,
  calcFloorModifier,
  calcDecorationModifier,
  calcAgeModifier,
  calcElevatorModifier,
  calcSchoolPremium,
  calcLocationCoefficient,
  calcDefects,
  calcBuildingPositionModifier,
  calcMarketSentiment,
  getCapRate,
  calculateValuation,
  calculateHoldingCost,
  formatPrice,
  formatWan,
  getScoreColor,
  getConfidenceClass,
} from '../web/js/valuationEngine.js';

describe('calcAreaModifier', () => {
  it('should return correct modifier for different area ranges', () => {
    expect(calcAreaModifier(40)).toBe(1.05);
    expect(calcAreaModifier(60)).toBe(1.02);
    expect(calcAreaModifier(90)).toBe(1.00);
    expect(calcAreaModifier(100)).toBe(1.00);
    expect(calcAreaModifier(130)).toBe(0.98);
    expect(calcAreaModifier(150)).toBe(0.95);
    expect(calcAreaModifier(200)).toBe(0.95);
  });
});

describe('calcOrientationModifier', () => {
  it('should return correct modifier for valid orientations', () => {
    expect(calcOrientationModifier('南北通透')).toBe(1.08);
    expect(calcOrientationModifier('朝南')).toBe(1.05);
    expect(calcOrientationModifier('东南')).toBe(1.03);
    expect(calcOrientationModifier('南北')).toBe(1.02);
    expect(calcOrientationModifier('东西')).toBe(0.97);
    expect(calcOrientationModifier('朝北')).toBe(0.95);
    expect(calcOrientationModifier('西北')).toBe(0.96);
    expect(calcOrientationModifier('东北')).toBe(0.98);
  });

  it('should return 1.00 for unknown orientations', () => {
    expect(calcOrientationModifier('东')).toBe(1.00);
    expect(calcOrientationModifier('')).toBe(1.00);
    expect(calcOrientationModifier(null)).toBe(1.00);
  });
});

describe('calcFloorModifier', () => {
  it('should return 0.90 for floor 1', () => {
    expect(calcFloorModifier(1, 18, true)).toBe(0.90);
    expect(calcFloorModifier(1, 6, false)).toBe(0.90);
  });

  it('should return 0.92 for top floor', () => {
    expect(calcFloorModifier(18, 18, true)).toBe(0.92);
    expect(calcFloorModifier(6, 6, false)).toBe(0.92);
  });

  it('should return 1.03 for sub-top floor', () => {
    expect(calcFloorModifier(17, 18, true)).toBe(1.03);
  });

  it('should return 1.05 for middle floors (golden zone)', () => {
    expect(calcFloorModifier(6, 18, true)).toBe(1.05);
    expect(calcFloorModifier(12, 18, true)).toBe(1.05);
  });

  it('should return 0.95 for low floors with elevator', () => {
    expect(calcFloorModifier(2, 18, true)).toBe(0.95);
    expect(calcFloorModifier(3, 18, true)).toBe(0.95);
  });

  it('should handle non-elevator buildings', () => {
    expect(calcFloorModifier(2, 6, false)).toBe(1.03);
    expect(calcFloorModifier(3, 6, false)).toBe(1.03);
    expect(calcFloorModifier(4, 6, false)).toBe(1.00);
    expect(calcFloorModifier(5, 6, false)).toBe(0.98);
  });

  it('should return 1.00 for invalid inputs', () => {
    expect(calcFloorModifier(5, 0, true)).toBe(1.00);
    expect(calcFloorModifier(5, null, true)).toBe(1.00);
    expect(calcFloorModifier(5, undefined, true)).toBe(1.00);
  });
});

describe('calcDecorationModifier', () => {
  it('should return correct modifier for different decorations', () => {
    expect(calcDecorationModifier('豪华装修')).toBe(1.15);
    expect(calcDecorationModifier('精装修')).toBe(1.10);
    expect(calcDecorationModifier('简装修')).toBe(1.03);
    expect(calcDecorationModifier('毛坯')).toBe(0.95);
  });

  it('should return 1.00 for unknown decorations', () => {
    expect(calcDecorationModifier('')).toBe(1.00);
    expect(calcDecorationModifier('普通')).toBe(1.00);
  });
});

describe('calcAgeModifier', () => {
  it('should return 1.00 for buildings 0-5 years', () => {
    expect(calcAgeModifier(0)).toBe(1.00);
    expect(calcAgeModifier(5)).toBe(0.975);
  });

  it('should calculate depreciation correctly', () => {
    expect(calcAgeModifier(10)).toBe(0.95);
    expect(calcAgeModifier(20)).toBe(0.90);
    expect(calcAgeModifier(30)).toBe(0.85);
  });

  it('should cap depreciation at 30%', () => {
    expect(calcAgeModifier(60)).toBe(0.70);
    expect(calcAgeModifier(100)).toBe(0.70);
  });

  it('should return 1.00 for invalid inputs', () => {
    expect(calcAgeModifier(0)).toBe(1.00);
    expect(calcAgeModifier(-1)).toBe(1.00);
    expect(calcAgeModifier(null)).toBe(1.00);
  });
});

describe('calcElevatorModifier', () => {
  it('should return 1.00 for buildings with elevator', () => {
    expect(calcElevatorModifier(true, 18)).toBe(1.00);
  });

  it('should return 0.90 for high-rise without elevator', () => {
    expect(calcElevatorModifier(false, 18)).toBe(0.90);
  });

  it('should return 1.02/0.98 for low-rise buildings', () => {
    expect(calcElevatorModifier(true, 6)).toBe(1.02);
    expect(calcElevatorModifier(false, 6)).toBe(0.98);
  });
});

describe('calcSchoolPremium', () => {
  it('should return correct premium for top-tier schools', () => {
    expect(calcSchoolPremium('学军小学')).toBe(0.45);
    expect(calcSchoolPremium('胜利实验学校')).toBe(0.40);
    expect(calcSchoolPremium('天长小学')).toBe(0.40);
  });

  it('should return correct premium for quality schools', () => {
    expect(calcSchoolPremium('江南实验学校')).toBe(0.30);
    expect(calcSchoolPremium('文澜中学')).toBe(0.30);
  });

  it('should return correct premium for normal schools', () => {
    expect(calcSchoolPremium('萧山中学')).toBe(0.15);
    expect(calcSchoolPremium('富阳中学')).toBe(0.10);
  });

  it('should return 0.15 for schools with keywords', () => {
    expect(calcSchoolPremium('实验学校')).toBe(0.15);
    expect(calcSchoolPremium('师范学校')).toBe(0.15);
    expect(calcSchoolPremium('附属学校')).toBe(0.15);
  });

  it('should return 0.05 for unknown schools', () => {
    expect(calcSchoolPremium('普通小学')).toBe(0.05);
  });

  it('should return 0 for empty school name', () => {
    expect(calcSchoolPremium('')).toBe(0);
    expect(calcSchoolPremium(null)).toBe(0);
  });
});

describe('calcLocationCoefficient', () => {
  it('should return correct coefficient for core districts', () => {
    const result = calcLocationCoefficient('上城区', '');
    expect(result.coefficient).toBe(1.10);
    expect(result.level).toBe('A');
  });

  it('should return correct coefficient for subCore districts', () => {
    const result = calcLocationCoefficient('萧山区', '');
    expect(result.coefficient).toBe(1.05);
    expect(result.level).toBe('B');
  });

  it('should return correct coefficient for suburbs', () => {
    const result = calcLocationCoefficient('临安区', '');
    expect(result.coefficient).toBe(0.90);
    expect(result.level).toBe('D');
  });

  it('should override with business district coefficient', () => {
    const result = calcLocationCoefficient('上城区', '钱江新城');
    expect(result.coefficient).toBe(1.25);
    expect(result.level).toBe('S');
  });

  it('should return default for unknown districts', () => {
    const result = calcLocationCoefficient('未知区', '');
    expect(result.coefficient).toBe(1.00);
    expect(result.level).toBe('B');
  });
});

describe('calcDefects', () => {
  it('should return 1.00 for no defects', () => {
    const result = calcDefects([]);
    expect(result.coefficient).toBe(1.00);
    expect(result.defects).toEqual([]);
  });

  it('should multiply coefficients for multiple defects', () => {
    const result = calcDefects(['highway_noise', 'main_road_noise']);
    expect(result.coefficient).toBeCloseTo(0.72, 2);
    expect(result.defects.length).toBe(2);
  });

  it('should cap coefficient at 0.50', () => {
    const result = calcDefects(['cemetery', 'sewage_plant', 'factory_pollution', 'garbage_station', 'substation']);
    expect(result.coefficient).toBe(0.50);
  });

  it('should ignore unknown defects', () => {
    const result = calcDefects(['unknown_defect', 'highway_noise']);
    expect(result.coefficient).toBe(0.80);
    expect(result.defects.length).toBe(1);
  });
});

describe('calcBuildingPositionModifier', () => {
  it('should return correct modifier for different positions', () => {
    expect(calcBuildingPositionModifier('楼王')).toBe(1.10);
    expect(calcBuildingPositionModifier('好位置')).toBe(1.04);
    expect(calcBuildingPositionModifier('一般位置')).toBe(1.00);
    expect(calcBuildingPositionModifier('临小区路')).toBe(0.96);
    expect(calcBuildingPositionModifier('临市政路')).toBe(0.88);
    expect(calcBuildingPositionModifier('临底商')).toBe(0.92);
    expect(calcBuildingPositionModifier('临垃圾站')).toBe(0.82);
  });

  it('should return 1.00 for unknown positions', () => {
    expect(calcBuildingPositionModifier('')).toBe(1.00);
    expect(calcBuildingPositionModifier('未知')).toBe(1.00);
  });
});

describe('calcMarketSentiment', () => {
  it('should return 1.05 for districts with strong growth', () => {
    const result = calcMarketSentiment('滨江区');
    expect(result.coefficient).toBe(1.05);
  });

  it('should return 1.02 for districts with moderate growth', () => {
    const result = calcMarketSentiment('西湖区');
    expect(result.coefficient).toBe(1.02);
  });

  it('should return 0.92 for districts with declining trend', () => {
    const result = calcMarketSentiment('淳安县');
    expect(result.coefficient).toBe(0.92);
  });

  it('should return 1.00 for stable districts', () => {
    const result = calcMarketSentiment('上城区');
    expect(result.coefficient).toBe(1.00);
  });

  it('should return default for unknown districts', () => {
    const result = calcMarketSentiment('未知区');
    expect(result.coefficient).toBe(1.00);
  });
});

describe('getCapRate', () => {
  it('should return correct cap rate for different district levels', () => {
    expect(getCapRate('上城区')).toBe(0.035);
    expect(getCapRate('萧山区')).toBeCloseTo(0.040, 3);
    expect(getCapRate('钱塘区')).toBe(0.045);
    expect(getCapRate('临安区')).toBe(0.055);
  });

  it('should return normal cap rate for unknown districts', () => {
    expect(getCapRate('未知区')).toBe(0.045);
  });
});

describe('calculateValuation', () => {
  const baseInput = {
    district: '上城区',
    businessDistrict: '',
    communityName: '测试小区',
    area: 89,
    floor: 6,
    totalFloors: 18,
    orientation: '南北通透',
    decoration: '精装修',
    buildingAge: 5,
    hasElevator: true,
    marketPrice: 50000,
    monthlyRent: 5000,
    metroDistance: 500,
    metroLines: 2,
    busRoutes: 10,
    schoolName: '学军小学',
    mallCount: 2,
    hasMarket: true,
    restaurantCount: 20,
    hasTier3Hospital: true,
    hospitalDistance: 2000,
    hasCommunityHospital: true,
    hasPark: true,
    parkDistance: 500,
    hasWater: true,
    buildingPosition: '楼王',
    selectedDefects: [],
  };

  it('should calculate valuation with all data', () => {
    const result = calculateValuation(baseInput);
    expect(result.finalValuation).toBeGreaterThan(0);
    expect(result.unitPrice).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(50);
    expect(result.methods.market).toBeGreaterThan(0);
    expect(result.methods.income).toBeGreaterThan(0);
    expect(result.methods.cost).toBeGreaterThan(0);
  });

  it('should handle missing market price', () => {
    const input = { ...baseInput, marketPrice: 0 };
    const result = calculateValuation(input);
    expect(result.finalValuation).toBeGreaterThan(0);
    expect(result.methods.market).toBeNull();
    expect(result.methods.cost).toBeNull();
  });

  it('should handle missing monthly rent', () => {
    const input = { ...baseInput, monthlyRent: 0 };
    const result = calculateValuation(input);
    expect(result.finalValuation).toBeGreaterThan(0);
    expect(result.methods.income).toBeNull();
  });

  it('should handle minimum required data', () => {
    const input = {
      district: '上城区',
      area: 89,
      marketPrice: 50000,
      monthlyRent: 0,
      floor: 6,
      totalFloors: 18,
      orientation: '南北通透',
      decoration: '简装修',
      buildingAge: 5,
      hasElevator: true,
      buildingPosition: '一般位置',
      selectedDefects: [],
    };
    const result = calculateValuation(input);
    expect(result.finalValuation).toBeGreaterThan(0);
  });

  it('should calculate confidence correctly', () => {
    const input1 = { ...baseInput, metroDistance: null, schoolName: '', selectedDefects: [] };
    const result1 = calculateValuation(input1);
    expect(result1.confidence).toBe(50 + 20 + 15);

    const input2 = { ...baseInput };
    const result2 = calculateValuation(input2);
    expect(result2.confidence).toBe(95);
  });
});

describe('formatPrice', () => {
  it('should format prices >= 10000 as 万', () => {
    expect(formatPrice(10000)).toBe('1.0万');
    expect(formatPrice(1250000)).toBe('125.0万');
    expect(formatPrice(4500000)).toBe('450.0万');
  });

  it('should format prices < 10000 as regular numbers', () => {
    expect(formatPrice(5000)).toBe('5000');
    expect(formatPrice(9999)).toBe('9999');
    expect(formatPrice(0)).toBe('0');
  });
});

describe('formatWan', () => {
  it('should always format as 万', () => {
    expect(formatWan(10000)).toBe('1.0万');
    expect(formatWan(5000)).toBe('0.5万');
    expect(formatWan(1250000)).toBe('125.0万');
  });
});

describe('getScoreColor', () => {
  it('should return correct color based on score ratio', () => {
    expect(getScoreColor(80, 100)).toBe('#059669');
    expect(getScoreColor(60, 100)).toBe('#d97706');
    expect(getScoreColor(40, 100)).toBe('#ea580c');
    expect(getScoreColor(20, 100)).toBe('#dc2626');
  });
});

describe('getConfidenceClass', () => {
  it('should return correct class based on confidence', () => {
    expect(getConfidenceClass(90)).toBe('confidence-high');
    expect(getConfidenceClass(80)).toBe('confidence-high');
    expect(getConfidenceClass(70)).toBe('confidence-medium');
    expect(getConfidenceClass(60)).toBe('confidence-medium');
    expect(getConfidenceClass(50)).toBe('confidence-low');
    expect(getConfidenceClass(40)).toBe('confidence-low');
  });
});

describe('calculateHoldingCost', () => {
  it('should calculate basic holding cost without parking', () => {
    const result = calculateHoldingCost({
      finalValuation: 5000000,
      area: 89,
      propertyFee: 2.5,
      holdingYears: 5,
      riskFreeRate: 3.5,
    });

    expect(result.annualCost).toBeGreaterThan(0);
    expect(result.annualBreakdown.opportunityCost).toBe(175000);
    expect(result.annualBreakdown.buildingDepreciation).toBe(100000);
    expect(result.annualBreakdown.propertyFee).toBe(2670);
    expect(result.annualBreakdown.parkingCost).toBe(0);
    expect(result.totalCost).toBe(result.annualCost * 5);
    expect(result.monthlyEquivalent).toBe(Math.round(result.annualCost / 12));
    expect(result.parameters.riskFreeRate).toBe(0.035);
    expect(result.parameters.holdingYears).toBe(5);
  });

  it('should calculate with owned parking space', () => {
    const result = calculateHoldingCost({
      finalValuation: 5000000,
      area: 89,
      hasParkingSpace: true,
      parkingPrice: 300000,
      parkingType: '产权',
      propertyFee: 2.5,
      holdingYears: 5,
      riskFreeRate: 3.5,
    });

    expect(result.annualBreakdown.parkingCost).toBe(10500);
    expect(result.parking.hasParkingSpace).toBe(true);
    expect(result.parking.parkingType).toBe('产权');
  });

  it('should calculate with rented parking space', () => {
    const result = calculateHoldingCost({
      finalValuation: 5000000,
      area: 89,
      hasParkingSpace: true,
      parkingPrice: 500,
      parkingType: '租赁',
      propertyFee: 2.5,
      holdingYears: 5,
      riskFreeRate: 3.5,
    });

    expect(result.annualBreakdown.parkingCost).toBe(6000);
    expect(result.parking.parkingType).toBe('租赁');
  });

  it('should use default values when parameters are missing', () => {
    const result = calculateHoldingCost({
      finalValuation: 5000000,
      area: 89,
    });

    expect(result.parameters.riskFreeRate).toBe(0.035);
    expect(result.parameters.holdingYears).toBe(5);
    expect(result.parameters.propertyFee).toBe(0);
    expect(result.annualBreakdown.propertyFee).toBe(0);
  });

  it('should handle zero risk-free rate', () => {
    const result = calculateHoldingCost({
      finalValuation: 5000000,
      area: 89,
      riskFreeRate: 0,
    });

    expect(result.annualBreakdown.opportunityCost).toBe(0);
  });
});

describe('calculateValuation with holding cost', () => {
  it('should include holding cost in result', () => {
    const input = {
      district: '上城区',
      area: 89,
      marketPrice: 50000,
      floor: 6,
      totalFloors: 18,
      orientation: '南北通透',
      decoration: '简装修',
      buildingAge: 5,
      hasElevator: true,
      buildingPosition: '一般位置',
      selectedDefects: [],
      hasParkingSpace: true,
      parkingPrice: 300000,
      parkingType: '产权',
      propertyFee: 3.0,
      holdingYears: 10,
      riskFreeRate: 3.5,
    };

    const result = calculateValuation(input);
    expect(result.holdingCost).toBeDefined();
    expect(result.holdingCost.annualCost).toBeGreaterThan(0);
    expect(result.holdingCost.totalCost).toBeGreaterThan(0);
    expect(result.holdingCost.parking.hasParkingSpace).toBe(true);
  });
});