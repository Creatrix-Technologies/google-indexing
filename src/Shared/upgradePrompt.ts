import Swal from 'sweetalert2'

/** Shown when an allowance (trial, free plan or paid plan) blocks an action: explains why and offers the plans. */
export async function showUpgradePrompt(reason: string): Promise<void> {
  const result = await Swal.fire({
    title: 'Upgrade to keep going',
    text: reason,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'See plans',
    cancelButtonText: 'Not now',
  })
  if (result.isConfirmed) window.location.assign('/subscriptions')
}
