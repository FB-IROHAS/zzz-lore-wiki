<script setup lang="ts">
import LatestPopularArticles from './LatestPopularArticles.vue';
import SidebarWidget from './SidebarWidget.vue';

interface CategoryItem {
  label: string;
  desc: string;
  content: string;
  link: string;
  tone: 'timeline' | 'character' | 'org' | 'term' | 'theory' | 'source' | 'edit';
}

const categories: CategoryItem[] = [
  { label: '年代表', desc: '事件の流れ', content: '古代・旧都崩壊・新エルド現代', link: '/timeline/', tone: 'timeline' },
  { label: 'キャラクター', desc: '人物背景', content: '所属、作中事実、関係性', link: '/characters/', tone: 'character' },
  { label: '組織・勢力', desc: '陣営資料', content: '治安局、企業、各派閥', link: '/organizations/', tone: 'org' },
  { label: '用語集', desc: '世界観辞典', content: 'ホロウ、エーテル、プロキシ', link: '/terminology/', tone: 'term' },
  { label: '考察', desc: '仮説と検証', content: 'Sunbringer、業核、Prophecy', link: '/theories/', tone: 'theory' },
  { label: '資料・出典', desc: '根拠索引', content: '作中文書、公式PV、設定資料', link: '/sources/', tone: 'source' },
  { label: 'GitHubで編集', desc: '管理者向け', content: 'Markdown記事の更新導線', link: '/editor/', tone: 'edit' },
];
</script>

<template>
  <div class="wiki-portal-container">
    <header class="portal-header-block">
      <p class="portal-kicker">Zenless Zone Zero Lore / Theory Archive</p>
      <h1 class="portal-title">ZZZ Lore & Archive</h1>
      <p class="portal-desc">
        作中で確認できる設定資料と、そこから派生する考察を分けて読むための非公式Wikiです。
        年表、人物、用語、出典から、いま調べたい情報へ短い手数で移動できます。
      </p>
    </header>

    <div class="portal-grid">
      <main class="main-column">
        <section class="route-strip" aria-label="主要導線">
          <a href="/timeline/" class="route-tile route-primary">
            <span class="route-label">年代表</span>
            <strong>歴史の流れを確認</strong>
            <small>旧都崩壊から現代までを時代別に追う</small>
          </a>
          <a href="/theories/" class="route-tile">
            <span class="route-label">考察</span>
            <strong>注目仮説を読む</strong>
            <small>根拠、反証、未解決点を分けて整理</small>
          </a>
          <a href="/terminology/" class="route-tile">
            <span class="route-label">用語</span>
            <strong>設定語を引く</strong>
            <small>ホロウ、エーテル、都市構造の基本語彙</small>
          </a>
        </section>

        <LatestPopularArticles />

        <section class="portal-section">
          <div class="section-heading">
            <h2>主要カテゴリ</h2>
            <p>記事が増えても迷子になりにくい、固定の入口です。</p>
          </div>
          <div class="category-table-wrapper">
            <table class="category-table">
              <thead>
                <tr>
                  <th>カテゴリ</th>
                  <th>用途</th>
                  <th>主な内容</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cat in categories" :key="cat.label">
                  <td>
                    <span :class="['cat-marker', cat.tone]"></span>
                    <strong>{{ cat.label }}</strong>
                  </td>
                  <td>{{ cat.desc }}</td>
                  <td>{{ cat.content }}</td>
                  <td><a :href="cat.link" class="table-link">開く</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="portal-section">
          <div class="section-heading">
            <h2>情報の読み分け</h2>
            <p>本文中のラベルで、公式情報と考察の距離を判断できます。</p>
          </div>
          <div class="legend-grid">
            <div class="legend-item fact"><strong>作中事実</strong><span>ゲーム内・公式資料から確認できる情報</span></div>
            <div class="legend-item theory"><strong>考察</strong><span>描写や状況証拠から組み立てた仮説</span></div>
            <div class="legend-item warning"><strong>反証</strong><span>矛盾、競合説、注意して読むべき点</span></div>
            <div class="legend-item unresolved"><strong>未解決</strong><span>今後の更新で検証が必要な論点</span></div>
          </div>
        </section>
      </main>

      <aside class="sidebar-column" aria-label="補助ナビゲーション">
        <SidebarWidget />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.wiki-portal-container {
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 0.25rem 0 2rem;
  font-family: var(--vp-font-family-base);
  color: var(--vp-c-text-1);
}

.portal-header-block {
  margin-bottom: 1.1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 1rem;
}

.portal-kicker {
  margin: 0 0 0.25rem;
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.portal-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.55rem;
  letter-spacing: 0;
}

.portal-desc {
  max-width: 780px;
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}

.portal-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 286px;
  gap: 1.5rem;
  align-items: start;
}

.main-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.sidebar-column {
  width: 286px;
  flex-shrink: 0;
  position: sticky;
  top: 66px;
}

.route-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.route-tile {
  min-height: 118px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.45rem;
  padding: 0.9rem 1rem;
  text-decoration: none;
}

.route-tile:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.route-primary {
  border-color: rgba(255, 209, 45, 0.45);
  box-shadow: inset 3px 0 0 var(--vp-c-brand-1);
}

.route-label {
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  font-weight: 800;
}

.route-tile strong {
  display: block;
  font-size: 1.05rem;
}

.route-tile small {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  line-height: 1.45;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
}

.section-heading h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.section-heading p {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 0.84rem;
}

.category-table-wrapper {
  overflow-x: auto;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  text-align: left;
}

.category-table th {
  background: var(--vp-c-bg-soft);
  padding: 0.58rem 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.category-table td {
  padding: 0.62rem 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
  vertical-align: middle;
}

.category-table tr:last-child td {
  border-bottom: none;
}

.cat-marker {
  display: inline-block;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  margin-right: 0.5rem;
  background: var(--vp-c-brand-1);
}

.cat-marker.character,
.cat-marker.org,
.cat-marker.source {
  background: #5aa7ff;
}

.cat-marker.term {
  background: #51d6b0;
}

.cat-marker.theory {
  background: #a990ff;
}

.cat-marker.edit,
.cat-marker.warning {
  background: #ffb15a;
}

.table-link {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  text-decoration: none;
}

.table-link:hover {
  text-decoration: underline;
}

/* 凡例グリッド */
.legend-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6rem;
}

.legend-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 0.75rem;
  background: var(--vp-c-bg-elv);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 92px;
}

.legend-item strong {
  font-size: 0.9rem;
}

.legend-item span {
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  line-height: 1.45;
}

.legend-item.fact {
  border-top-color: #5aa7ff;
}

.legend-item.theory {
  border-top-color: #a990ff;
}

.legend-item.warning {
  border-top-color: #ffb15a;
}

.legend-item.unresolved {
  border-top-color: #c8b95d;
}

@media (max-width: 960px) {
  .portal-grid {
    grid-template-columns: 1fr;
  }
  .sidebar-column {
    width: 100%;
    position: static;
  }
  .route-strip,
  .legend-grid {
    grid-template-columns: 1fr;
  }
}
</style>
