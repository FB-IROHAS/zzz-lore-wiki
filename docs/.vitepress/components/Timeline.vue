<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ERA_LIST, loadTimelineEvents, type TimelineEvent } from './timelineData';

// イベントデータ
const timelineEvents = ref<TimelineEvent[]>([]);

// 選択中の時代フィルター
const selectedEra = ref<string>('すべて');

// 事実/考察のみフィルター
const filterFactOnly = ref<boolean>(false);

// スクロールコンテナの参照
const scrollContainerRef = ref<HTMLDivElement | null>(null);

// ドラッグスクロール用状態
const isDragging = ref<boolean>(false);
const startX = ref<number>(0);
const scrollLeftStart = ref<number>(0);

// データの読み込み
const refreshData = () => {
  timelineEvents.value = loadTimelineEvents();
};

onMounted(() => {
  refreshData();
});

// フィルタリングされたイベントリスト (左: 100年前 ➔ 右: 現在)
const filteredEvents = computed<TimelineEvent[]>(() => {
  return timelineEvents.value.filter(evt => {
    const matchEra = selectedEra.value === 'すべて' || evt.era === selectedEra.value;
    const matchFact = !filterFactOnly.value || evt.isFact;
    return matchEra && matchFact;
  });
});

// マウスドラッグスクロール処理
const handleMouseDown = (e: MouseEvent) => {
  if (!scrollContainerRef.value) return;
  isDragging.value = true;
  startX.value = e.pageX - scrollContainerRef.value.offsetLeft;
  scrollLeftStart.value = scrollContainerRef.value.scrollLeft;
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !scrollContainerRef.value) return;
  e.preventDefault();
  const x = e.pageX - scrollContainerRef.value.offsetLeft;
  const walk = (x - startX.value) * 1.8;
  scrollContainerRef.value.scrollLeft = scrollLeftStart.value - walk;
};

const handleMouseUpOrLeave = () => {
  isDragging.value = false;
};
</script>

<template>
  <div class="horizontal-timeline-container">
    <!-- フィルターコントロール領域 -->
    <div class="timeline-controls">
      <div class="filter-group">
        <span class="filter-label">時代で絞り込み:</span>
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

      <div class="filter-toggle">
        <label class="checkbox-label">
          <input type="checkbox" v-model="filterFactOnly" />
          <span>確定事実・公式情報のみ表示</span>
        </label>
        <button class="btn-refresh" @click="refreshData" title="データを最新化">
          🔄 再読み込み
        </button>
      </div>
    </div>

    <!-- 軸ガイドヘッダー -->
    <div class="timeline-axis-guide">
      <span class="guide-past">⬅ 100年前 (過去)</span>
      <span class="guide-scroll-hint font-mono">🖱️ マウスドラッグ または 横スクロールで移動できます</span>
      <span class="guide-present">現在 (Ver.1.x) ➡</span>
    </div>

    <!-- 横スクロールタイムライン表示領域 (見切れ防止・ドラッグ対応) -->
    <div 
      ref="scrollContainerRef"
      class="timeline-horizontal-scroll"
      :class="{ 'is-grabbing': isDragging }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUpOrLeave"
      @mouseleave="handleMouseUpOrLeave"
    >
      <div v-if="filteredEvents.length === 0" class="no-events">
        条件に一致する出来事は登録されていません。
      </div>

      <div v-else class="horizontal-track">
        <!-- 横軸ライン -->
        <div class="horizontal-axis-line"></div>

        <div 
          v-for="event in filteredEvents" 
          :key="event.id"
          class="horizontal-item"
        >
          <!-- 軸上のノードピン -->
          <div class="node-pin-container">
            <div class="node-dot" :class="{ 'fact-dot': event.isFact, 'theory-dot': !event.isFact }"></div>
            <div class="node-vertical-connector"></div>
          </div>

          <!-- ワイドイベントカード -->
          <div class="event-card">
            <div v-if="event.image" class="event-image-wrapper">
              <img :src="event.image" :alt="event.title" class="event-image" loading="lazy" />
            </div>

            <div class="card-body">
              <div class="card-header">
                <span class="timeline-date">{{ event.date || '時期未確定' }}</span>
                <span :class="event.isFact ? 'badge-fact' : 'badge-theory'">
                  {{ event.isFact ? '公式事実' : '考察・推定' }}
                </span>
              </div>

              <span class="era-badge">{{ event.era }}</span>

              <h3 class="event-title">
                <a v-if="event.link" :href="event.link" class="title-link">{{ event.title }}</a>
                <span v-else>{{ event.title }}</span>
              </h3>

              <p class="event-summary">{{ event.summary }}</p>

              <!-- メタ情報 -->
              <div class="event-meta">
                <div v-if="event.characters && event.characters.length > 0" class="meta-item">
                  <span class="meta-label">👤 人物:</span>
                  <span class="meta-tags">
                    <span v-for="c in event.characters" :key="c" class="meta-tag">{{ c }}</span>
                  </span>
                </div>

                <div v-if="event.organizations && event.organizations.length > 0" class="meta-item">
                  <span class="meta-label">🏢 組織:</span>
                  <span class="meta-tags">
                    <span v-for="o in event.organizations" :key="o" class="meta-tag">{{ o }}</span>
                  </span>
                </div>

                <div v-if="event.source" class="meta-item source-item">
                  <span class="meta-label">📖 出典:</span>
                  <span class="source-text">{{ event.source }}</span>
                </div>
              </div>

              <!-- 詳細リンクボタン -->
              <div v-if="event.link" class="link-action">
                <a :href="event.link" class="detail-btn">詳細記事へ →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.horizontal-timeline-container {
  margin: 1.5rem 0;
  font-family: var(--vp-font-family-base);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* フィルターコントロール */
.timeline-controls {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.era-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.era-btn {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.era-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.era-btn.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.filter-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.btn-refresh {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-refresh:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* 軸ガイドヘッダー */
.timeline-axis-guide {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px 8px 0 0;
  font-size: 0.9rem;
  font-weight: 700;
  width: 100%;
  box-sizing: border-box;
}

.guide-past {
  color: #2da8ff;
}

.guide-present {
  color: var(--vp-c-brand-1);
}

.guide-scroll-hint {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  font-weight: 400;
}

/* 横スクロールコンテナ (100%幅・見切れ防止) */
.timeline-horizontal-scroll {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 3.5rem 1.5rem 2rem 1.5rem;
  overflow-x: auto;
  position: relative;
  cursor: grab;
  user-select: none;
  scrollbar-width: thin;
  scrollbar-color: var(--vp-c-brand-1) var(--vp-c-bg-elv);
  min-height: 520px;
  width: 100%;
  box-sizing: border-box;
}

.timeline-horizontal-scroll.is-grabbing {
  cursor: grabbing;
}

.timeline-horizontal-scroll::-webkit-scrollbar {
  height: 10px;
}

.timeline-horizontal-scroll::-webkit-scrollbar-track {
  background: var(--vp-c-bg-elv);
}

.timeline-horizontal-scroll::-webkit-scrollbar-thumb {
  background: var(--vp-c-brand-1);
  border-radius: 5px;
}

.no-events {
  padding: 3rem;
  text-align: center;
  color: var(--vp-c-text-3);
}

/* 横トラック */
.horizontal-track {
  display: flex;
  gap: 2rem;
  position: relative;
  min-width: max-content;
  padding-top: 1.5rem;
}

/* 横軸メインライン */
.horizontal-axis-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2da8ff 0%, var(--vp-c-brand-1) 100%);
  box-shadow: 0 0 12px rgba(255, 209, 45, 0.5);
}

/* ワイドイベント項目 */
.horizontal-item {
  display: flex;
  flex-direction: column;
  width: 380px;
  flex-shrink: 0;
  position: relative;
}

/* ノードピン */
.node-pin-container {
  position: absolute;
  top: -1.5rem;
  left: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(-50%);
}

.node-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid var(--vp-c-bg-soft);
  z-index: 2;
}

.fact-dot {
  background-color: #2da8ff;
  box-shadow: 0 0 12px rgba(45, 168, 255, 0.8);
}

.theory-dot {
  background-color: #ffd12d;
  box-shadow: 0 0 12px rgba(255, 209, 45, 0.8);
}

.node-vertical-connector {
  width: 2px;
  height: 24px;
  background-color: var(--vp-c-divider);
}

/* カードボディ */
.event-card {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.event-card:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 8px 20px rgba(255, 209, 45, 0.15);
}

.event-image-wrapper {
  width: 100%;
  height: 170px;
  overflow: hidden;
  background: #000;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-card:hover .event-image {
  transform: scale(1.04);
}

.card-body {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.timeline-date {
  font-family: var(--vp-font-family-mono);
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--vp-c-brand-1);
}

.era-badge {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.5rem;
}

.event-title {
  margin: 0.3rem 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.45;
}

.title-link {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.title-link:hover {
  color: var(--vp-c-brand-1);
}

.event-summary {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.65;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 0.7rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.meta-label {
  color: var(--vp-c-text-3);
}

.meta-tags {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.meta-tag {
  background: var(--vp-c-bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--vp-c-text-2);
}

.source-text {
  color: var(--vp-c-text-3);
  font-style: italic;
}

.link-action {
  margin-top: 0.8rem;
  text-align: right;
}

.detail-btn {
  font-size: 0.82rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
}

.detail-btn:hover {
  text-decoration: underline;
}
</style>
