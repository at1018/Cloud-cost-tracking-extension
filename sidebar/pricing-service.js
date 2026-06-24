export const OS_MULTIPLIERS = {
  linux: 1.0,
  windows: 1.30,
  'ubuntu-pro': 1.05,
  rhel: 1.15,
  suse: 1.12
};

export const PRICING_MODEL_MULTIPLIERS = {
  'on-demand': 1.0,
  reserved: 0.70,
  spot: 0.35,
  'savings-plan': 0.80
};

const CACHE = {};

async function loadJSON(path) {
  if (CACHE[path]) return CACHE[path];
  const url = chrome.runtime.getURL(path);
  const res = await fetch(url);
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
  getPrice,
  getRegionPrice,
  calculateSavings,
  hourlyToDaily,
  hourlyToMonthly,
  hourlyToYearly
};
