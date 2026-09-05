/**
 * Calculates monthly and yearly salary breakdown components.
 * 
 * NOTE: This is an application-level demonstration calculation for HR simulation purposes,
 * not real payroll, legal, or tax advice.
 * 
 * @param {number|string} monthlyWage
 * @returns {object} Full salary component breakdown
 */
function computeSalary(monthlyWage) {
  const wage = Number(monthlyWage) || 0;

  const basic = Number((wage * 0.5).toFixed(2));
  const hra = Number((basic * 0.5).toFixed(2));
  const standardAllowance = Number((wage * 0.1667).toFixed(2));
  const perfBonus = Number((wage * 0.0833).toFixed(2));
  const lta = Number((wage * 0.0833).toFixed(2));
  const fixed = Number((wage - (basic + hra + standardAllowance + perfBonus + lta)).toFixed(2));
  const pfEmployee = Number((basic * 0.12).toFixed(2));
  const pfEmployer = Number((basic * 0.12).toFixed(2));
  const professionalTax = 200; // flat
  const netTakeHome = Number((wage - pfEmployee - professionalTax).toFixed(2));
  const yearlyWage = Number((wage * 12).toFixed(2));

  return {
    monthlyWage: wage,
    basic,
    hra,
    standardAllowance,
    perfBonus,
    lta,
    fixed,
    pfEmployee,
    pfEmployer,
    professionalTax,
    netTakeHome,
    yearlyWage
  };
}

module.exports = {
  computeSalary,
  calculateSalaryBreakdown: computeSalary
};
