<template>
  <div>Logging in with Google...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loginWithGoogle } from "../Store/auth"; // <-- import the helper

const router = useRouter();

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (!code) {
    router.push('/login');
    return;
  }

  // Call the new helper
  await loginWithGoogle(code, router);
});
</script>
