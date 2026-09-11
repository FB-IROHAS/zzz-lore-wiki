<script setup lang="ts">
import LatestPopularArticles from './LatestPopularArticles.vue';
import SidebarWidget from './SidebarWidget.vue';
</script>

<template>
  <div class="wiki-portal-container">
    <header class="portal-header-block">
      <p class="portal-kicker">Zenless Zone Zero Lore / Theory Archive</p>
      <h1 class="portal-title">ZZZ Lore & Archive</h1>
      <p class="portal-desc">
        設定資料、時系列、考察記事を読むための非公式アーカイブです。
        公開側は記事閲覧に絞り、編集用テンプレートや管理導線は表示しません。
      </p>
    </header>

    <div class="portal-grid">
      <main class="main-column">
        <section class="route-strip" aria-label="主要導線">
          <a href="/timeline/" class="route-tile route-primary">
            <span class="route-label">Timeline</span>
            <strong>年代表を読む</strong>
            <small>旧都崩壊から現代までの流れを追う</small>
          </a>
          <a href="/theories/" class="route-tile">
            <span class="route-label">Articles</span>
            <strong>考察記事を読む</strong>
            <small>根拠、反証、未解決点を分けて整理</small>
          </a>
          <a href="/sources/" class="route-tile">
            <span class="route-label">Sources</span>
            <strong>資料・出典を見る</strong>
            <small>公式資料や作中情報の参照先を確認する</small>
          </a>
        </section>

        <LatestPopularArticles />

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
