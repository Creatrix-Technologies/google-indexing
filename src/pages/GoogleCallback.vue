<template>
  <div>Logging in with Google...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loginWithGoogle } from "../Store/auth"; // <-- import the helper
import { track } from '../analytics';

const router = useRouter();

// Funnel analytics. The plan slug only (Signup stores it before the Google redirect); never name or email.
const funnelProps = () => {
  let plan = 'none';
  try { plan = localStorage.getItem('selectedPlan') || 'none'; } catch { /* storage blocked */ }
  return { plan, method: 'google' as const };
};

const reasonFor = (status?: number) =>
  !status ? 'network' : status === 409 ? 'conflict' : status < 500 ? 'rejected' : 'server';

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (!code) {
    // Google sends ?error=access_denied when the user cancels the consent screen.
    const googleError = urlParams.get('error');
    track('signup_error', { ...funnelProps(), reason: googleError === 'access_denied' ? 'cancelled' : 'no_code' });
    router.push('/login');
    return;
  }

  // isNewRegistration separates a new account (signup_success) from a returning login (no event).
  const { ok, loginSucceeded, isNewRegistration, status } = await loginWithGoogle(code, router);

  if (isNewRegistration) {
    // The account exists once /google-login says so, even if a later step (auth-check, menus) fails.
    track('signup_success', funnelProps());
  } else if (!ok && !loginSucceeded) {
    // /google-login itself failed. A returning user's failed login also lands here: the API can't tell them apart.
    track('signup_error', { ...funnelProps(), reason: reasonFor(status), http_status: status ?? null });
  }
  // Returning Google login that succeeded: no funnel event.
});
</script>
