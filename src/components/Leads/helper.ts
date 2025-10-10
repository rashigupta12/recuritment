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

const commonCurrencies = [
  { name: 'INR', symbol: '₹' },
  { name: 'USD', symbol: '$' },
  { name: 'EUR', symbol: '€' },
  { name: 'GBP', symbol: '£' },
  { name: 'JPY', symbol: '¥' },
  { name: 'CAD', symbol: 'C$' },
  { name: 'AUD', symbol: 'A$' },
  { name: 'CHF', symbol: 'CHF' },
  { name: 'CNY', symbol: '¥' },
  { name: 'SGD', symbol: 'S$' }
];

export const formatToIndianCurrency = (amount: number, currency: string): string => {
  console.log("Currency in function:", currency);

  // Find the currency symbol from the list
  const currencyData = commonCurrencies.find(
    (c) => c.name.toUpperCase() === currency?.toUpperCase()
  );

  // Default to INR symbol if not found
  const symbol = currencyData ? currencyData.symbol : '₹';

  // Format number according to Indian numbering system
  if (amount >= 1_00_00_000) {
    // Crores
    return `${symbol}${(amount / 1_00_00_000).toFixed(2)} Cr`;
  } else if (amount >= 1_00_000) {
    // Lakhs
    return `${symbol}${(amount / 1_00_000).toFixed(2)} L`;
  } else {
    // Regular format with commas
    return `${symbol}${amount.toFixed(2)}`;
  }
};
