import type { AxiosInstance } from 'axios'

export interface PublicPlan {
  id: number
  name: string
  description: string
  amount: number
  currency: string
  duration: string
}

const fallbackPlans: PublicPlan[] = [
  {
    id: -1,
    name: 'Solo',
    description: '<ul><li>6,000 indexings/month</li><li>3 sites</li><li>API access</li><li>WordPress, Shopify, nopCommerce &amp; more</li></ul>',
    amount: 17,
    currency: 'USD',
    duration: 'month',
  },
  {
    id: -2,
    name: 'Pro',
    description: '<ul><li>6,000 indexings/month</li><li>10 sites</li><li>API + integrations</li><li>Email alerts</li><li>Priority support</li></ul>',
    amount: 47,
    currency: 'USD',
    duration: 'month',
  },
  {
    id: -3,
    name: 'Team',
    description: '<ul><li>6,000 indexings/month</li><li>30 sites</li><li>Up to 8 team seats</li><li>API + all integrations</li><li>Priority support</li><li>Custom onboarding</li></ul>',
    amount: 88,
    currency: 'USD',
    duration: 'month',
  },
]

const trialNameAliases = ['trial', 'free'] as const

export function fallbackPublicSubscriptionPlans(): PublicPlan[] {
  return fallbackPlans.map((plan) => ({ ...plan }))
}

export function isTrialPlan(plan: PublicPlan): boolean {
  const name = plan.name.toLowerCase()
  return plan.amount <= 0 || trialNameAliases.some((alias) => name.includes(alias))
}

export function lowestPaidMonthlyAmount(plans: PublicPlan[]): number | null {
  const paid = plans.filter((p) => !isTrialPlan(p) && p.amount > 0)
  if (paid.length === 0) return null
  return Math.min(...paid.map((p) => p.amount))
}

export function formatPublicPlanAmount(amount: number): string {
  const value = Number(amount)
  if (Number.isNaN(value)) return '0'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

export async function fetchPublicSubscriptionPlans(client: Pick<AxiosInstance, 'get'>): Promise<PublicPlan[]> {
  const res = await client.get<{ data?: PublicPlan[] }>('/payments/public-subscription-plans')
  return res.data?.data || []
}
