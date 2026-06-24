import { pricingData } from './pricing-data.js';

const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30.4375;
const DAYS_PER_YEAR = 365;

export function getHourlyCost(provider, service, instanceType) {
  if (!provider || !service || !instanceType) {
    return 0;
  }

  const providerData = pricingData[provider];
  if (!providerData) {
    return 0;
  }

  const serviceData = providerData[service];
  if (!serviceData) {
    return 0;
  }

  const hourly = serviceData[instanceType];
  return typeof hourly === 'number' ? hourly : 0;
}

export function calculateDailyCost(hourlyCost) {
  return hourlyCost * HOURS_PER_DAY;
}

export function calculateMonthlyCost(hourlyCost) {
  return hourlyCost * HOURS_PER_DAY * DAYS_PER_MONTH;
}

export function calculateYearlyCost(hourlyCost) {
  return hourlyCost * HOURS_PER_DAY * DAYS_PER_YEAR;
}
