/** Google's Indexing API default quota per Google Cloud project; no plan can submit more than this per project. */
export const GOOGLE_DAILY_QUOTA = 200;
/** Free tier, mirrored from the API (EntitlementService / FreePlan:MonthlyUrls). */
export const FREE_PLAN = { trialDays: 14, trialUrls: 100, monthlyUrls: 50, sites: 1 };
const slugAliases = {
    trial: ['trial', 'free'],
    solo: ['solo', 'basic'],
    pro: ['pro', 'professional'],
    team: ['team', 'business'],
    enterprise: ['enterprise', 'agency'],
};
/** URL slug for a plan name (used in ?plan= links). */
export function planSlug(name) {
    const lower = name.toLowerCase();
    for (const [slug, aliases] of Object.entries(slugAliases)) {
        if (aliases.some((alias) => lower.includes(alias)))
            return slug;
    }
    return lower.trim().replace(/\s+/g, '-');
}
/** Feature lines generated from what the plan actually enforces, so copy cannot drift from the limits. */
export function planLimitLines(plan) {
    const n = (v) => v.toLocaleString('en-US');
    const perDay = Math.min(plan.maxUrlsPerDay ?? GOOGLE_DAILY_QUOTA, GOOGLE_DAILY_QUOTA);
    const lines = [
        plan.maxSites == null ? 'Unlimited websites' : `${n(plan.maxSites)} website${plan.maxSites === 1 ? '' : 's'}`,
        `Up to ${n(perDay)} URL submissions a day`,
    ];
    if (plan.maxUrlsPerMonth != null)
        lines.push(`${n(plan.maxUrlsPerMonth)} submissions a month`);
    lines.push('Scheduled crawls and automatic submission', 'Index status verified with Google URL Inspection');
    return lines;
}
const trialNameAliases = ['trial', 'free'];
export function isTrialPlan(plan) {
    const name = plan.name.toLowerCase();
    return plan.amount <= 0 || trialNameAliases.some((alias) => name.includes(alias));
}
export function lowestPaidMonthlyAmount(plans) {
    const paid = plans.filter((p) => !isTrialPlan(p) && p.amount > 0);
    if (paid.length === 0)
        return null;
    return Math.min(...paid.map((p) => p.amount));
}
export function formatPublicPlanAmount(amount) {
    const value = Number(amount);
    if (Number.isNaN(value))
        return '0';
    return value.toLocaleString('en-US', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    });
}
export async function fetchPublicSubscriptionPlans(client) {
    const res = await client.get('/payments/public-subscription-plans');
    return res.data?.data || [];
}
