<template>
  <div class="unsub-page">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <router-link to="/login" class="unsub-link">Go to GoogleIndexing.com</router-link>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { refreshApi } from '../api'

const route = useRoute()
const title = ref('Unsubscribing…')
const message = ref('One moment.')

onMounted(async () => {
  const token = String(route.query.token ?? '')
  if (!token) {
    title.value = 'Link not valid'
    message.value = 'This unsubscribe link is incomplete. Open it again from the e-mail.'
    return
  }
  try {
    await refreshApi.post('/register/unsubscribe', { token })
    title.value = "You're unsubscribed"
    message.value = "You won't get setup tips any more. Receipts and account e-mails still arrive as usual."
  } catch {
    title.value = 'Link not valid'
    message.value = "We couldn't read this unsubscribe link. Reply to any of our e-mails and we'll take you off the list."
  }
})
</script>

<style scoped>
.unsub-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  font-family: var(--font-family);
  padding: var(--space-6);
}
.unsub-page h1 {
  font-size: 28px;
  font-weight: var(--fw-semi);
  margin: 0 0 var(--space-3) 0;
  line-height: 1.2;
}
.unsub-page p {
  font-size: var(--fs-md);
  max-width: 460px;
  margin: 0 0 var(--space-5) 0;
}
.unsub-link {
  font-weight: var(--fw-semi);
}
</style>
