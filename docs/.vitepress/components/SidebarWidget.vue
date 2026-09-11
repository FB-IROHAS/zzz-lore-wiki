<script setup lang="ts">
import { popularArticlesData } from '../data/popularArticles';
import { recommendedArticlesData } from '../data/recommendedArticles';
import { recentArticlesData } from '../data/recentArticles';
</script>

<template>
  <aside class="wiki-sidebar-widget">
    <div class="widget-block">
      <h3 class="widget-title">関連考察</h3>
      <ol class="popular-list">
        <li v-for="item in popularArticlesData" :key="item.id" class="popular-item">
          <span class="rank-num font-mono">{{ item.rank }}</span>
          <a :href="item.link" class="item-link">
            <span class="item-title-text">{{ item.title }}</span>
          </a>
        </li>
      </ol>
    </div>

    <div class="widget-block">
      <h3 class="widget-title">おすすめ記事</h3>
      <ul class="recommend-list">
        <li v-for="rec in recommendedArticlesData" :key="rec.id" class="recommend-item">
          <a :href="rec.link" class="recommend-link">
            <span class="recommend-title">{{ rec.title }}</span>
            <span v-if="rec.description" class="recommend-desc">{{ rec.description }}</span>
          </a>
        </li>
      </ul>
    </div>

    <div class="widget-block">
      <h3 class="widget-title">最近の更新</h3>
      <ul class="recent-list">
        <li v-for="recent in recentArticlesData" :key="recent.id" class="recent-item">
          <a :href="recent.link" class="recent-link">
            <div class="recent-meta font-mono">
              <span class="recent-date">{{ recent.updatedDate }}</span>
              <span class="recent-badge">{{ recent.category }}</span>
            </div>
            <span class="recent-title">{{ recent.title }}</span>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.wiki-sidebar-widget {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  font-family: var(--vp-font-family-base);
  width: 100%;
}

.widget-block {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 0.85rem;
}

.widget-title {
  margin: 0 0 0.6rem 0;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  letter-spacing: 0;
}

.widget-title::before {
  content: "";
  width: 3px;
  height: 1rem;
  background: var(--vp-c-brand-1);
  border-radius: 2px;
}

/* おすすめ記事リスト */
.popular-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.48rem;
}

.popular-item {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  font-size: 0.84rem;
  line-height: 1.4;
}

.rank-num {
  font-weight: 800;
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  width: 18px;
  flex-shrink: 0;
}

.item-link {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.15s ease;
}

.item-link:hover {
  color: var(--vp-c-brand-1);
}

.item-title-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* おすすめ考察リスト */
.recommend-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.58rem;
}

.recommend-item {
  font-size: 0.83rem;
}

.recommend-link {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.recommend-title {
  color: var(--vp-c-text-1);
  font-weight: 600;
  line-height: 1.35;
}

.recommend-link:hover .recommend-title {
  color: var(--vp-c-brand-1);
}

.recommend-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  line-height: 1.3;
}

/* 最近の更新リスト */
.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.52rem;
}

.recent-item {
  font-size: 0.81rem;
}

.recent-link {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.recent-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.75rem;
}

.recent-date {
  color: var(--vp-c-text-3);
}

.recent-badge {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.7rem;
}

.recent-title {
  color: var(--vp-c-text-2);
  line-height: 1.35;
}

.recent-link:hover .recent-title {
  color: var(--vp-c-text-1);
}
</style>
