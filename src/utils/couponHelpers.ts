/**
 * Extract percentage value from Arabic discount label
 * Examples: "خصم 20%" -> 20, "وفر 15%" -> 15, "20% خصم" -> 20
 * @param label - Arabic discount label
 * @returns Percentage number or null if not found
 */
export function extractPercent(label: string): number | null {
  if (!label) return null;
  
  // Match percentage pattern: digits followed by %
  const percentMatch = label.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    const value = parseFloat(percentMatch[1]);
    return isNaN(value) ? null : value;
  }
  
  return null;
}

/**
 * Get the best (maximum) discount from a coupon including variants
 */
export function getBestDiscount(
  discountLabel: string,
  variants?: Array<{ discountLabel: string }>
): number | null {
  const discounts: number[] = [];
  
  // Check main discount
  const mainDiscount = extractPercent(discountLabel);
  if (mainDiscount !== null) {
    discounts.push(mainDiscount);
  }
  
  // Check variant discounts
  if (variants && variants.length > 0) {
    variants.forEach((variant) => {
      const variantDiscount = extractPercent(variant.discountLabel);
      if (variantDiscount !== null) {
        discounts.push(variantDiscount);
      }
    });
  }
  
  return discounts.length > 0 ? Math.max(...discounts) : null;
}

/**
 * Calculate average discount percentage from an array of discounts
 */
export function calculateAverageDiscount(discounts: (number | null)[]): number | null {
  const validDiscounts = discounts.filter((d): d is number => d !== null);
  if (validDiscounts.length === 0) return null;
  
  const sum = validDiscounts.reduce((acc, val) => acc + val, 0);
  return sum / validDiscounts.length;
}
