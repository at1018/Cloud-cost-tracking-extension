import { sidebarTemplate } from './sidebar-template.js';
import pricingService, { OS_MULTIPLIERS, PRICING_MODEL_MULTIPLIERS } from './pricing-service.js';
import { buildInstanceOptions, getSavedSelections, saveSelections, formatCurrency } from '../utils/helpers.js';
import { DEFAULT_SELECTIONS, INSTANCE_TYPES } from '../utils/constants.js';

const existingSidebar = document.getElementById('cloud-cost-tracker-sidebar');
const existingLauncher = document.getElementById('cloud-cost-tracker-launcher');

if (!existingSidebar && !existingLauncher) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = sidebarTemplate;
  document.body.appendChild(wrapper);

  const sidebar = document.getElementById('cloud-cost-tracker-sidebar');
  const launcher = document.getElementById('cloud-cost-tracker-launcher');
  const closeButton = document.getElementById('cct-close-btn');
  const providerSelect = document.getElementById('cct-provider');
  const serviceSelect = document.getElementById('cct-service');
  const regionSelect = document.getElementById('cct-region');
  const osSelect = document.getElementById('cct-os');
  const pricingModelSelect = document.getElementById('cct-pricing-model');
  const instanceTypeSelect = document.getElementById('cct-instance-type');
  const hourlyCostField = document.getElementById('cct-hourly-cost');
  const dailyCostField = document.getElementById('cct-daily-cost');
  const monthlyCostField = document.getElementById('cct-monthly-cost');
  const yearlyCostField = document.getElementById('cct-yearly-cost');

  const selections = getSavedSelections();

  providerSelect.value = selections.provider || DEFAULT_SELECTIONS.provider;
  serviceSelect.value = selections.service || DEFAULT_SELECTIONS.service;
  regionSelect.value = selections.region || DEFAULT_SELECTIONS.region;
  osSelect.value = selections.os || DEFAULT_SELECTIONS.os;
  pricingModelSelect.value = selections.pricingModel || DEFAULT_SELECTIONS.pricingModel;

  buildInstanceOptions(instanceTypeSelect, INSTANCE_TYPES);
  instanceTypeSelect.value = selections.instanceType || DEFAULT_SELECTIONS.instanceType;

  async function updateCosts() {
    const provider = providerSelect.value;
    const service = serviceSelect.value;
    const instanceType = instanceTypeSelect.value;
    const region = regionSelect.value;
    const os = osSelect.value;
    const pricingModel = pricingModelSelect.value;

    const hourly = await pricingService.getPrice({ provider, service, instanceType, region, os, pricingModel });
    const daily = pricingService.hourlyToDaily(hourly);
    const monthly = pricingService.hourlyToMonthly(hourly);
    const yearly = pricingService.hourlyToYearly(hourly);

    hourlyCostField.textContent = formatCurrency(hourly);
    dailyCostField.textContent = formatCurrency(daily);
    monthlyCostField.textContent = formatCurrency(monthly);
    yearlyCostField.textContent = formatCurrency(yearly);

    // Breakdown fields
    const onDemand = await pricingService.getPrice({ provider, service, instanceType, region, os, pricingModel: 'on-demand' });
    const savings = pricingService.calculateSavings(onDemand, hourly);
    const estMonthlyField = document.getElementById('cct-est-monthly');
    const estYearlyField = document.getElementById('cct-est-yearly');
    const savingsField = document.getElementById('cct-savings');
    if (estMonthlyField) estMonthlyField.textContent = formatCurrency(monthly);
    if (estYearlyField) estYearlyField.textContent = formatCurrency(yearly);
    if (savingsField) savingsField.textContent = `${formatCurrency(savings.savingsMonthly)} (${Math.round(savings.percent)}%)`;

    console.log('[CloudCost] Cost Recalculated', { provider, service, instanceType, region, os, pricingModel, hourly, daily, monthly, yearly });
  }

  function handleSelectionChange() {
    updateCosts();
    saveSelections({
      provider: providerSelect.value,
      service: serviceSelect.value,
      region: regionSelect.value,
      os: osSelect.value,
      pricingModel: pricingModelSelect.value,
      instanceType: instanceTypeSelect.value
    });
  }

  function openSidebar() {
    sidebar.classList.add('visible');
    console.log('[CloudCost] Sidebar Opened');
  }

  function closeSidebar() {
    sidebar.classList.remove('visible');
    console.log('[CloudCost] Sidebar Closed');
  }

  launcher.addEventListener('click', openSidebar);
  closeButton.addEventListener('click', closeSidebar);

  window.addEventListener('cct-open-sidebar', () => {
    console.log('[CloudCost] cct-open-sidebar event received');
    openSidebar();
  });

  providerSelect.addEventListener('change', handleSelectionChange);
  serviceSelect.addEventListener('change', handleSelectionChange);
  regionSelect.addEventListener('change', handleSelectionChange);
  osSelect.addEventListener('change', handleSelectionChange);
  pricingModelSelect.addEventListener('change', handleSelectionChange);
  instanceTypeSelect.addEventListener('change', handleSelectionChange);

  updateCosts();
  chrome.storage.local.get(Object.keys(DEFAULT_SELECTIONS), (items) => {
    if (items && Object.keys(items).length) {
      providerSelect.value = items.provider || providerSelect.value;
      serviceSelect.value = items.service || serviceSelect.value;
      regionSelect.value = items.region || regionSelect.value;
      osSelect.value = items.os || osSelect.value;
      pricingModelSelect.value = items.pricingModel || pricingModelSelect.value;
      instanceTypeSelect.value = items.instanceType || instanceTypeSelect.value;
      updateCosts();
    }
  });
}
