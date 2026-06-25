import { sidebarTemplate } from './sidebar-template.js';
import * as pricingService from './pricing-service.js';
import { buildInstanceOptions, getSavedSelections, saveSelections, formatCurrency, validatePositiveNumber, showInlineError, clearInlineError } from '../utils/helpers.js';
import { DEFAULT_SELECTIONS, INSTANCE_TYPES } from '../utils/constants.js';

function getRuntimeBase() {
  return document.documentElement.getAttribute('data-cct-runtime-base') || '';
}

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
  const hourlyLabel = document.getElementById('cct-hourly-label');
  const hourlyCostField = document.getElementById('cct-hourly-cost');
  const dailyLabel = document.getElementById('cct-daily-label');
  const dailyCostField = document.getElementById('cct-daily-cost');
  const monthlyCostField = document.getElementById('cct-monthly-cost');
  const yearlyCostField = document.getElementById('cct-yearly-cost');
  const rdsNote = document.getElementById('cct-rds-note');

  const selections = getSavedSelections();

  buildInstanceOptions(instanceTypeSelect, INSTANCE_TYPES);
  instanceTypeSelect.value = selections.instanceType || DEFAULT_SELECTIONS.instanceType;

  // Service specific elements
  const rdsEngine = document.getElementById('cct-rds-engine');
  const rdsPricingModelSelect = document.getElementById('cct-rds-pricing-model');
  const rdsInstance = document.getElementById('cct-rds-instance');
  const rdsStorage = document.getElementById('cct-rds-storage');

  providerSelect.value = selections.provider || DEFAULT_SELECTIONS.provider;
  serviceSelect.value = selections.service || DEFAULT_SELECTIONS.service;
  regionSelect.value = selections.region || DEFAULT_SELECTIONS.region;
  osSelect.value = selections.os || DEFAULT_SELECTIONS.os;
  pricingModelSelect.value = selections.pricingModel || DEFAULT_SELECTIONS.pricingModel;
  if (rdsEngine) rdsEngine.value = selections.rdsEngine || DEFAULT_SELECTIONS.rdsEngine;
  if (rdsPricingModelSelect) rdsPricingModelSelect.value = selections.rdsPricingModel || DEFAULT_SELECTIONS.rdsPricingModel;

  const lambdaMemory = document.getElementById('cct-lambda-memory');
  const lambdaRequests = document.getElementById('cct-lambda-requests');
  const lambdaDuration = document.getElementById('cct-lambda-duration');

  const s3Storage = document.getElementById('cct-s3-storage');
  const s3Put = document.getElementById('cct-s3-put');
  const s3Get = document.getElementById('cct-s3-get');
  const s3Tier = document.getElementById('cct-s3-tier');

  const ec2Fields = document.getElementById('cct-ec2-fields');
  const rdsFields = document.getElementById('cct-rds-fields');
  const lambdaFields = document.getElementById('cct-lambda-fields');
  const s3Fields = document.getElementById('cct-s3-fields');
  const compareCard = document.querySelector('.cct-compare-card');
  const osGroup = document.getElementById('cct-os-group');
  const pricingModelGroup = document.getElementById('cct-pricing-model-group');
  const rdsPricingModelGroup = document.getElementById('cct-rds-pricing-model-group');
  const instanceTypeGroup = document.getElementById('cct-instance-type-group');

  const compareSelect = document.getElementById('cct-compare-instance');
  buildInstanceOptions(compareSelect, INSTANCE_TYPES);
  compareSelect.value = selections.compareInstance || INSTANCE_TYPES[1] || instanceTypeSelect.value;

  const breakdownLabel1 = document.getElementById('cct-breakdown-label-1');
  const breakdownValue1 = document.getElementById('cct-breakdown-value-1');
  const breakdownLabel2 = document.getElementById('cct-breakdown-label-2');
  const breakdownValue2 = document.getElementById('cct-breakdown-value-2');
  const breakdownLabel3 = document.getElementById('cct-breakdown-label-3');
  const breakdownValue3 = document.getElementById('cct-breakdown-value-3');
  const breakdownLabel4 = document.getElementById('cct-breakdown-label-4');
  const breakdownValue4 = document.getElementById('cct-breakdown-value-4');
  const breakdownLabel5 = document.getElementById('cct-breakdown-label-5');
  const breakdownValue5 = document.getElementById('cct-breakdown-value-5');
  const breakdownRow6 = document.getElementById('cct-breakdown-row-6');
  const breakdownLabel6 = document.getElementById('cct-breakdown-label-6');
  const breakdownValue6 = document.getElementById('cct-breakdown-value-6');
  const breakdownRow7 = document.getElementById('cct-breakdown-row-7');
  const breakdownLabel7 = document.getElementById('cct-breakdown-label-7');
  const breakdownValue7 = document.getElementById('cct-breakdown-value-7');
  const savingsYearlyRow = document.getElementById('cct-s3-savings-yearly-row');
  const savingsYearly = document.getElementById('cct-savings-yearly');
  const savingsLabel = document.getElementById('cct-savings-label');

  async function updateCosts() {
    const provider = providerSelect.value;
    const service = serviceSelect.value;
    const instanceType = instanceTypeSelect.value;
    const region = regionSelect.value;
    const os = osSelect.value;
    const pricingModel = pricingModelSelect.value;

    if (!validateInputs()) {
      hourlyCostField.textContent = formatCurrency(0);
      dailyCostField.textContent = formatCurrency(0);
      monthlyCostField.textContent = formatCurrency(0);
      yearlyCostField.textContent = formatCurrency(0);
      const estMonthlyField = document.getElementById('cct-est-monthly');
      const estYearlyField = document.getElementById('cct-est-yearly');
      const savingsField = document.getElementById('cct-savings');
      if (estMonthlyField) estMonthlyField.textContent = formatCurrency(0);
      if (estYearlyField) estYearlyField.textContent = formatCurrency(0);
      if (savingsField) savingsField.textContent = '-';
      if (compareCard) compareCard.classList.toggle('hidden', true);
      if (breakdownLabel1 && breakdownValue1) {
        breakdownLabel1.textContent = 'Invalid input';
        breakdownValue1.textContent = '-';
        breakdownLabel2.textContent = '';
        breakdownValue2.textContent = '';
        breakdownLabel3.textContent = '';
        breakdownValue3.textContent = '';
        breakdownLabel4.textContent = '';
        breakdownValue4.textContent = '';
        if (breakdownLabel5 && breakdownValue5) {
          breakdownLabel5.textContent = '';
          breakdownValue5.textContent = '';
        }
      }
      sidebar.classList.remove('loading');
      return;
    }

    sidebar.classList.add('loading');
    try {
      let result = null;
      if (service === 'ec2') {
        result = await pricingService.calculateEC2Cost({ provider, service, instanceType, region, os, pricingModel });
      } else if (service === 'rds') {
        const rdsInst = rdsInstance.value || instanceType;
        const storageGB = Number(rdsStorage.value || 20);
        result = await pricingService.calculateRDSCost({ instanceClass: rdsInst, region, engine: rdsEngine.value, storageGB, pricingModel: rdsPricingModelSelect.value });
      } else if (service === 'lambda') {
        result = await pricingService.calculateLambdaCost({ region, memoryMB: Number(lambdaMemory.value), requestsPerMonth: Number(lambdaRequests.value), avgDurationMs: Number(lambdaDuration.value) });
      } else if (service === 's3') {
        result = await pricingService.calculateS3Cost({ storageClass: s3Tier.value, region, storageGB: Number(s3Storage.value), putRequests: Number(s3Put.value), getRequests: Number(s3Get.value) });
      }

      const hourly = result?.hourly || 0;
      const daily = result?.daily || 0;
      const monthly = result?.monthly || 0;
      const yearly = result?.yearly || 0;

      hourlyCostField.textContent = formatCurrency(hourly);
      dailyCostField.textContent = formatCurrency(daily);
      monthlyCostField.textContent = formatCurrency(monthly);
      yearlyCostField.textContent = formatCurrency(yearly);

      // Breakdown update
      const estMonthlyField = document.getElementById('cct-est-monthly');
      const estYearlyField = document.getElementById('cct-est-yearly');
      const savingsField = document.getElementById('cct-savings');
      if (estMonthlyField) estMonthlyField.textContent = formatCurrency(monthly);
      if (estYearlyField) estYearlyField.textContent = formatCurrency(yearly);
      if (savingsField) {
        if (service === 's3') {
          const standardResult = await pricingService.calculateS3Cost({ storageClass: 's3-standard', region, storageGB: Number(s3Storage.value), putRequests: Number(s3Put.value), getRequests: Number(s3Get.value) });
          const monthlySavings = standardResult.monthly - monthly;
          const yearlySavings = standardResult.yearly - yearly;
          savingsField.textContent = formatCurrency(monthlySavings);
          if (savingsLabel) {
            savingsLabel.textContent = 'Monthly Savings vs Standard';
          }
          if (savingsYearly) {
            savingsYearly.textContent = formatCurrency(yearlySavings);
          }
          if (savingsYearlyRow) {
            savingsYearlyRow.classList.toggle('hidden', false);
          }
          console.log('[CloudCost] S3 Savings Calculated', { storageClass: s3Tier.value, region, storageGB: Number(s3Storage.value), putRequests: Number(s3Put.value), getRequests: Number(s3Get.value), monthlySavings, yearlySavings });
        } else {
          const onDemandModel = 'on-demand';
          const onDemandResult =
            service === 'rds'
              ? await pricingService.calculateRDSCost({ instanceClass: rdsInstance.value || instanceType, region, engine: rdsEngine.value, storageGB: Number(rdsStorage.value || 20), pricingModel: onDemandModel })
              : service === 'ec2'
              ? await pricingService.calculateEC2Cost({ provider, service: 'ec2', instanceType, region, os, pricingModel: onDemandModel })
              : null;

          if (onDemandResult) {
            const savingsObj = pricingService.calculateSavings(onDemandResult.hourly, hourly);
            savingsField.textContent = `${formatCurrency(savingsObj.savingsMonthly)} (${Math.round(savingsObj.percent)}%)`;
          } else {
            savingsField.textContent = `-`;
          }
          if (savingsYearlyRow) {
            savingsYearlyRow.classList.toggle('hidden', true);
          }
          if (savingsYearly) {
            savingsYearly.textContent = '$0.00';
          }
          if (savingsLabel) {
            savingsLabel.textContent = 'Savings vs On-Demand';
          }
        }
      }

      if (service === 'ec2') {
        const compareInstance = compareSelect.value;
        const compareMonthlyField = document.getElementById('cct-compare-monthly');
        const compareYearlyField = document.getElementById('cct-compare-yearly');
        if (compareInstance) {
          const comp = await pricingService.calculateEC2Cost({ provider, service: 'ec2', instanceType: compareInstance, region, os, pricingModel });
          const diffMonthly = comp.monthly - monthly;
          const diffYearly = comp.yearly - yearly;
          if (compareMonthlyField) compareMonthlyField.textContent = formatCurrency(diffMonthly);
          if (compareYearlyField) compareYearlyField.textContent = formatCurrency(diffYearly);
        }
      }

      if (compareCard) {
        compareCard.classList.toggle('hidden', service !== 'ec2');
      }

      if (breakdownLabel1 && breakdownValue1) {
        if (service === 'ec2') {
          breakdownLabel1.textContent = 'Base Instance Cost';
          breakdownValue1.textContent = formatCurrency(result.breakdown.base);
          breakdownLabel2.textContent = 'Region Multiplier';
          breakdownValue2.textContent = result.breakdown.regionMul.toFixed(2);
          breakdownLabel3.textContent = 'OS Multiplier';
          breakdownValue3.textContent = result.breakdown.osMul.toFixed(2);
          breakdownLabel4.textContent = 'Pricing Model Multiplier';
          breakdownValue4.textContent = result.breakdown.modelMul.toFixed(2);
          if (breakdownLabel5 && breakdownValue5) {
            breakdownLabel5.textContent = '';
            breakdownValue5.textContent = '';
          }
        } else if (service === 'rds') {
          breakdownLabel1.textContent = 'Base Compute Cost';
          breakdownValue1.textContent = formatCurrency(result.monthlyCompute);
          breakdownLabel2.textContent = 'Storage Cost';
          breakdownValue2.textContent = formatCurrency(result.storageMonthly);
          breakdownLabel3.textContent = 'Engine';
          breakdownValue3.textContent = rdsEngine.value.charAt(0).toUpperCase() + rdsEngine.value.slice(1);
          breakdownLabel4.textContent = 'Pricing Model';
          breakdownValue4.textContent = rdsPricingModelSelect.value === 'reserved' ? 'Reserved' : 'On Demand';
          if (breakdownLabel5 && breakdownValue5) {
            breakdownLabel5.textContent = 'Region';
            breakdownValue5.textContent = region;
          }
        } else if (service === 'lambda') {
          breakdownLabel1.textContent = 'Compute Cost';
          breakdownValue1.textContent = formatCurrency(result.computeCost);
          breakdownLabel2.textContent = 'Request Cost';
          breakdownValue2.textContent = formatCurrency(result.requestCost);
          breakdownLabel3.textContent = 'Duration (s)';
          breakdownValue3.textContent = result.breakdown.durationSec.toFixed(2);
          breakdownLabel4.textContent = 'Memory (GB)';
          breakdownValue4.textContent = result.breakdown.memoryGB.toFixed(2);
        } else if (service === 's3') {
          breakdownLabel1.textContent = 'Storage Cost';
          breakdownValue1.textContent = formatCurrency(result.storageCost);
          breakdownLabel2.textContent = 'PUT Request Cost';
          breakdownValue2.textContent = formatCurrency(result.putCost);
          breakdownLabel3.textContent = 'GET Request Cost';
          breakdownValue3.textContent = formatCurrency(result.getCost);
          breakdownLabel4.textContent = 'Storage Tier';
          breakdownValue4.textContent = s3Tier.selectedOptions?.[0]?.textContent || s3Tier.value;
          if (breakdownLabel5 && breakdownValue5) {
            breakdownLabel5.textContent = 'Region';
            breakdownValue5.textContent = region;
          }
          if (breakdownRow6 && breakdownLabel6 && breakdownValue6) {
            breakdownRow6.classList.remove('hidden');
            breakdownLabel6.textContent = 'Total Monthly Cost';
            breakdownValue6.textContent = formatCurrency(result.monthly);
          }
          if (breakdownRow7 && breakdownLabel7 && breakdownValue7) {
            breakdownRow7.classList.remove('hidden');
            breakdownLabel7.textContent = 'Total Yearly Cost';
            breakdownValue7.textContent = formatCurrency(result.yearly);
          }
        }
      }

      console.log('[CloudCost] Final UI Update', { provider, service, instanceType, region, os, pricingModel, hourly, daily, monthly, yearly });
      console.log('[CloudCost] Cost Recalculated', { provider, service, instanceType, region, os, pricingModel, hourly, daily, monthly, yearly });
    } catch (err) {
      console.error('[CloudCost] updateCosts error', err);
    } finally {
      sidebar.classList.remove('loading');
    }
  }

  function handleSelectionChange() {
    updateCosts();
    saveSelections({
      provider: providerSelect.value,
      service: serviceSelect.value,
      region: regionSelect.value,
      os: osSelect.value,
      pricingModel: pricingModelSelect.value,
      rdsEngine: rdsEngine.value,
      rdsPricingModel: rdsPricingModelSelect.value,
      instanceType: instanceTypeSelect.value
    });
  }

  function validateInputs() {
    let valid = true;

    clearInlineError(instanceTypeSelect);
    clearInlineError(rdsInstance);
    clearInlineError(rdsStorage);
    clearInlineError(lambdaMemory);
    clearInlineError(lambdaRequests);
    clearInlineError(lambdaDuration);
    clearInlineError(s3Storage);
    clearInlineError(s3Put);
    clearInlineError(s3Get);

    if (serviceSelect.value === 'ec2' && !instanceTypeSelect.value) {
      showInlineError(instanceTypeSelect, 'Select an instance type');
      valid = false;
    }

    if (serviceSelect.value === 'rds') {
      if (!rdsInstance.value || rdsInstance.value.trim() === '') {
        showInlineError(rdsInstance, 'Select an RDS instance class');
        valid = false;
      }
      if (!validatePositiveNumber(rdsStorage.value)) {
        showInlineError(rdsStorage, 'Storage must be a positive number');
        valid = false;
      }
      if (!rdsPricingModelSelect.value) {
        showInlineError(rdsPricingModelSelect, 'Select an RDS pricing model');
        valid = false;
      }
    }

    if (serviceSelect.value === 'lambda') {
      if (!validatePositiveNumber(lambdaMemory.value)) {
        showInlineError(lambdaMemory, 'Memory must be positive');
        valid = false;
      }
      if (!validatePositiveNumber(lambdaRequests.value)) {
        showInlineError(lambdaRequests, 'Requests must be positive');
        valid = false;
      }
      if (!validatePositiveNumber(lambdaDuration.value)) {
        showInlineError(lambdaDuration, 'Duration must be positive');
        valid = false;
      }
    }

    if (serviceSelect.value === 's3') {
      if (!validatePositiveNumber(s3Storage.value)) {
        showInlineError(s3Storage, 'Storage must be positive');
        valid = false;
      }
      if (!validatePositiveNumber(s3Put.value)) {
        showInlineError(s3Put, 'PUT request count must be positive');
        valid = false;
      }
      if (!validatePositiveNumber(s3Get.value)) {
        showInlineError(s3Get, 'GET request count must be positive');
        valid = false;
      }
    }

    return valid;
  }

  function updateServiceVisibility(service) {
    ec2Fields.classList.toggle('hidden', service !== 'ec2');
    rdsFields.classList.toggle('hidden', service !== 'rds');
    lambdaFields.classList.toggle('hidden', service !== 'lambda');
    s3Fields.classList.toggle('hidden', service !== 's3');

    compareCard && compareCard.classList.toggle('hidden', service !== 'ec2');

    osGroup && osGroup.classList.toggle('hidden', service !== 'ec2');
    pricingModelGroup && pricingModelGroup.classList.toggle('hidden', service !== 'ec2');
    rdsPricingModelGroup && rdsPricingModelGroup.classList.toggle('hidden', service !== 'rds');
    instanceTypeGroup && instanceTypeGroup.classList.toggle('hidden', service !== 'ec2');

    if (hourlyLabel && dailyLabel) {
      if (service === 'rds') {
        hourlyLabel.textContent = 'Hourly Cost (Compute)';
        dailyLabel.textContent = 'Daily Cost (Compute)';
      } else if (service === 's3') {
        hourlyLabel.textContent = 'Estimated Hourly Equivalent';
        dailyLabel.textContent = 'Estimated Daily Equivalent';
      } else {
        hourlyLabel.textContent = 'Hourly Cost';
        dailyLabel.textContent = 'Daily Cost';
      }
    }

    if (rdsNote) {
      rdsNote.classList.toggle('hidden', service !== 'rds');
    }

    if (savingsYearlyRow) {
      savingsYearlyRow.classList.toggle('hidden', service !== 's3');
    }
    if (breakdownRow6) {
      breakdownRow6.classList.toggle('hidden', service !== 's3');
    }
    if (breakdownRow7) {
      breakdownRow7.classList.toggle('hidden', service !== 's3');
    }

    console.log('[CloudCost] Service Visibility Updated:', service);
  }

  function renderServiceForm() {
    updateServiceVisibility(serviceSelect.value);
  }
  // populate RDS instance options from dataset
  async function populateRDSInstances(engine = 'postgresql') {
    try {
      const runtimeBase = getRuntimeBase();
      const url = runtimeBase + 'data/aws-rds-pricing.json';

      console.log('[CloudCost] Runtime Base:', runtimeBase);
      console.log('[CloudCost] RDS URL:', url);
      console.log('[CloudCost] RDS Engine:', engine);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      const engineKey = engine.toLowerCase();
      const enginePrices = json[engineKey] || json.postgresql || {};
      const keys = Object.keys(enginePrices);

      buildInstanceOptions(rdsInstance, keys);
      if (keys.length > 0) {
        rdsInstance.value = keys[0];
        console.log('[CloudCost] RDS Instance Selected:', rdsInstance.value);
        updateCosts();
      }

      console.log('[CloudCost] RDS instances loaded:', keys.length, 'for engine', engineKey);
    } catch (err) {
      console.error('[CloudCost] failed to load rds instances', err);
    }
  }
//   async function populateRDSInstances() {
//   try {

//     const base =
//       (typeof window !== 'undefined' && window.__CCT_RUNTIME_BASE)
//         ? window.__CCT_RUNTIME_BASE
//         : (chrome && chrome.runtime
//             ? chrome.runtime.getURL('')
//             : '');

//     const url = base
//       ? base + 'data/aws-rds-pricing.json'
//       : 'data/aws-rds-pricing.json';

//     console.log('[CloudCost] RDS URL:', url);

//     const res = await fetch(url);

//     console.log('[CloudCost] Status:', res.status);

//     const text = await res.text();

//     console.log(
//       '[CloudCost] First 200 chars:',
//       text.substring(0, 200)
//     );

//     const json = JSON.parse(text);

//     const keys = Object.keys(json)
//       .filter(k => !k.startsWith('storage_per_gb'));

//     console.log('[CloudCost] RDS Keys:', keys);

//     buildInstanceOptions(rdsInstance, keys);

//     if (!rdsInstance.value) {
//       rdsInstance.value = keys[0] || '';
//     }

//   } catch (err) {
//     console.error(
//       '[CloudCost] failed to load rds instances',
//       err
//     );
//   }
// }
  // async function populateRDSInstances() {
  //   try {
  //     const base = (typeof window !== 'undefined' && window.__CCT_RUNTIME_BASE) ? window.__CCT_RUNTIME_BASE : (chrome && chrome.runtime ? chrome.runtime.getURL('') : '');
  //     const url = base ? (base + 'data/aws-rds-pricing.json') : 'data/aws-rds-pricing.json';
  //     const res = await fetch(url);
  //     const json = await res.json();
  //     const keys = Object.keys(json).filter(k => !k.startsWith('storage_per_gb'));
  //     // If storage_per_gb exists, keys will include it; filter common patterns
  //     buildInstanceOptions(rdsInstance, keys);
  //     if (!rdsInstance.value) rdsInstance.value = keys[0] || '';
  //   } catch (err) {
  //     console.warn('[CloudCost] failed to load rds instances', err);
  //   }
  // }

  // Wire service form listeners
  serviceSelect.addEventListener('change', () => {
    updateServiceVisibility(serviceSelect.value);
    handleSelectionChange();
  });

  rdsEngine && rdsEngine.addEventListener('change', async () => {
    await populateRDSInstances(rdsEngine.value);
    handleSelectionChange();
  });
  rdsInstance && rdsInstance.addEventListener('change', handleSelectionChange);
  rdsPricingModelSelect && rdsPricingModelSelect.addEventListener('change', handleSelectionChange);
  rdsStorage && rdsStorage.addEventListener('input', () => {
    if (!validatePositiveNumber(rdsStorage.value)) showInlineError(rdsStorage, 'Storage must be a positive number'); else clearInlineError(rdsStorage);
    handleSelectionChange();
  });
  lambdaMemory && lambdaMemory.addEventListener('input', () => { if (!validatePositiveNumber(lambdaMemory.value)) showInlineError(lambdaMemory, 'Memory must be positive'); else clearInlineError(lambdaMemory); handleSelectionChange(); });
  lambdaRequests && lambdaRequests.addEventListener('input', () => { if (!validatePositiveNumber(lambdaRequests.value)) showInlineError(lambdaRequests, 'Requests must be positive'); else clearInlineError(lambdaRequests); handleSelectionChange(); });
  lambdaDuration && lambdaDuration.addEventListener('input', () => { if (!validatePositiveNumber(lambdaDuration.value)) showInlineError(lambdaDuration, 'Duration must be positive'); else clearInlineError(lambdaDuration); handleSelectionChange(); });

  s3Storage && s3Storage.addEventListener('input', () => { if (!validatePositiveNumber(s3Storage.value)) showInlineError(s3Storage, 'Storage must be positive'); else clearInlineError(s3Storage); handleSelectionChange(); });
  s3Put && s3Put.addEventListener('input', () => { if (!validatePositiveNumber(s3Put.value)) showInlineError(s3Put, 'Request count invalid'); else clearInlineError(s3Put); handleSelectionChange(); });
  s3Get && s3Get.addEventListener('input', () => { if (!validatePositiveNumber(s3Get.value)) showInlineError(s3Get, 'Request count invalid'); else clearInlineError(s3Get); handleSelectionChange(); });
  s3Tier && s3Tier.addEventListener('change', () => {
    console.log('[CloudCost] S3 Tier Changed', s3Tier.value);
    handleSelectionChange();
  });

  compareSelect && compareSelect.addEventListener('change', handleSelectionChange);

  // initial render and populate
  updateServiceVisibility(serviceSelect.value);
  populateRDSInstances(rdsEngine ? rdsEngine.value : 'postgresql');

  // function openSidebar() {
  //   sidebar.classList.add('visible');
  //   console.log('[CloudCost] Sidebar Opened');
  // }
  function openSidebar() {
  console.log('[CloudCost] Before:', sidebar.className);

  sidebar.classList.remove('hidden');
  sidebar.classList.remove('loading');
  sidebar.classList.add('visible');

  console.log('[CloudCost] After:', sidebar.className);
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
  regionSelect.addEventListener('change', handleSelectionChange);
  osSelect.addEventListener('change', handleSelectionChange);
  pricingModelSelect.addEventListener('change', handleSelectionChange);
  instanceTypeSelect.addEventListener('change', handleSelectionChange);

  updateCosts();
  // chrome.storage is only available to extension contexts; guard its usage
  try {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(Object.keys(DEFAULT_SELECTIONS), (items) => {
        if (items && Object.keys(items).length) {
          providerSelect.value = items.provider || providerSelect.value;
          serviceSelect.value = items.service || serviceSelect.value;
          regionSelect.value = items.region || regionSelect.value;
          osSelect.value = items.os || osSelect.value;
          pricingModelSelect.value = items.pricingModel || pricingModelSelect.value;
          if (rdsEngine) rdsEngine.value = items.rdsEngine || rdsEngine.value;
          if (rdsPricingModelSelect) rdsPricingModelSelect.value = items.rdsPricingModel || rdsPricingModelSelect.value;
          instanceTypeSelect.value = items.instanceType || instanceTypeSelect.value;
          updateCosts();
        }
      });
    }
  } catch (e) {
    // running in page context where chrome.storage is not available — ignore
  }
}
