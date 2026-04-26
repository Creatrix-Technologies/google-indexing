<template>
  <div class="user-profile page-container">
    <div class="profile-header">
      <div class="profile-cover"></div>
      <div class="profile-info">
        <div class="profile-avatar">👤</div>
        <div class="profile-details">
          <h2>Chet Faker</h2>
          <p class="profile-title">Artist</p>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <h3>About Me</h3>
        <p>An artist is a person engaged in an activity related to creating art, practicing the arts and/or demonstrating an art. The common usage in both everyday speech and academic discourse, as well as in all of the various visual arts</p>

        <div class="info-grid">
          <div class="info-item">
            <label>First Name</label>
            <input type="text" value="Chet" readonly />
          </div>
          <div class="info-item">
            <label>Last Name</label>
            <input type="text" value="Faker" readonly />
          </div>
          <div class="info-item">
            <label>City</label>
            <input type="text" value="Melbourne" readonly />
          </div>
          <div class="info-item">
            <label>Country</label>
            <input type="text" value="Australia" readonly />
          </div>
          <div class="info-item">
            <label>Postal Code</label>
            <input type="text" value="3000" readonly />
          </div>
          <div class="info-item">
            <label>Email Address</label>
            <input type="email" value="chet@creative-tim.com" readonly />
          </div>
        </div>

        <button class="btn-primary">Update Profile</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page-container {
  padding: 0;
  overflow-y: auto;
  font-family: var(--font-family);
}

.profile-header {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}

.profile-cover {
  height: 96px;
  background: var(--neutral-900);
  background-image: radial-gradient(800px 200px at 30% 100%, rgba(99,102,241,0.20), transparent 60%);
}

.profile-info {
  display: flex;
  align-items: flex-end;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  margin-top: -32px;
  position: relative;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  background: var(--color-card-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.profile-details h2 {
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tight);
  color: var(--color-text);
}

.profile-title {
  margin: 4px 0 0 0;
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
}

.profile-card {
  background: var(--color-card-bg);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
}

.profile-card h3 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tight);
  color: var(--color-text);
}

.profile-card p {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
  margin: var(--space-5) 0;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  font-weight: var(--fw-medium);
  margin-bottom: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.info-item input {
  padding: 8px 11px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-card-bg);
}
.info-item input:read-only {
  background: var(--neutral-50);
  color: var(--color-text-secondary);
}

.btn-primary {
  background: var(--color-accent);
  color: var(--color-accent-fg);
  border: 1px solid transparent;
  padding: 9px 14px;
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
  cursor: pointer;
  font-size: var(--fs-base);
  font-family: inherit;
  transition: background 140ms ease;
}
.btn-primary:hover { background: var(--color-accent-hover); }
</style>
