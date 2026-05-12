import type { AxiosInstance } from 'axios'

export interface PublicPlan {
  id: number
  name: string
  description: string
  amount: number
  currency: string
  duration: string
}

const trialNameAliases = ['trial', 'free'] as const

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
