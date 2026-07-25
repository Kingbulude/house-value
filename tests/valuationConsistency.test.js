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
  getDistrictBasePrice,
  calcLiquidityDiscount,
  calculateValuation,
  calculateHoldingCost,
  formatPrice,
  formatWan,
} from '../utils/valuation';

import {
  calcAreaModifier as webCalcAreaModifier,
  calcOrientationModifier as webCalcOrientationModifier,
  calcFloorModifier as webCalcFloorModifier,
  calcDecorationModifier as webCalcDecorationModifier,
  calcAgeModifier as webCalcAgeModifier,
  calcElevatorModifier as webCalcElevatorModifier,
  calcSchoolPremium as webCalcSchoolPremium,
  calcLocationCoefficient as webCalcLocationCoefficient,
  calcDefects as webCalcDefects,
  calcBuildingPositionModifier as webCalcBuildingPositionModifier,
  calcMarketSentiment as webCalcMarketSentiment,
  getCapRate as webGetCapRate,
  getDistrictBasePrice as webGetDistrictBasePrice,
  calcLiquidityDiscount as webCalcLiquidityDiscount,
  calculateValuation as webCalculateValuation,
  calculateHoldingCost as webCalculateHoldingCost,
  formatPrice as webFormatPrice,
  formatWan as webFormatWan,
} from '../web/js/valuationEngine';

describe('小程序 vs Web 版一致性测试', () => {

  describe('calcAreaModifier', () => {
    const areas = [30, 40, 60, 80, 90, 100, 120, 130, 144, 150, 200, 300];
    for (const area of areas) {
      it(`area=${area}`, () => {
        expect(calcAreaModifier(area)).toBe(webCalcAreaModifier(area));
      });
    }
  });

  describe('calcOrientationModifier', () => {
    const orientations = ['南北通透', '朝南', '东南', '南北', '东西', '朝北', '西北', '东北', '', '未知'];
    for (const ori of orientations) {
      it(`orientation="${ori}"`, () => {
        expect(calcOrientationModifier(ori)).toBe(webCalcOrientationModifier(ori));
      });
    }
  });

  describe('calcFloorModifier', () => {
    const cases = [
      [1, 18, true], [1, 6, false], [18, 18, true], [6, 6, false],
      [17, 18, true], [6, 18, true], [12, 18, true], [2, 18, true],
      [3, 18, true], [2, 6, false], [3, 6, false], [4, 6, false],
      [5, 6, false], [5, 0, true],
    ];
    for (const [floor, total, elev] of cases) {
      it(`floor=${floor}, total=${total}, elevator=${elev}`, () => {
        expect(calcFloorModifier(floor, total, elev))
          .toBe(webCalcFloorModifier(floor, total, elev));
      });
    }
  });

  describe('calcDecorationModifier', () => {
    const decs = ['豪华装修', '精装修', '简装修', '毛坯', '', '普通'];
    for (const dec of decs) {
      it(`decoration="${dec}"`, () => {
        expect(calcDecorationModifier(dec)).toBe(webCalcDecorationModifier(dec));
      });
    }
  });

  describe('calcAgeModifier', () => {
    const ages = [0, 1, 5, 10, 15, 20, 30, 60, 100];
    for (const age of ages) {
      it(`age=${age}`, () => {
        expect(calcAgeModifier(age)).toBe(webCalcAgeModifier(age));
      });
    }
  });

  describe('calcElevatorModifier', () => {
    const cases = [[true, 18], [false, 18], [true, 6], [false, 6]];
    for (const [elev, total] of cases) {
      it(`elevator=${elev}, total=${total}`, () => {
        expect(calcElevatorModifier(elev, total))
          .toBe(webCalcElevatorModifier(elev, total));
      });
    }
  });

  describe('calcBuildingPositionModifier', () => {
    const positions = ['楼王', '好位置', '一般位置', '临小区路', '临市政路', '临底商', '临垃圾站', '', '未知'];
    for (const pos of positions) {
      it(`position="${pos}"`, () => {
        expect(calcBuildingPositionModifier(pos)).toBe(webCalcBuildingPositionModifier(pos));
      });
    }
  });

  describe('calcDefects', () => {
    const defectSets = [
      [],
      ['highway_noise'],
      ['highway_noise', 'main_road_noise'],
      ['cemetery'],
      ['cemetery', 'sewage_plant', 'factory_pollution', 'garbage_station', 'substation'],
      ['unknown_defect', 'highway_noise'],
    ];
    for (const defects of defectSets) {
      it(`defects=[${defects.join(', ')}]`, () => {
        const mpResult = calcDefects(defects);
        const webResult = webCalcDefects(defects);
        expect(mpResult.coefficient).toBe(webResult.coefficient);
        expect(mpResult.defects.length).toBe(webResult.defects.length);
      });
    }
  });

  describe('calcSchoolPremium', () => {
    const schoolCases = [
      { primarySchool: '学军小学' },
      { middleSchool: '文澜中学' },
      { primarySchool: '江南实验学校' },
      { highSchool: '萧山中学' },
      { kindergarten: '省府机关幼儿园' },
      {},
      {
        kindergarten: '省府机关幼儿园',
        primarySchool: '学军小学',
        middleSchool: '文澜中学',
        highSchool: '杭州第二中学',
      },
    ];
    for (const schools of schoolCases) {
      it(`schools=${JSON.stringify(schools)}`, () => {
        const mpResult = calcSchoolPremium(schools);
        const webResult = webCalcSchoolPremium(schools);
        expect(mpResult.total).toBe(webResult.total);
        expect(mpResult.schools.length).toBe(webResult.schools.length);
      });
    }
  });

  describe('calcLocationCoefficient', () => {
    const cases = [
      ['上城区', ''],
      ['萧山区', ''],
      ['临安区', ''],
      ['上城区', '钱江新城'],
      ['未知区', ''],
    ];
    for (const [district, bd] of cases) {
      it(`district="${district}", bd="${bd}"`, () => {
        const mpResult = calcLocationCoefficient(district, bd);
        const webResult = webCalcLocationCoefficient(district, bd);
        expect(mpResult.coefficient).toBe(webResult.coefficient);
        expect(mpResult.level).toBe(webResult.level);
      });
    }
  });

  describe('getCapRate', () => {
    const districts = ['上城区', '萧山区', '钱塘区', '临安区', '未知区'];
    for (const d of districts) {
      it(`district="${d}"`, () => {
        expect(getCapRate(d)).toBe(webGetCapRate(d));
      });
    }
  });

  describe('getDistrictBasePrice', () => {
    const cases = [
      ['上城区', '钱江新城'],
      ['余杭区', '未来科技城'],
      ['未知区', ''],
    ];
    for (const [district, bd] of cases) {
      it(`district="${district}", bd="${bd}"`, () => {
        expect(getDistrictBasePrice(district, bd)).toBe(webGetDistrictBasePrice(district, bd));
      });
    }
  });

  describe('calcLiquidityDiscount', () => {
    const cases = [
      [89, 3000000],
      [150, 3000000],
      [250, 3000000],
      [89, 7000000],
      [89, 12000000],
      [300, 15000000],
    ];
    for (const [area, price] of cases) {
      it(`area=${area}, price=${price}`, () => {
        expect(calcLiquidityDiscount(area, price))
          .toBe(webCalcLiquidityDiscount(area, price));
      });
    }
  });

  describe('formatPrice', () => {
    const prices = [0, 5000, 9999, 10000, 1250000, 4500000];
    for (const p of prices) {
      it(`price=${p}`, () => {
        expect(formatPrice(p)).toBe(webFormatPrice(p));
      });
    }
  });

  describe('formatWan', () => {
    const prices = [0, 5000, 10000, 1250000];
    for (const p of prices) {
      it(`price=${p}`, () => {
        expect(formatWan(p)).toBe(webFormatWan(p));
      });
    }
  });

  describe('calcMarketSentiment', () => {
    const districts = ['滨江区', '西湖区', '淳安县', '上城区', '未知区'];
    for (const d of districts) {
      it(`district="${d}"`, () => {
        const mpResult = calcMarketSentiment(d);
        const webResult = webCalcMarketSentiment(d);
        expect(mpResult.coefficient).toBe(webResult.coefficient);
      });
    }
  });

  describe('calculateValuation 完整对比', () => {
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
      kindergarten: '',
      primarySchool: '学军小学',
      middleSchool: '',
      highSchool: '',
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
      hasParkingSpace: false,
      parkingPrice: 0,
      parkingType: '',
      propertyFee: 2.5,
      holdingYears: 5,
      riskFreeRate: 3.5,
    };

    it('有均价+租金：结果一致', () => {
      const mpResult = calculateValuation(baseInput);
      const webResult = webCalculateValuation(baseInput);
      expect(mpResult.finalValuation).toBe(webResult.finalValuation);
      expect(mpResult.unitPrice).toBe(webResult.unitPrice);
      expect(mpResult.confidence).toBe(webResult.confidence);
      expect(mpResult.weights).toEqual(webResult.weights);
    });

    it('只有均价：结果一致', () => {
      const input = { ...baseInput, monthlyRent: 0 };
      const mpResult = calculateValuation(input);
      const webResult = webCalculateValuation(input);
      expect(mpResult.finalValuation).toBe(webResult.finalValuation);
      expect(mpResult.methods.market).toBe(webResult.methods.market);
      expect(mpResult.methods.income).toBe(webResult.methods.income);
      expect(mpResult.methods.cost).toBe(webResult.methods.cost);
    });

    it('只有租金：结果一致', () => {
      const input = { ...baseInput, marketPrice: 0 };
      const mpResult = calculateValuation(input);
      const webResult = webCalculateValuation(input);
      expect(mpResult.finalValuation).toBe(webResult.finalValuation);
    });

    it('无均价无租金（用板块基准价）：结果一致', () => {
      const input = {
        ...baseInput,
        marketPrice: 0,
        monthlyRent: 0,
        businessDistrict: '钱江新城',
      };
      const mpResult = calculateValuation(input);
      const webResult = webCalculateValuation(input);
      expect(mpResult.finalValuation).toBe(webResult.finalValuation);
    });

    it('有硬伤：结果一致', () => {
      const input = {
        ...baseInput,
        selectedDefects: ['highway_noise', 'cemetery'],
      };
      const mpResult = calculateValuation(input);
      const webResult = webCalculateValuation(input);
      expect(mpResult.finalValuation).toBe(webResult.finalValuation);
      expect(mpResult.factors.defects.coefficient).toBe(webResult.factors.defects.coefficient);
    });

    it('自动匹配小区硬伤：结果一致', () => {
      const input = { ...baseInput, communityName: '绿城春来晴翠' };
      const mpResult = calculateValuation(input);
      const webResult = webCalculateValuation(input);
      expect(mpResult.finalValuation).toBe(webResult.finalValuation);
    });
  });

  describe('calculateHoldingCost 完整对比', () => {
    it('基础持有成本', () => {
      const params = {
        finalValuation: 5000000,
        area: 89,
        hasParkingSpace: false,
        parkingPrice: 0,
        parkingType: '',
        propertyFee: 2.5,
        holdingYears: 5,
        riskFreeRate: 3.5,
      };
      const mpResult = calculateHoldingCost(params);
      const webResult = webCalculateHoldingCost(params);
      expect(mpResult.annualCost).toBe(webResult.annualCost);
      expect(mpResult.totalCost).toBe(webResult.totalCost);
      expect(mpResult.monthlyEquivalent).toBe(webResult.monthlyEquivalent);
    });

    it('带产权车位', () => {
      const params = {
        finalValuation: 5000000,
        area: 89,
        hasParkingSpace: true,
        parkingPrice: 300000,
        parkingType: '产权',
        propertyFee: 2.5,
        holdingYears: 5,
        riskFreeRate: 3.5,
      };
      const mpResult = calculateHoldingCost(params);
      const webResult = webCalculateHoldingCost(params);
      expect(mpResult.annualCost).toBe(webResult.annualCost);
      expect(mpResult.annualBreakdown.parkingCost).toBe(webResult.annualBreakdown.parkingCost);
    });
  });
});
