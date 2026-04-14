/** Plans that get all Unlimited features. Add new names here to inherit everything. */
export const UNLIMITED_PLANS = ['unlimited', 'friends'];

/** Any non-free paid plan. */
export function isPaidPlan(name: string): boolean {
  return name !== '' && name !== 'free';
}

/** Gets full Unlimited feature set. */
export function isUnlimitedPlan(name: string): boolean {
  return UNLIMITED_PLANS.includes(name);
}
