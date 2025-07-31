export function getEffectiveSkuLimit(subscription) {
  if (
    subscription.adminSkuOverride !== undefined &&
    subscription.adminSkuOverride !== null
  ) {
    return subscription.adminSkuOverride;
  }

  if (!subscription.subscriptionTier) {
    throw new Error('No subscription tier found');
  }

  return subscription.subscriptionTier.skuLimit + (subscription.bonusSkus || 0);
}
