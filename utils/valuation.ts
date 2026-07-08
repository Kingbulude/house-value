/**
 * 房产估值核心算法
 * 纯前端计算，不涉及外部数据抓取
 */

export interface HouseInfo {
  city: string;
  community: string;
  area: number; // 建筑面积 m2
  roomCount: number;
  hallCount: number;
  floor: number;
  totalFloor: number;
  hasElevator: boolean;
  direction: string;
  decoration: string;
  buildYear: number;
}

export interface ReferenceData {
  nearbyPrice: number; // 同小区近期成交均价（元/m2）
  monthlyRent: number; // 同户型月租金（元）
  govPrice?: number; // 政府指导价（元/m2），可选
}

export interface ValuationResult {
  rentMethod: { min: number; max: number };
  compareMethod: number;
  govMethod?: number;
  composite: { min: number; max: number; suggest: number };
  coefficientDetail: Record<string, number>;
}

const DIRECTION_MAP: Record<string, number> = {
  '南北通透': 1.08,
  '南向': 1.05,
  '东南': 1.03,
  '东向': 1.0,
  '西南': 0.98,
  '西向': 0.95,
  '东北': 0.93,
  '北向': 0.9,
};

const DECORATION_MAP: Record<string, number> = {
  '精装': 1.05,
  '简装': 1.0,
  '毛坯': 0.9,
};

function getFloorCoefficient(floor: number, totalFloor: number, hasElevator: boolean): number {
  if (floor === totalFloor) return 0.95;
  if (floor === 1) return 0.95;
  if (floor === totalFloor - 1) return 1.05;
  if (totalFloor <= 6) {
    if (floor <= 3 && !hasElevator) return 0.92;
    return 1.0;
  }
  if (floor <= 3 && hasElevator) return 0.98;
  if (floor <= 3 && !hasElevator) return 0.88;
  return 1.0;
}

function getAgeCoefficient(buildYear: number): number {
  const age = new Date().getFullYear() - buildYear;
  if (age <= 5) return 1.05;
  if (age <= 10) return 1.0;
  if (age <= 15) return 0.95;
  if (age <= 20) return 0.88;
  return 0.8;
}

function getElevatorCoefficient(totalFloor: number, hasElevator: boolean): number {
  if (totalFloor <= 6) return 1.0;
  return hasElevator ? 1.03 : 0.95;
}

function computeCoefficient(info: HouseInfo): Record<string, number> {
  const floorCoef = getFloorCoefficient(info.floor, info.totalFloor, info.hasElevator);
  const directionCoef = DIRECTION_MAP[info.direction] ?? 1.0;
  const decorationCoef = DECORATION_MAP[info.decoration] ?? 1.0;
  const ageCoef = getAgeCoefficient(info.buildYear);
  const elevatorCoef = getElevatorCoefficient(info.totalFloor, info.hasElevator);

  return {
    floor: floorCoef,
    direction: directionCoef,
    decoration: decorationCoef,
    age: ageCoef,
    elevator: elevatorCoef,
    total: floorCoef * directionCoef * decorationCoef * ageCoef * elevatorCoef,
  };
}

export function calculateValuation(
  info: HouseInfo,
  ref: ReferenceData
): ValuationResult {
  const coef = computeCoefficient(info);

  // 租金回报率法：合理年回报率 3.5% ~ 5.5%
  const rentReturnLow = 0.035;
  const rentReturnHigh = 0.055;
  const rentMethodMin = (ref.monthlyRent * 12) / rentReturnHigh;
  const rentMethodMax = (ref.monthlyRent * 12) / rentReturnLow;

  // 市场比价法
  const compareMethod = ref.nearbyPrice * info.area * coef.total;

  // 政府指导价法
  let govMethod: number | undefined;
  if (ref.govPrice && ref.govPrice > 0) {
    govMethod = ref.govPrice * info.area * coef.total;
  }

  // 综合估值：有数据的加权平均
  const values: number[] = [];
  const weights: number[] = [];

  values.push((rentMethodMin + rentMethodMax) / 2);
  weights.push(0.35);

  values.push(compareMethod);
  weights.push(0.45);

  if (govMethod !== undefined) {
    values.push(govMethod);
    weights.push(0.2);
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const suggest = values.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;

  // 综合区间：取最低法和最高法
  const allMethods = [rentMethodMin, rentMethodMax, compareMethod];
  if (govMethod !== undefined) allMethods.push(govMethod);
  const compositeMin = Math.min(...allMethods) * 0.95;
  const compositeMax = Math.max(...allMethods) * 1.05;

  return {
    rentMethod: { min: Math.round(rentMethodMin), max: Math.round(rentMethodMax) },
    compareMethod: Math.round(compareMethod),
    govMethod: govMethod !== undefined ? Math.round(govMethod) : undefined,
    composite: {
      min: Math.round(compositeMin),
      max: Math.round(compositeMax),
      suggest: Math.round(suggest),
    },
    coefficientDetail: coef,
  };
}

export function formatPrice(price: number): string {
  if (price >= 10000) {
    return (price / 10000).toFixed(2) + '万';
  }
  return price.toLocaleString('zh-CN') + '元';
}

export function formatPricePerSqm(price: number, area: number): string {
  const pps = Math.round(price / area);
  return pps.toLocaleString('zh-CN') + '元/m²';
}
