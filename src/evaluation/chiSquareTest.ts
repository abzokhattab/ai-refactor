const chi = require("chi-squared");

//calculate Chi-Square statistic
export function chiSquareTest(
  data1: Record<string, number[]>,
  data2: Record<string, number[]>
): number {
  let chiSquare = 0;

  // Sum up total passes and fails for each tool
  const total1 = [0, 0];
  const total2 = [0, 0];

  for (const key in data1) {
    total1[0] += data1[key][0];
    total1[1] += data1[key][1];
    total2[0] += data2[key][0];
    total2[1] += data2[key][1];
  }

  for (const key in data1) {
    const observed1 = data1[key];
    const observed2 = data2[key];

    for (let i = 0; i < 2; i++) {
      const totalObserved = observed1[i] + observed2[i];
      const totalOverall = total1[i] + total2[i];

      if (totalOverall === 0) {
        continue;
      }

      const expected1 = (total1[i] * totalObserved) / totalOverall;
      const expected2 = (total2[i] * totalObserved) / totalOverall;

      if (expected1 > 0) {
        chiSquare += Math.pow(observed1[i] - expected1, 2) / expected1;
      }
      if (expected2 > 0) {
        chiSquare += Math.pow(observed2[i] - expected2, 2) / expected2;
      }
    }
  }

  return chiSquare;
}

// Function to get the p-value from the chi-square statistic
export function getPValue(chiSquare: number, degreesOfFreedom: number): number {
  if (isNaN(chiSquare) || degreesOfFreedom <= 0) {
    return NaN;
  }

  const pValue = 1 - chi.cdf(chiSquare, degreesOfFreedom);
  return pValue;
}
