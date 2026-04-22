export const TAX_BRACKETS_2026_27 = [
  { min: 0, max: 237100, rate: 0.18, base: 0 },
  { min: 237100, max: 370500, rate: 0.26, base: 42678 },
  { min: 370500, max: 512800, rate: 0.31, base: 77362 },
  { min: 512800, max: 673000, rate: 0.36, base: 121475 },
  { min: 673000, max: 857900, rate: 0.39, base: 179147 },
  { min: 857900, max: 1817000, rate: 0.41, base: 251258 },
  { min: 1817000, max: Infinity, rate: 0.45, base: 644489 }
];

export const PRIMARY_REBATE = 17820;
export const UIF_RATE = 0.01;
export const UIF_MAX = 177.12;

export function calculateTakeHome(grossMonthly: number, raMonthly: number = 0) {
  const annualGross = grossMonthly * 12;
  // Note: Retirement Annuity (RA) contributions are tax deductible up to 27.5% of remuneration or taxable income (capped at R350k).
  const maxRADeduction = Math.min(annualGross * 0.275, 350000);
  const annualRA = Math.min(raMonthly * 12, maxRADeduction);
  const taxableIncome = Math.max(0, annualGross - annualRA);
  
  let annualTax = 0;
  for (const bracket of TAX_BRACKETS_2026_27) {
    if (taxableIncome > bracket.min) {
      const taxableAmount = Math.min(taxableIncome, bracket.max) - bracket.min;
      // We overwrite annualTax here by re-computing based on the current bracket we reached
      // This is simpler logic, assuming brackets are sorted.
      annualTax = bracket.base + (taxableAmount * bracket.rate);
    }
  }
  
  annualTax = Math.max(0, annualTax - PRIMARY_REBATE);
  const monthlyTax = annualTax / 12;
  const uif = Math.min(grossMonthly * UIF_RATE, UIF_MAX);
  const takeHome = grossMonthly - monthlyTax - uif - raMonthly;
  
  return {
    grossMonthly,
    monthlyTax,
    uif,
    takeHome,
    raMonthly,
    annualTax,
    taxableIncome
  };
}

export function calculateCarFinance(purchasePrice: number, balloonAmount: number, rateAnnual: number = 0.1025, termMonths: number = 60) {
  const P = purchasePrice;
  const B = balloonAmount;
  const r = rateAnnual / 12;
  const n = termMonths;
  
  // Formula: M = [(P - B) * (r(1+r)^n / ((1+r)^n - 1))] + (B * r)
  const M = ((P - B) * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) + (B * r);
  const totalPaid = (M * n) + B;
  // If no balloon, total paid is just M * n
  const totalInterest = totalPaid - P;
  
  return { 
    monthlyInstallment: M, 
    totalPaid, 
    totalInterest,
    balloonAmount: B,
    purchasePrice: P
  };
}

export function calculateBond(loanAmount: number, extraPayment: number = 0, rateAnnual: number = 0.1025, termYears: number = 20) {
  const r = rateAnnual / 12;
  const n = termYears * 12;
  
  // Base monthly
  const M = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const paidWithExtra = M + extraPayment;
  
  // Calculate new term
  // M_extra = P * r * (1+r)^n_new / ((1+r)^n_new - 1)
  // log(M / (M - P*r)) / log(1+r)
  const baseLineTotalInterest = (M * n) - loanAmount;
  
  let currentBalance = loanAmount;
  let monthsCount = 0;
  let totalInterestWithExtra = 0;
  
  while (currentBalance > 0 && monthsCount < 1000) {
    const interest = currentBalance * r;
    totalInterestWithExtra += interest;
    let principalPaid = paidWithExtra - interest;
    if (principalPaid > currentBalance) {
      principalPaid = currentBalance;
    }
    currentBalance -= principalPaid;
    monthsCount++;
  }
  
  return {
    baseInstallment: M,
    newInstallment: paidWithExtra,
    originalTermMonths: n,
    newTermMonths: monthsCount,
    monthsSaved: Math.max(0, n - monthsCount),
    interestSaved: Math.max(0, baseLineTotalInterest - totalInterestWithExtra)
  };
}
