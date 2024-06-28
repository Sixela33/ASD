const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',  
  });

export function toCurrency(numberString) {
  try {
    let number = formatter.format(numberString);
    return number
  } catch {
    return 0
  }
}