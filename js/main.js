"use strict";

const inputs = document.querySelectorAll('input[type="text"]');

function debounced(delay, fn) {
  let timerId;
  return function (...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  }
}

// validate input values
function inputsValid(e) {
  const val = parseInt(e.target.value);
  let valid = true;

  if (e.target.nextSibling.classList) {
    if(e.target.nextSibling.classList.contains('error')) {
      e.target.nextSibling.remove();
    }
  }

  if (!Number.isInteger(val)) {
    e.srcElement.insertAdjacentHTML('afterend', '<div class="error">Please enter a number</div>');
    valid = false;
  } else if (val <= 0) {
    e.srcElement.insertAdjacentHTML('afterend', '<div class="error">Please enter a positive value</div>');
    valid = false;
  }

  return valid;
}

// check if all fields have been filled out
function allFieldsFilled() {
  let fieldsFilled = true;
  inputs.forEach(function(input) {
    if (!input.value.trim()) {
      fieldsFilled = false;
    }
  });
  return fieldsFilled;
}

function calcFutureValue(cont, nom, inflat, num) {
  const realRateOfReturn = ((1 + nom) / (1 + inflat)) - 1;
  const futureValue = cont * ((1 + realRateOfReturn) ** num);
  return futureValue;
}

function formatCurrency(money) {
  return new Intl.NumberFormat('en-CA', 
    { style: 'currency', currency: 'CAD' }
  ).format(money);
}

function updateCalculations(e) {
  if (inputsValid(e) && allFieldsFilled()) {
    // inputs
    const currentTaxRate = document.getElementById('cur_tax_rate').value * 0.01;
    const retirementTaxRate = document.getElementById('ret_tax_rate').value * 0.01;
    const depositAmount = document.getElementById('dep_amount').value;
    const yearsOfInvestment = document.getElementById('yoi').value;
    const returnOnInvestment = document.getElementById('roi').value * 0.01;
    const inflationRate = document.getElementById('inflat_rate').value * 0.01;

    const yearLabel = document.getElementById('year_text');
    yearLabel.innerHTML = yearsOfInvestment;

    // results
    const tsfaAfterTax = document.getElementById('tsfa_after_tax');
    const rrspAfterTax = document.getElementById('rrsp_after_tax');
    const tsfaFutureValue = document.getElementById('tsfa_fv');
    const rrspFutureValue = document.getElementById('rrsp_fv');
    const tsfaTaxPaid = document.getElementById('tsfa_tax_paid');
    const rrspTaxPaid = document.getElementById('rrsp_tax_paid');
    const tsfaAfterTaxFutureValue = document.getElementById('tsfa_after_tax_fv');
    const rrspAfterTaxFutureValue = document.getElementById('rrsp_after_tax_fv');

    // calculate TSFA values
    const tsfaFV = calcFutureValue(depositAmount, returnOnInvestment, inflationRate, yearsOfInvestment);

    tsfaAfterTax.innerHTML = formatCurrency(depositAmount);
    tsfaFutureValue.innerHTML = formatCurrency(tsfaFV);
    tsfaTaxPaid.innerHTML = formatCurrency(0);
    tsfaAfterTaxFutureValue.innerHTML = formatCurrency(tsfaFV);

    // calculate RRSP values
    const rrspDeposit = depositAmount / (1 - currentTaxRate);
    const rrspFV = calcFutureValue(rrspDeposit, returnOnInvestment, inflationRate, yearsOfInvestment);
    const rrspTaxPaidAmount = rrspFV * retirementTaxRate;

    rrspAfterTax.innerHTML = formatCurrency(rrspDeposit);
    rrspFutureValue.innerHTML = formatCurrency(rrspFV);
    rrspTaxPaid.innerHTML = formatCurrency(rrspTaxPaidAmount);
    rrspAfterTaxFutureValue.innerHTML = formatCurrency(rrspFV - rrspTaxPaidAmount);
  }
}

inputs.forEach(input => input.addEventListener('input', debounced(500, updateCalculations)));
