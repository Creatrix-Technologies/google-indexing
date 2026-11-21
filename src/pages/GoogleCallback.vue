<template>
  <div>Logging in with Google...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loginWithGoogle } from "../Store/auth"; // <-- import the helper
import api from '../api';
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

  // loginWithGoogle() only returns true/false, so read the /google-login outcome here:
  // isNewRegistration separates a new account (signup_success) from a returning login (no event).
  let loginResponded = false;
  let isNewRegistration = false;
  let failedStatus: number | undefined;
  const isGoogleLogin = (url?: string) => !!url && url.replace(/\?.*$/, '').endsWith('/google-login');
  const watcher = api.interceptors.response.use(
    (res) => {
      if (isGoogleLogin(res.config?.url)) {
        loginResponded = true;
        isNewRegistration = res.data?.data?.isNewRegistration === true;
      }
      return res;
    },
    (err) => {
      if (isGoogleLogin(err?.config?.url)) failedStatus = err?.response?.status;
      return Promise.reject(err);
    }
  );

  // Call the new helper
  let ok = false;
  try {
    ok = await loginWithGoogle(code, router);
  } finally {
    api.interceptors.response.eject(watcher);
  }

  if (isNewRegistration) {
    // The account exists once /google-login says so, even if a later step (auth-check, menus) fails.
    track('signup_success', funnelProps());
  } else if (!ok && !loginResponded) {
    // /google-login itself failed. A returning user's failed login also lands here: the API can't tell them apart.
    track('signup_error', { ...funnelProps(), reason: reasonFor(failedStatus), http_status: failedStatus ?? null });
  }
  // Returning Google login that succeeded: no funnel event.
});
</script>
