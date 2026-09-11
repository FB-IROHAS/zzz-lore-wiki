<script setup lang="ts">
interface ArticleCard {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  link: string;
  badge?: string;
  status?: 'fact' | 'theory' | 'source';
}

const featuredArticles: ArticleCard[] = [
  {
    id: 'pop-1',
    title: '旧都崩壊時の巨大ホロウ拡張メカニズムとエーテル変異の検証',
    category: '考察・理論',
    summary: '旧都が崩壊した際のエーテル濃度上昇と空間拡張の因果関係について、作中描写をもとに分析。',
    date: '2026-09-10',
    link: '/theories/',
    badge: 'おすすめ',
    status: 'theory'
  },
  {
    id: 'pop-2',
    title: 'プロキシ「ビジョン共有」の謎とボンプナビゲーションの構造',
    category: '世界観設定',
    summary: '主人公らが扱うボンプ視界同期の技術的ルーツと、旧都防壁技術との関係性についての仮説。',
    date: '2026-09-09',
    link: '/theories/',
    badge: '未解決',
    status: 'theory'
  },
  {
    id: 'pop-3',
    title: '新エルド治安局 (Public Security) の組織構造と暗部',
    category: '組織・勢力',
    summary: '都市の治安維持を果たす治安局の内部派閥と、Hollow対策班との権限摩擦に関する公式記録。',
    date: '2026-09-08',
    link: '/organizations/',
    badge: '資料',
    status: 'source'
  }
];

const latestArticles: ArticleCard[] = [
  {
    id: 'lat-1',
    title: '年代表データベース：旧都災害から新エルド現代までの全出来事',
    category: '時系列',
    summary: '約100年前の黎明期から、50年前の旧都崩壊、現在までの主要事件を横スクロールで一覧化。',
    date: '2026-09-10',
    link: '/timeline/',
    badge: 'NEW',
    status: 'fact'
  },
  {
    id: 'lat-2',
    title: 'アキラ：Random Playを拠点とするプロキシ',
    category: 'キャラクター',
    summary: '作中で確認できるプロフィール、立ち位置、関連する設定を整理。',
    date: '2026-09-10',
    link: '/characters/akira',
    badge: 'NEW',
    status: 'fact'
  },
  {
    id: 'lat-3',
    title: '業核とエーテル変異現象の整理',
    category: '考察',
    summary: '用語の背景と考察上の論点を記事として読める形で整理。',
    date: '2026-09-09',
    link: '/theories/',
    badge: 'UPDATED',
    status: 'theory'
  }
];
</script>

<template>
  <div class="portal-articles-wrapper">
    <section class="section-container">
      <div class="section-header">
        <h2 class="section-title">おすすめ記事</h2>
        <a href="/theories/" class="more-link">考察一覧を見る →</a>
      </div>

      <div class="featured-list">
        <a
          v-for="article in featuredArticles"
          :key="article.id" 
          :href="article.link"
          class="article-row"
        >
          <span :class="['status-line', article.status]"></span>
          <span class="article-body">
            <span class="card-meta">
              <span class="category-tag">{{ article.category }}</span>
              <span class="card-badge">{{ article.badge }}</span>
              <span class="article-date">{{ article.date }}</span>
            </span>
            <strong class="article-title">{{ article.title }}</strong>
            <span class="article-summary">{{ article.summary }}</span>
          </span>
        </a>
      </div>
    </section>

    <section class="section-container">
      <div class="section-header">
        <h2 class="section-title">最近更新</h2>
        <a href="/timeline/" class="more-link">年代表を見る →</a>
      </div>

      <div class="latest-grid">
        <a
          v-for="article in latestArticles" 
          :key="article.id" 
          :href="article.link"
          class="latest-item"
        >
          <span class="latest-meta">{{ article.date }} / {{ article.category }}</span>
          <strong>{{ article.title }}</strong>
          <span>{{ article.summary }}</span>
        </a>
      </div>
      <p class="section-note">※ おすすめ記事と最近更新は現在、管理者が手動で指定しています。アクセス数の自動集計ではありません。</p>
    </section>
  </div>
</template>

<style scoped>
.portal-articles-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: var(--vp-font-family-base);
}

.section-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.more-link {
  font-size: 0.88rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  text-decoration: none;
}

.more-link:hover {
  text-decoration: underline;
}

.featured-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  background: var(--vp-c-bg-elv);
}

.article-row {
  color: inherit;
  display: grid;
  grid-template-columns: 4px minmax(0, 1fr);
  text-decoration: none;
  border-bottom: 1px solid var(--vp-c-divider);
}

.article-row:last-child {
  border-bottom: 0;
}

.article-row:hover {
  background: var(--vp-c-bg-soft);
}

.status-line {
  background: var(--vp-c-brand-1);
}

.status-line.fact,
.status-line.source {
  background: #5aa7ff;
}

.status-line.theory {
  background: #a990ff;
}

.article-body {
  display: grid;
  gap: 0.35rem;
  padding: 0.8rem 0.95rem;
  min-width: 0;
}

.card-badge {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.card-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  font-size: 0.76rem;
}

.category-tag {
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.article-date {
  color: var(--vp-c-text-3);
}

.article-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--vp-c-text-1);
}

.article-summary {
  font-size: 0.86rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
}

.latest-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
}

.latest-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-elv);
  color: inherit;
  display: grid;
  gap: 0.35rem;
  padding: 0.75rem;
  text-decoration: none;
}

.latest-item:hover {
  border-color: var(--vp-c-brand-1);
}

.latest-meta {
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}

.latest-item strong {
  font-size: 0.9rem;
  line-height: 1.45;
}

.latest-item span:last-child {
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  line-height: 1.45;
}

.section-note {
  margin: 0.25rem 0 0;
  color: var(--vp-c-text-3);
  font-size: 0.78rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .latest-grid {
    grid-template-columns: 1fr;
  }
}
</style>
