<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ERA_LIST, loadTimelineEvents, type TimelineEvent } from './timelineData';

// イベントデータ
const timelineEvents = ref<TimelineEvent[]>([]);

// 選択中の時代フィルター
const selectedEra = ref<string>('すべて');

// 事実/考察のみフィルター
const filterFactOnly = ref<boolean>(false);

// アコーディオン展開中のイベントIDセット
const expandedEventIds = ref<Set<string>>(new Set());

// データの読み込み
const refreshData = () => {
  timelineEvents.value = loadTimelineEvents();
};

onMounted(() => {
  refreshData();
});

// フィルタリングされたイベントリスト (歴史の流れ: 古代 ➔ 現代)
const filteredEvents = computed<TimelineEvent[]>(() => {
  return timelineEvents.value.filter(evt => {
    const matchEra = selectedEra.value === 'すべて' || evt.era === selectedEra.value;
    const matchFact = !filterFactOnly.value || evt.isFact;
    return matchEra && matchFact;
  });
});

// アコーディオン開閉切り替え
const toggleExpand = (id: string) => {
  if (expandedEventIds.value.has(id)) {
    expandedEventIds.value.delete(id);
  } else {
    expandedEventIds.value.add(id);
  }
};

// 全て展開 / 全て折りたたみ
const expandAll = () => {
  filteredEvents.value.forEach(e => expandedEventIds.value.add(e.id));
};

const collapseAll = () => {
  expandedEventIds.value.clear();
};
</script>

<template>
  <div class="wiki-timeline-wrapper">
    <div class="timeline-toolbar">
      <div class="timeline-toolbar-head">
        <strong>時代で絞り込み</strong>
        <span>{{ filteredEvents.length }}件表示</span>
      </div>
      <div class="filter-row">
        <div class="era-buttons">
          <button 
            v-for="era in ERA_LIST" 
            :key="era"
            :class="['era-btn', { active: selectedEra === era }]"
            @click="selectedEra = era"
          >
            {{ era }}
          </button>
        </div>
      </div>

      <div class="control-row">
        <label class="checkbox-label">
          <input type="checkbox" v-model="filterFactOnly" />
          <span>作中確定事実のみ</span>
        </label>

        <div class="toggle-all-btns">
          <button class="btn-sm" @click="expandAll">すべて展開</button>
          <button class="btn-sm" @click="collapseAll">すべて折りたたむ</button>
          <button class="btn-sm btn-icon" @click="refreshData" title="再読み込み">再読込</button>
        </div>
      </div>
    </div>

    <div class="timeline-tree-container">
      <div v-if="filteredEvents.length === 0" class="no-events">
        条件に該当する出来事は登録されていません。
      </div>

      <div v-else class="timeline-tree">
        <div class="tree-axis-line"></div>

        <div 
          v-for="event in filteredEvents" 
          :key="event.id"
          :class="['tree-item', { expanded: expandedEventIds.has(event.id) }]"
        >
          <div class="tree-pin">
            <div :class="['dot-node', event.isFact ? 'fact-node' : 'theory-node']"></div>
          </div>

          <article class="compact-event-card">
            <div class="card-summary-row">
              <span class="event-date font-mono">{{ event.date || '時期未確定' }}</span>
              <span :class="event.isFact ? 'badge-fact' : 'badge-theory'">
                {{ event.isFact ? '公式' : '考察' }}
              </span>
              <span class="event-era-label">{{ event.era }}</span>
            </div>

            <h3 class="event-title-text">
              <a v-if="event.link" :href="event.link">{{ event.title }}</a>
              <span v-else>{{ event.title }}</span>
            </h3>
            <p class="event-brief">{{ event.summary }}</p>

            <button class="expand-indicator" type="button" @click="toggleExpand(event.id)">
              {{ expandedEventIds.has(event.id) ? '詳細を閉じる' : '詳細を開く' }}
            </button>

            <div v-if="expandedEventIds.has(event.id)" class="expanded-details">
              <div v-if="event.details" class="detail-section">
                <h4 class="section-sub">詳しい経緯</h4>
                <p class="detail-text">{{ event.details }}</p>
              </div>

              <div class="detail-meta-grid">
                <div v-if="event.characters && event.characters.length > 0" class="meta-block">
                  <span class="meta-key">関連人物</span>
                  <span class="meta-val">
                    <span v-for="c in event.characters" :key="c" class="tag-badge">{{ c }}</span>
                  </span>
                </div>

                <div v-if="event.organizations && event.organizations.length > 0" class="meta-block">
                  <span class="meta-key">関連組織</span>
                  <span class="meta-val">
                    <span v-for="o in event.organizations" :key="o" class="tag-badge">{{ o }}</span>
                  </span>
                </div>

                <div v-if="event.source" class="meta-block">
                  <span class="meta-key">出典</span>
                  <span class="meta-val source-val">{{ event.source }}</span>
                </div>
              </div>

              <div v-if="event.link" class="detail-action">
                <a :href="event.link" class="link-btn">個別記事へ →</a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 専用ワイドコンテナ (1400px〜1500px対応) */
.wiki-timeline-wrapper {
  margin: 1.1rem 0 2rem;
  font-family: var(--vp-font-family-base);
  width: 100%;
  max-width: 1520px;
  box-sizing: border-box;
}

/* ツールバー */
.timeline-toolbar {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 0.7rem 0.8rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.timeline-toolbar-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.era-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.era-btn {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 0.24rem 0.55rem;
  border-radius: 4px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.era-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.era-btn.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 0.6rem;
  font-size: 0.82rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.toggle-all-btns {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.btn-sm {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 0.22rem 0.48rem;
  border-radius: 4px;
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-sm:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

/* ツリータイムライン */
.timeline-tree-container {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.15rem 1rem 1.2rem;
  position: relative;
}

.no-events {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-3);
}

.timeline-tree {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.62rem;
}

/* 時系列ツリー軸線 */
.tree-axis-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 19px;
  width: 2px;
  background: var(--vp-c-divider);
  z-index: 1;
}

.tree-item {
  display: flex;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
}

.tree-pin {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: 0.78rem;
}

.dot-node {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-bg-soft);
}

.fact-node {
  background-color: #2da8ff;
  box-shadow: 0 0 6px rgba(45, 168, 255, 0.6);
}

.theory-node {
  background-color: #ffd12d;
  box-shadow: 0 0 6px rgba(255, 209, 45, 0.6);
}

/* コンパクト軽量カード */
.compact-event-card {
  flex-grow: 1;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 0.68rem 0.8rem;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.compact-event-card:hover {
  border-color: var(--vp-c-brand-1);
}

.tree-item.expanded .compact-event-card {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-elv);
}

/* まとめ行 */
.card-summary-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.event-date {
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
  min-width: 96px;
}

.event-era-label {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  padding: 1px 6px;
  border-radius: 3px;
}

.event-title-text {
  margin: 0.32rem 0 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.45;
}

.event-title-text a {
  color: inherit;
  text-decoration: none;
}

.event-title-text a:hover {
  color: var(--vp-c-brand-1);
}

.expand-indicator {
  margin-top: 0.45rem;
  background: transparent;
  border: 0;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0;
}

/* 1〜2行の短文概要 */
.event-brief {
  margin: 0.25rem 0 0;
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* アコーディオン詳細表示領域 */
.expanded-details {
  margin-top: 0.7rem;
  padding-top: 0.7rem;
  border-top: 1px dashed var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.section-sub {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.detail-text {
  margin: 0;
  font-size: 0.84rem;
  color: var(--vp-c-text-1);
  line-height: 1.7;
}

.detail-image-box {
  max-width: 480px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.detail-image-box img {
  width: 100%;
  height: auto;
  display: block;
}

.detail-meta-grid {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.78rem;
  background: var(--vp-c-bg-soft);
  padding: 0.55rem 0.65rem;
  border-radius: 4px;
}

.meta-block {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta-key {
  color: var(--vp-c-text-3);
  font-weight: 600;
  min-width: 4.2rem;
}

.meta-val {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.tag-badge {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  padding: 1px 5px;
  border-radius: 3px;
  color: var(--vp-c-text-2);
}

.source-val {
  color: var(--vp-c-text-2);
  font-style: italic;
}

.detail-action {
  text-align: right;
  margin-top: 0.3rem;
}

.link-btn {
  font-size: 0.82rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  text-decoration: none;
}

.link-btn:hover {
  text-decoration: underline;
}

/* レスポンシブ調整 */
@media (max-width: 768px) {
  .timeline-toolbar {
    margin-left: -0.25rem;
    margin-right: -0.25rem;
  }

  .control-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.6rem;
  }

  .tree-axis-line {
    left: 10px;
  }
  .tree-pin {
    width: 22px;
  }
  .card-summary-row {
    align-items: flex-start;
    gap: 0.28rem;
  }

  .compact-event-card {
    padding: 0.62rem 0.68rem;
  }

  .event-date {
    min-width: 0;
  }
}
</style>
