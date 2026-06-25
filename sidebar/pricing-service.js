export const REGION_MULTIPLIERS = {
  'us-east-1': 1.00,
  'us-west-2': 1.05,
  'eu-west-1': 1.10,
  'ap-south-1': 1.07,
  'ap-southeast-1': 1.08
};

export const OS_MULTIPLIERS = {
  linux: 1.00,
  windows: 1.80,
  'ubuntu-pro': 1.15,
  rhel: 1.35,
  suse: 1.25
};

export const PRICING_MODEL_MULTIPLIERS = {
  'on-demand': 1.00,
  reserved: 0.70,
  'savings-plan': 0.60,
  spot: 0.35
};

const CACHE = {};

function getRuntimeBase() {
  return document.documentElement.getAttribute('data-cct-runtime-base') || '';
}

async function loadJSON(path) {
  if (CACHE[path]) return CACHE[path];
  const runtimeBase = getRuntimeBase();
  const url = runtimeBase + path;
  console.log('[CloudCost] Runtime Base:', runtimeBase);
  console.log('[CloudCost] loadJSON URL:', url);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = await res.json();
  CACHE[path] = json;
  return json;
}

export async function getRegionPrice(provider, service, instanceType, region) {
  // Load correct dataset
  if (provider !== 'aws') return 0;
  const keyMap = {
    ec2: 'data/aws-ec2-pricing.json',
    rds: 'data/aws-rds-pricing.json',
    lambda: 'data/aws-lambda-pricing.json',
    s3: 'data/aws-s3-pricing.json'
  };
  const path = keyMap[service];
  if (!path) return 0;
  const data = await loadJSON(path);
  // For lambda and s3 special handling
  if (service === 'lambda') {
    const base = data.lambda && data.lambda[region];
    return typeof base === 'number' ? base : (data.lambda && data.lambda['us-east-1']) || 0;
  }
  if (service === 's3') {
    // instanceType mapped to storage class
    const entry = data[instanceType] || data['s3-standard'];
    return (entry && entry[region]) || (entry && entry['us-east-1']) || 0;
  }

  const entry = data[instanceType];
  if (!entry) return 0;
  return entry[region] || entry['us-east-1'] || 0;
}

export async function getRDSInstancePrice(engine = 'postgresql', instanceClass, region = 'us-east-1') {
  const rdsData = await loadJSON('data/aws-rds-pricing.json');
  const engineKey = (engine || 'postgresql').toLowerCase();
  const engineTable = rdsData[engineKey] || rdsData.postgresql || {};
  const instanceEntry = engineTable[instanceClass] || {};
  return instanceEntry[region] || instanceEntry['us-east-1'] || 0;
}

function safeNumber(v) { return Number(v) || 0; }

export async function calculateEC2Cost({ provider='aws', service='ec2', instanceType, region='us-east-1', os='linux', pricingModel='on-demand' }) {
  const base = await getRegionPrice(provider, service, instanceType, region);
  const regionMul = REGION_MULTIPLIERS[region] || 1.0;
  const osMul = OS_MULTIPLIERS[os] || 1.0;
  const modelMul = PRICING_MODEL_MULTIPLIERS[pricingModel] || 1.0;
  const hourly = Number(base) * regionMul * osMul * modelMul;
  const daily = hourlyToDaily(hourly);
  const monthly = hourlyToMonthly(hourly);
  const yearly = hourlyToYearly(hourly);
  const result = { hourly, daily, monthly, yearly, breakdown: { base, regionMul, osMul, modelMul } };
  console.log('[CloudCost] EC2 Cost Result', result);
  return result;
}

export async function calculateRDSCost({ instanceClass, region='us-east-1', engine='postgresql', storageGB=20, pricingModel='on-demand' }) {
  const baseComputePrice = await getRDSInstancePrice(engine, instanceClass, region);
  const regionMul = REGION_MULTIPLIERS[region] || 1.0;
  const modelMul = PRICING_MODEL_MULTIPLIERS[pricingModel] || 1.0;
  const hourly = Number(baseComputePrice) * regionMul * modelMul;
  const daily = hourlyToDaily(hourly);
  const monthlyCompute = hourlyToMonthly(hourly);
  const rdsData = await loadJSON('data/aws-rds-pricing.json');
  const storagePrices = rdsData.storage_per_gb || {};
  const storagePerGB = storagePrices[region] || storagePrices['us-east-1'] || 0;
  const storageMonthly = safeNumber(storageGB) * storagePerGB;
  const monthly = monthlyCompute + storageMonthly;
  const yearly = monthly * 12;
  const result = {
    hourly,
    daily,
    monthly,
    yearly,
    storageMonthly,
    monthlyCompute,
    storagePerGB,
    computeHourly: hourly,
    breakdown: { computeHourly: hourly, storageMonthly, regionMul, modelMul, engine: engine.toLowerCase(), region }
  };
  console.log('[CloudCost] RDS Cost Result', result);
  return result;
}

export async function calculateLambdaCost({ region='us-east-1', memoryMB=128, requestsPerMonth=1000000, avgDurationMs=100 }) {
  const data = await loadJSON('data/aws-lambda-pricing.json');
  const computePerGBSecond = (data.lambda && data.lambda[region]) || (data.lambda && data.lambda['us-east-1']) || 0;
  const requestPrice = data.request_price || 0.0000002; // default $0.20 per 1M
  const memoryGB = Number(memoryMB) / 1024;
  const durationSec = Number(avgDurationMs) / 1000;
  const totalGBSeconds = memoryGB * durationSec * Number(requestsPerMonth);
  const computeCost = totalGBSeconds * computePerGBSecond;
  const requestCost = Number(requestsPerMonth) * requestPrice;
  const monthly = computeCost + requestCost;
  const hourly = monthly / (24 * 30.4375);
  const daily = hourlyToDaily(hourly);
  const yearly = hourlyToYearly(hourly);
  const result = { computeCost, requestCost, monthly, hourly, daily, yearly, breakdown: { computePerGBSecond, requestPrice, memoryGB, durationSec } };
  console.log('[CloudCost] Lambda Cost Result', result);
  return result;
}

export async function calculateS3Cost({ storageClass='s3-standard', region='us-east-1', storageGB=100, putRequests=1000, getRequests=1000 }) {
  const data = await loadJSON('data/aws-s3-pricing.json');
  const entry = data[storageClass] || data['s3-standard'] || {};
  const storagePerGB = entry[region] || entry['us-east-1'] || 0;
  const requestPrices = data.request_prices || { PUT_per_1000: 0.005, GET_per_1000: 0.0004 };
  const storageCost = Number(storageGB) * storagePerGB;
  const putCost = (Number(putRequests) / 1000) * (requestPrices.PUT_per_1000 || 0);
  const getCost = (Number(getRequests) / 1000) * (requestPrices.GET_per_1000 || 0);
  const monthly = storageCost + putCost + getCost;
  const hourly = monthly / (24 * 30.4375);
  const daily = hourlyToDaily(hourly);
  const yearly = hourlyToYearly(hourly);
  const result = { storageCost, putCost, getCost, monthly, hourly, daily, yearly, breakdown: { storagePerGB, requestPrices } };
  console.log('[CloudCost] S3 Cost Result', result);
  return result;
}

export async function calculateComparison(aConfig, bConfig) {
  // For now comparison focused on EC2-like instances
  const a = await calculateEC2Cost(aConfig);
  const b = await calculateEC2Cost(bConfig);
  const hourlyDiff = b.hourly - a.hourly;
  const monthlyDiff = b.monthly - a.monthly;
  const yearlyDiff = b.yearly - a.yearly;
  const percent = calculateSavingsPercentage(a.hourly, b.hourly);
  return { a, b, hourlyDiff, monthlyDiff, yearlyDiff, percent };
}

export function calculateYearlyCost(hourly) { return hourlyToYearly(Number(hourly) || 0); }

export function calculateSavingsPercentage(baseHourly, compareHourly) {
  const base = Number(baseHourly) || 0;
  const comp = Number(compareHourly) || 0;
  if (base === 0) return 0;
  return ((base - comp) / base) * 100;
}

export async function getPrice({ provider='aws', service='ec2', instanceType, region='us-east-1', os='linux', pricingModel='on-demand' }) {
  const base = await getRegionPrice(provider, service, instanceType, region);
  const osMul = OS_MULTIPLIERS[os] || 1.0;
  const modelMul = PRICING_MODEL_MULTIPLIERS[pricingModel] || 1.0;
  const price = base * osMul * modelMul;
  return Number(price || 0);
}

export function calculateSavings(onDemandPrice, selectedPrice) {
  const savingsHourly = Math.max(0, onDemandPrice - selectedPrice);
  const savingsMonthly = savingsHourly * 24 * 30.4375;
  const savingsYearly = savingsHourly * 24 * 365;
  const percent = onDemandPrice > 0 ? (savingsHourly / onDemandPrice) * 100 : 0;
  return {
    savingsHourly,
    savingsMonthly,
    savingsYearly,
    percent
  };
}

export function hourlyToDaily(hourly) { return hourly * 24; }
export function hourlyToMonthly(hourly) { return hourly * 24 * 30.4375; }
export function hourlyToYearly(hourly) { return hourly * 24 * 365; }

export default {
  // constants
  REGION_MULTIPLIERS,
  OS_MULTIPLIERS,
  PRICING_MODEL_MULTIPLIERS,
  // loaders
  getRegionPrice,
  getPrice,
  // calculators
  calculateEC2Cost,
  calculateRDSCost,
  calculateLambdaCost,
  calculateS3Cost,
  calculateComparison,
  calculateYearlyCost,
  calculateSavingsPercentage,
  calculateSavings,
  // helpers
  hourlyToDaily,
  hourlyToMonthly,
  hourlyToYearly
};
