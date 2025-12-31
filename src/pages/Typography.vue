<template>
  <div class="typography page-container">
    <div class="typography-card">
      <h3>Typography</h3>
      
      <div class="typography-section">
        <h4>Headings</h4>
        <h1>H1 - Heading 1</h1>
        <h2>H2 - Heading 2</h2>
        <h3>H3 - Heading 3</h3>
        <h4>H4 - Heading 4</h4>
        <h5>H5 - Heading 5</h5>
        <h6>H6 - Heading 6</h6>
      </div>

      <div class="typography-section">
        <h4>Paragraph</h4>
        <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, blandit in, nibh. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>
      </div>

      <div class="typography-section">
        <h4>Emphasis</h4>
        <p><strong>This is strong text</strong></p>
        <p><em>This is emphasized text</em></p>
        <p><u>This is underlined text</u></p>
        <p><small>This is small text</small></p>
        <p><del>This is deleted text</del></p>
      </div>

      <div class="typography-section">
        <h4>Blockquote</h4>
        <blockquote>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
        </blockquote>
      </div>

      <div class="typography-section">
        <h4>Lists</h4>
        <div class="lists-container">
          <div>
            <h5>Unordered List</h5>
            <ul>
              <li>Unordered list item 1</li>
              <li>Unordered list item 2</li>
              <li>Unordered list item 3</li>
            </ul>
          </div>
          <div>
            <h5>Ordered List</h5>
            <ol>
              <li>Ordered list item 1</li>
              <li>Ordered list item 2</li>
              <li>Ordered list item 3</li>
            </ol>
          </div>
        </div>
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

.typography-card {
  background: white;
  padding: 30px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.typography-card > h3 {
  margin: 0 0 30px 0;
  font-size: 24px;
  color: #333;
}

.typography-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e8e8e8;
}

.typography-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.typography-section h4 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #666;
  font-weight: 600;
}

.typography-section h1,
.typography-section h2,
.typography-section h3,
.typography-section h4,
.typography-section h5,
.typography-section h6 {
  margin: 15px 0;
  color: #333;
}

.typography-section h1 {
  font-size: 32px;
}

.typography-section h2 {
  font-size: 28px;
}

.typography-section h3 {
  font-size: 24px;
}

.typography-section h4 {
  font-size: 20px;
}

.typography-section h5 {
  font-size: 18px;
}

.typography-section h6 {
  font-size: 16px;
}

.typography-section p {
  margin: 10px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

blockquote {
  margin: 20px 0;
  padding: 20px;
  background: #f9f9f9;
  border-left: 4px solid #51cbce;
  color: #666;
  font-style: italic;
}

blockquote p {
  margin: 0;
}

.lists-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

ul, ol {
  margin: 10px 0;
  padding-left: 20px;
}

li {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .lists-container {
    grid-template-columns: 1fr;
  }
}
</style>
