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
  padding: 20px 30px;
  overflow-y: auto;
}

.profile-header {
  background: white;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
}

.profile-cover {
  height: 150px;
  background: linear-gradient(135deg, #51cbce 0%, #3ba8ab 100%);
}

.profile-info {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding: 20px;
  margin-top: -40px;
  position: relative;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  border: 4px solid #f4f4f4;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-details h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.profile-title {
  margin: 5px 0 0 0;
  color: #999;
  font-size: 14px;
}

.profile-content {
  max-width: 100%;
}

.profile-card {
  background: white;
  padding: 30px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.profile-card h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.profile-card p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 12px;
  color: #999;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.info-item input {
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: #f9f9f9;
}

.btn-primary {
  background: #51cbce;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}
</style>
