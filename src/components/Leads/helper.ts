export const formatToIndianCurrencystats = (amount: number): string => {
  if (amount >= 1_00_00_000) {
    // Crores
    return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`;
  } else if (amount >= 1_00_000) {
    // Lakhs
    return `₹${(amount / 1_00_000).toFixed(2)}L `;
  } else {
    // Just show with commas
    return `₹${amount.toLocaleString("en-IN")}`;
  }
};


export const formatToIndianCurrency = (amount: number): string => {
  if (amount >= 1_00_00_000) {
    // Crores
    return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`;
  } else if (amount >= 1_00_000) {
    // Lakhs
    return `₹${(amount / 1_00_000).toFixed(2)} `;
  } else {
    // Just show with commas
    return `₹${amount.toLocaleString("en-IN")}`;
  }
};