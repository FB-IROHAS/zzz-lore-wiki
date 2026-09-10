<script setup lang="ts">
import { ref } from 'vue';

interface ArticleCard {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  image: string;
  link: string;
  badge?: string;
  views?: string;
  isPopular?: boolean;
}

// 注目・人気記事サンプルデータ
const popularArticles = ref<ArticleCard[]>([
  {
    id: 'pop-1',
    title: '旧都崩壊時の巨大ホロウ拡張メカニズムとエーテル変異の検証',
    category: '考察・理論',
    summary: '旧都が崩壊した際のエーテル濃度上昇と空間拡張の因果関係について、作中描写をもとに分析。',
    date: '2026-09-10',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    link: '/theories/',
    badge: '🔥 殿堂入り考察',
    views: '12.4k'
  },
  {
    id: 'pop-2',
    title: 'プロキシ「ビジョン共有」の謎とボンプナビゲーションの構造',
    category: '世界観設定',
    summary: '主人公らが扱うボンプ視界同期の技術的ルーツと、旧都防壁技術との関係性についての仮説。',
    date: '2026-09-09',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    link: '/terminology/',
    badge: '★ 注目の謎',
    views: '9.8k'
  },
  {
    id: 'pop-3',
    title: '新エルド治安局 (Public Security) の組織構造と暗部',
    category: '組織・勢力',
    summary: '都市の治安維持を果たす治安局の内部派閥と、Hollow対策班との権限摩擦に関する公式記録。',
    date: '2026-09-08',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    link: '/organizations/',
    badge: '📖 設定資料',
    views: '8.2k'
  }
]);

// 最新の更新記事サンプルデータ
const latestArticles = ref<ArticleCard[]>([
  {
    id: 'lat-1',
    title: '年代表データベース：旧都災害から新エルド現代までの全出来事',
    category: '時系列',
    summary: '約100年前の黎明期から、50年前の旧都崩壊、現在までの主要事件を横スクロールで一覧化。',
    date: '2026-09-10',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    link: '/timeline/',
    badge: 'NEW',
  },
  {
    id: 'lat-2',
    title: 'キャラクター「邪兎屋」関係者と作中描写の確定事実まとめ',
    category: 'キャラクター',
    summary: 'アキラ、リン、邪兎屋メンバーの過去・経歴・人間関係について確定している作中事実一覧。',
    date: '2026-09-10',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    link: '/characters/',
    badge: 'NEW',
  },
  {
    id: 'lat-3',
    title: '【テンプレート】記事作成用キャラクター/用語/考察フォーマット',
    category: 'Wiki管理',
    summary: '確定事実と考察・仮説を視覚的に区別して執筆するための標準Markdownテンプレート。',
    date: '2026-09-09',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
    link: '/templates/character',
    badge: 'UPDATED',
  }
]);
</script>

<template>
  <div class="portal-articles-wrapper">
    <!-- 1. 人気・注目記事セクション -->
    <section class="section-container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="icon">🔥</span> 人気・注目アーカイブ
        </h2>
        <a href="/theories/" class="more-link">考察一覧を見る →</a>
      </div>

      <div class="articles-grid popular-grid">
        <div 
          v-for="article in popularArticles" 
          :key="article.id" 
          class="article-card popular-card"
        >
          <a :href="article.link" class="card-link-wrapper">
            <div class="card-image-box">
              <img :src="article.image" :alt="article.title" class="card-image" loading="lazy" />
              <span class="card-badge popular-badge">{{ article.badge }}</span>
              <span v-if="article.views" class="card-views">👁️ {{ article.views }}</span>
            </div>

            <div class="card-content">
              <div class="card-meta font-mono">
                <span class="category-tag">{{ article.category }}</span>
                <span class="article-date">{{ article.date }}</span>
              </div>

              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-summary">{{ article.summary }}</p>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- 2. 最新更新記事セクション -->
    <section class="section-container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="icon">✨</span> 最新の更新アーカイブ
        </h2>
        <a href="/timeline/" class="more-link">年代表を見る →</a>
      </div>

      <div class="articles-grid latest-grid">
        <div 
          v-for="article in latestArticles" 
          :key="article.id" 
          class="article-card latest-card"
        >
          <a :href="article.link" class="card-link-wrapper">
            <div class="card-image-box compact-img">
              <img :src="article.image" :alt="article.title" class="card-image" loading="lazy" />
              <span class="card-badge new-badge">{{ article.badge }}</span>
            </div>

            <div class="card-content">
              <div class="card-meta font-mono">
                <span class="category-tag alt-tag">{{ article.category }}</span>
                <span class="article-date">{{ article.date }}</span>
              </div>

              <h3 class="article-title small-title">{{ article.title }}</h3>
              <p class="article-summary small-summary">{{ article.summary }}</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.portal-articles-wrapper {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  font-family: var(--vp-font-family-base);
}

.section-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--vp-c-divider);
  padding-bottom: 0.6rem;
}

.section-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

/* グリッドレイアウト (画面幅活用) */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
}

/* カードスタイル */
.article-card {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.card-link-wrapper {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-image-box {
  width: 100%;
  height: 190px;
  overflow: hidden;
  position: relative;
  background: #000;
}

.compact-img {
  height: 160px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.article-card:hover .card-image {
  transform: scale(1.05);
}

.card-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.popular-badge {
  background: rgba(255, 209, 45, 0.9);
  color: #121418;
}

.new-badge {
  background: #2da8ff;
  color: #ffffff;
}

.card-views {
  position: absolute;
  bottom: 0.6rem;
  right: 0.6rem;
  background: rgba(0, 0, 0, 0.75);
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: var(--vp-font-family-mono);
}

.card-content {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  margin-bottom: 0.6rem;
}

.category-tag {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.alt-tag {
  background: rgba(45, 168, 255, 0.15);
  color: #2da8ff;
}

.article-date {
  color: var(--vp-c-text-3);
}

.article-title {
  margin: 0.2rem 0 0.6rem 0;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.small-title {
  font-size: 1.05rem;
}

.article-summary {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  flex-grow: 1;
}

.small-summary {
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
