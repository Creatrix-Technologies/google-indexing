<template>
  <div class="table-list page-container">
    <div class="table-card">
      <h3>Striped Table with Hover</h3>
      <div class="table-wrapper">
        <table class="styled-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Country</th>
              <th>City</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Dakota Rice</td>
              <td>Niger</td>
              <td>Oud-Turnhout</td>
              <td>$36,738</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Minerva Hooper</td>
              <td>Curaçao</td>
              <td>Sinaai-Waas</td>
              <td>$23,789</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Sage Rodriguez</td>
              <td>Sweden</td>
              <td>Västerås</td>
              <td>$56,142</td>
            </tr>
            <tr>
              <td>4</td>
              <td>Doris Greene</td>
              <td>Malawi</td>
              <td>Feldkirch</td>
              <td>$63,542</td>
            </tr>
            <tr>
              <td>5</td>
              <td>Mason Porter</td>
              <td>Chile</td>
              <td>Gloucester</td>
              <td>$78,615</td>
            </tr>
          </tbody>
        </table>
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

.table-card {
  background: white;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.table-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: var(--color-text);
}

.table-wrapper {
  overflow-x: auto;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
}

.styled-table thead tr {
  background: var(--color-slate-50);
  border-bottom: 2px solid var(--color-border);
}

.styled-table th {
  padding: 15px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
}

.styled-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.styled-table tbody tr {
  transition: background-color 0.2s;
}

.styled-table tbody tr:hover {
  background-color: #f9f9f9;
}

.styled-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}
</style>
