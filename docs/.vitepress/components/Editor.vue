<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { 
  loadTimelineEvents, 
  saveTimelineEvents, 
  resetTimelineEvents, 
  ERA_LIST, 
  type TimelineEvent 
} from './timelineData';

// 編集モード切替タブ
const activeTab = ref<'markdown' | 'timeline'>('markdown');

/* ====================================================
 * 1. Markdown エディタ用ステート & ロジック
 * ==================================================== */
interface PageTarget {
  id: string;
  name: string;
  defaultContent: string;
}

interface Revision {
  id: string;
  timestamp: string;
  pageId: string;
  content: string;
  charCount: number;
}

const defaultPages: PageTarget[] = [
  {
    id: 'home',
    name: '🏠 ホームページ (docs/index.md)',
    defaultContent: `# ZZZ Lore & Theory Archive へようこそ\n\n本サイトは、『ゼンレスゾーンゼロ（ZZZ）』の設定資料および考察情報を集約するWikiです。\n\n::: info 作中事実・公式情報\n作中で確認されている確定事実です。\n:::\n\n::: tip 考察・仮説\n描写から推測される仮説です。\n:::`
  },
  {
    id: 'timeline',
    name: '⏳ 年代表 (docs/timeline/index.md)',
    defaultContent: `# ⏳ ZZZ 年代表・時系列アーカイブ\n\n時系列データベースページです。\n\n<ClientOnly>\n  <Timeline />\n</ClientOnly>`
  },
  {
    id: 'character_tpl',
    name: '👤 キャラクターテンプレート (docs/templates/character.md)',
    defaultContent: `# 👤 [キャラクター名]\n\n## 概要\n基本情報を記述します。\n\n## 🔷 作中で確認されている情報\n::: info 作中事実\n確定情報を記述します。\n:::`
  },
  {
    id: 'theory_tpl',
    name: '🧠 考察テンプレート (docs/templates/theory.md)',
    defaultContent: `# 🧠 [考察タイトル]\n\n## 概要\n考察要約を記述します。\n\n## 💡 仮説\n::: tip 提唱する仮説\n仮説を記述します。\n:::`
  }
];

const selectedPageId = ref<string>('home');
const editorText = ref<string>('');
const autoSaveStatus = ref<string>('待機中');
const revisions = ref<Revision[]>([]);
let autoSaveTimer: any = null;

const STORAGE_PREFIX = 'zzz_wiki_editor_page_';
const REVISION_STORAGE_KEY = 'zzz_wiki_editor_revisions';

const loadPage = (pageId: string) => {
  const target = defaultPages.find(p => p.id === pageId);
  if (!target) return;

  const savedContent = localStorage.getItem(STORAGE_PREFIX + pageId);
  if (savedContent !== null) {
    editorText.value = savedContent;
    autoSaveStatus.value = 'ローカル保存データを読み込みました';
  } else {
    editorText.value = target.defaultContent;
    autoSaveStatus.value = '初期テンプレートを読み込みました';
  }
};

watch(selectedPageId, (newId) => {
  loadPage(newId);
});

const handleInput = () => {
  autoSaveStatus.value = '編集検出... 保存待ち';
  if (autoSaveTimer) clearTimeout(autoSaveTimer);

  autoSaveTimer = setTimeout(() => {
    saveToLocalStorage(true);
  }, 1500);
};

const saveToLocalStorage = (isAuto: boolean = false) => {
  localStorage.setItem(STORAGE_PREFIX + selectedPageId.value, editorText.value);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ja-JP');

  if (isAuto) {
    autoSaveStatus.value = `自動保存完了 (${timeStr})`;
  } else {
    createRevision(selectedPageId.value, editorText.value);
    autoSaveStatus.value = `手動保存 ＆ 履歴追加完了 (${timeStr})`;
  }
};

const createRevision = (pageId: string, content: string) => {
  const now = new Date();
  const newRev: Revision = {
    id: 'rev_' + Date.now(),
    timestamp: now.toLocaleString('ja-JP'),
    pageId,
    content,
    charCount: content.length
  };

  revisions.value.unshift(newRev);
  if (revisions.value.length > 20) {
    revisions.value = revisions.value.slice(0, 20);
  }
  localStorage.setItem(REVISION_STORAGE_KEY, JSON.stringify(revisions.value));
};

const restoreRevision = (rev: Revision) => {
  if (confirm(`保存日時 「${rev.timestamp}」 の状態に復元しますか？`)) {
    editorText.value = rev.content;
    saveToLocalStorage(false);
    autoSaveStatus.value = `履歴 (${rev.timestamp}) から復元しました`;
  }
};

const deleteRevision = (revId: string) => {
  revisions.value = revisions.value.filter(r => r.id !== revId);
  localStorage.setItem(REVISION_STORAGE_KEY, JSON.stringify(revisions.value));
};

const clearAllRevisions = () => {
  if (confirm('すべての編集履歴をクリアしますか？')) {
    revisions.value = [];
    localStorage.removeItem(REVISION_STORAGE_KEY);
    autoSaveStatus.value = '編集履歴をクリアしました';
  }
};

const downloadMarkdown = () => {
  const blob = new Blob([editorText.value], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${selectedPageId.value}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/* ====================================================
 * 2. 年代表イベント (Timeline Editor) 用ステート & ロジック
 * ==================================================== */
const timelineEventsList = ref<TimelineEvent[]>([]);
const editingEvent = ref<TimelineEvent | null>(null);
const timelineStatus = ref<string>('');

// フォーム入力保持用
const formEra = ref<string>(ERA_LIST[1]);
const formDate = ref<string>('');
const formTitle = ref<string>('');
const formSummary = ref<string>('');
const formImage = ref<string>('');
const formCharacters = ref<string>('');
const formOrganizations = ref<string>('');
const formLink = ref<string>('');
const formSource = ref<string>('');
const formIsFact = ref<boolean>(true);

// 年代表データの読み込み
const fetchTimelineData = () => {
  timelineEventsList.value = loadTimelineEvents();
};

// フォームのクリア
const resetForm = () => {
  editingEvent.value = null;
  formEra.value = ERA_LIST[1];
  formDate.value = '';
  formTitle.value = '';
  formSummary.value = '';
  formImage.value = '';
  formCharacters.value = '';
  formOrganizations.value = '';
  formLink.value = '';
  formSource.value = '';
  formIsFact.value = true;
};

// イベント編集開始
const startEditEvent = (evt: TimelineEvent) => {
  editingEvent.value = evt;
  formEra.value = evt.era;
  formDate.value = evt.date || '';
  formTitle.value = evt.title;
  formSummary.value = evt.summary;
  formImage.value = evt.image || '';
  formCharacters.value = evt.characters ? evt.characters.join(', ') : '';
  formOrganizations.value = evt.organizations ? evt.organizations.join(', ') : '';
  formLink.value = evt.link || '';
  formSource.value = evt.source || '';
  formIsFact.value = evt.isFact;
};

// イベントの追加・更新保存
const handleSaveEvent = () => {
  if (!formTitle.value.trim()) {
    alert('イベントタイトルを入力してください');
    return;
  }

  const charArray = formCharacters.value ? formCharacters.value.split(',').map(s => s.trim()).filter(Boolean) : [];
  const orgArray = formOrganizations.value ? formOrganizations.value.split(',').map(s => s.trim()).filter(Boolean) : [];

  if (editingEvent.value) {
    // 既存イベントの上書き
    const index = timelineEventsList.value.findIndex(e => e.id === editingEvent.value!.id);
    if (index !== -1) {
      timelineEventsList.value[index] = {
        ...editingEvent.value,
        era: formEra.value,
        date: formDate.value,
        title: formTitle.value,
        summary: formSummary.value,
        image: formImage.value || undefined,
        characters: charArray,
        organizations: orgArray,
        link: formLink.value || undefined,
        source: formSource.value || undefined,
        isFact: formIsFact.value
      };
    }
  } else {
    // 新規イベント追加
    const newEvt: TimelineEvent = {
      id: 'evt_' + Date.now(),
      era: formEra.value,
      date: formDate.value,
      title: formTitle.value,
      summary: formSummary.value,
      image: formImage.value || undefined,
      characters: charArray,
      organizations: orgArray,
      link: formLink.value || undefined,
      source: formSource.value || undefined,
      isFact: formIsFact.value
    };
    timelineEventsList.value.push(newEvt);
  }

  saveTimelineEvents(timelineEventsList.value);
  timelineStatus.value = `「${formTitle.value}」を年代表に保存・反映しました`;
  resetForm();
};

// イベント削除
const handleDeleteEvent = (id: string) => {
  if (confirm('この年代表イベントを削除しますか？')) {
    timelineEventsList.value = timelineEventsList.value.filter(e => e.id !== id);
    saveTimelineEvents(timelineEventsList.value);
    timelineStatus.value = 'イベントを削除しました';
  }
};

// 初期サンプルデータへリセット
const handleResetTimeline = () => {
  if (confirm('年代表データを初期サンプル状態にリセットしますか？自作データはクリアされます。')) {
    timelineEventsList.value = resetTimelineEvents();
    timelineStatus.value = '年代表を初期データにリセットしました';
    resetForm();
  }
};

// 初期化
onMounted(() => {
  const savedRevisions = localStorage.getItem(REVISION_STORAGE_KEY);
  if (savedRevisions) {
    try {
      revisions.value = JSON.parse(savedRevisions);
    } catch (e) {}
  }
  loadPage(selectedPageId.value);
  fetchTimelineData();
});
</script>

<template>
  <div class="editor-container">
    <!-- モード切替タブバー -->
    <div class="editor-mode-tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'markdown' }]"
        @click="activeTab = 'markdown'"
      >
        📄 Markdown ドキュメント編集
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'timeline' }]"
        @click="activeTab = 'timeline'"
      >
        ⏳ 年代表イベント編集
      </button>
    </div>

    <!-- ==================================================== -->
    <!-- タブ 1: Markdown ドキュメントエディタ -->
    <!-- ==================================================== -->
    <div v-if="activeTab === 'markdown'" class="tab-content">
      <!-- ヘッダー＆ページ選択ツールバー -->
      <div class="editor-toolbar">
        <div class="toolbar-section">
          <label class="toolbar-label">編集対象ページ:</label>
          <select v-model="selectedPageId" class="page-select">
            <option v-for="page in defaultPages" :key="page.id" :value="page.id">
              {{ page.name }}
            </option>
          </select>
        </div>

        <div class="toolbar-actions">
          <button class="btn btn-save" @click="saveToLocalStorage(false)">
            💾 手動保存・上書き
          </button>
          <button class="btn btn-download" @click="downloadMarkdown">
            📥 .md ファイル保存
          </button>
        </div>
      </div>

      <!-- オートセーブステータスバー -->
      <div class="status-bar">
        <span class="status-indicator">⚡ オートセーブ状態: </span>
        <span class="status-text">{{ autoSaveStatus }}</span>
        <span class="char-counter">文字数: {{ editorText.length }} 字</span>
      </div>

      <!-- 2列ワークスペース -->
      <div class="editor-workspace">
        <div class="workspace-pane pane-edit">
          <div class="pane-header">Markdown テキスト入力領域</div>
          <textarea
            v-model="editorText"
            @input="handleInput"
            class="editor-textarea"
            placeholder="ここにMarkdown形式で記事内容を記述してください..."
          ></textarea>
        </div>

        <div class="workspace-pane pane-preview">
          <div class="pane-header">プレビュー表示（簡易）</div>
          <div class="preview-content vp-doc">
            <pre class="preview-raw-view">{{ editorText }}</pre>
          </div>
        </div>
      </div>

      <!-- 編集履歴 (Revision History) -->
      <div class="history-section">
        <div class="history-header">
          <h3>📜 編集履歴・バージョン管理</h3>
          <button v-if="revisions.length > 0" class="btn-clear" @click="clearAllRevisions">
            履歴を一括削除
          </button>
        </div>

        <div v-if="revisions.length === 0" class="no-history">
          まだ保存履歴がありません。「手動保存・上書き」を実行すると履歴バージョンが記録されます。
        </div>

        <div v-else class="history-list">
          <div 
            v-for="rev in revisions" 
            :key="rev.id" 
            :class="['history-item', { active: rev.pageId === selectedPageId }]"
          >
            <div class="history-info">
              <span class="history-time">⏰ {{ rev.timestamp }}</span>
              <span class="history-page">対象: {{ rev.pageId }}</span>
              <span class="history-size">({{ rev.charCount }} 文字)</span>
            </div>

            <div class="history-actions">
              <button class="btn-restore" @click="restoreRevision(rev)">
                ↩️ この状態に復元
              </button>
              <button class="btn-delete" @click="deleteRevision(rev.id)">
                🗑️ 削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================================================== -->
    <!-- タブ 2: 年代表イベントエディタ -->
    <!-- ==================================================== -->
    <div v-else-if="activeTab === 'timeline'" class="tab-content">
      <div class="timeline-editor-wrapper">
        <div class="timeline-editor-header">
          <h2>⏳ 年代表イベント管理・編集</h2>
          <button class="btn-reset-timeline" @click="handleResetTimeline">
            🔄 初期データにリセット
          </button>
        </div>

        <div v-if="timelineStatus" class="timeline-status-msg">
          ✅ {{ timelineStatus }}
        </div>

        <div class="timeline-editor-grid">
          <!-- 左側: イベント入力フォーム -->
          <div class="form-pane">
            <h3 class="form-title">
              {{ editingEvent ? '✏️ イベントの修正' : '➕ 新規イベントの追加' }}
            </h3>

            <div class="form-group">
              <label>時代区分 (era):</label>
              <select v-model="formEra" class="input-field">
                <option v-for="era in ERA_LIST" :key="era" :value="era">{{ era }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>時期・年号 (date):</label>
              <input v-model="formDate" type="text" class="input-field" placeholder="例: 約100年前, Ver.1.1章など" />
            </div>

            <div class="form-group">
              <label>イベント名 (title) *必須:</label>
              <input v-model="formTitle" type="text" class="input-field" placeholder="例: [作中事実] 旧都崩壊災害" />
            </div>

            <div class="form-group">
              <label>画像URL (image) (オプション):</label>
              <input v-model="formImage" type="text" class="input-field" placeholder="例: https://example.com/image.png" />
            </div>

            <div class="form-group">
              <label>概要 (summary):</label>
              <textarea v-model="formSummary" class="input-field textarea-field" rows="4" placeholder="事件の詳しい概要を記述..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>関連人物 (カンマ区切り):</label>
                <input v-model="formCharacters" type="text" class="input-field" placeholder="例: アキラ, リン" />
              </div>
              <div class="form-group flex-1">
                <label>関連組織 (カンマ区切り):</label>
                <input v-model="formOrganizations" type="text" class="input-field" placeholder="例: 治安局, 邪兎屋" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>詳細記事リンク (link):</label>
                <input v-model="formLink" type="text" class="input-field" placeholder="例: /theories/ など" />
              </div>
              <div class="form-group flex-1">
                <label>出典 (source):</label>
                <input v-model="formSource" type="text" class="input-field" placeholder="例: メインストーリー序章" />
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formIsFact" />
                <span>作中の確定事実である (チェック解除で「考察・推定」扱いに)</span>
              </label>
            </div>

            <div class="form-actions">
              <button class="btn btn-save" @click="handleSaveEvent">
                {{ editingEvent ? '💾 変更を保存して反映' : '➕ 年代表に追加' }}
              </button>
              <button v-if="editingEvent" class="btn btn-download" @click="resetForm">
                キャンセル
              </button>
            </div>
          </div>

          <!-- 右側: 登録済みイベント一覧 -->
          <div class="list-pane">
            <h3 class="form-title">📋 登録済みイベント一覧 (全 {{ timelineEventsList.length }} 件)</h3>

            <div class="events-manage-list">
              <div 
                v-for="evt in timelineEventsList" 
                :key="evt.id" 
                :class="['manage-item', { editing: editingEvent?.id === evt.id }]"
              >
                <div class="item-header">
                  <span class="timeline-date">{{ evt.date }}</span>
                  <span :class="evt.isFact ? 'badge-fact' : 'badge-theory'">
                    {{ evt.isFact ? '確定事実' : '考察' }}
                  </span>
                </div>

                <h4 class="item-title">{{ evt.title }}</h4>
                <p class="item-summary">{{ evt.summary }}</p>
                <div v-if="evt.image" class="item-img-preview">📷 画像あり: {{ evt.image }}</div>

                <div class="item-actions">
                  <button class="btn-edit-item" @click="startEditEvent(evt)">✏️ 編集</button>
                  <button class="btn-delete-item" @click="handleDeleteEvent(evt.id)">🗑️ 削除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  margin: 1.5rem 0;
  font-family: var(--vp-font-family-base);
}

/* モード切替タブ */
.editor-mode-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-btn {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.tab-btn.active {
  background: var(--vp-c-brand-1);
  color: #121418;
  border-color: var(--vp-c-brand-1);
}

/* ツールバー & ステータス */
.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px 8px 0 0;
  padding: 1rem;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.toolbar-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.page-select {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  padding: 0.45rem 0.8rem;
  border-radius: 6px;
  font-size: 0.88rem;
}

.toolbar-actions {
  display: flex;
  gap: 0.6rem;
}

.btn {
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-save {
  background: var(--vp-c-brand-1);
  color: #121418;
}

.btn-download {
  background: var(--vp-c-bg-elv);
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.status-bar {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-top: none;
  padding: 0.5rem 1rem;
  font-size: 0.82rem;
  display: flex;
  justify-content: space-between;
  color: var(--vp-c-text-2);
}

.status-text {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* 2列ワークスペース */
.editor-workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.workspace-pane {
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  height: 480px;
}

.pane-header {
  background: var(--vp-c-bg-elv);
  padding: 0.5rem 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.editor-textarea {
  flex-grow: 1;
  width: 100%;
  background: transparent;
  border: none;
  padding: 1rem;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.preview-content {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
}

.preview-raw-view {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

/* 編集履歴 */
.history-section {
  margin-top: 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.2rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-clear {
  background: transparent;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.78rem;
  cursor: pointer;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  padding: 0.6rem 1rem;
  border-radius: 6px;
}

.btn-restore {
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-delete {
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.78rem;
  cursor: pointer;
}

/* 年代表エディタ専用スタイル */
.timeline-editor-wrapper {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
}

.timeline-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.timeline-editor-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.btn-reset-timeline {
  background: transparent;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  cursor: pointer;
}

.timeline-status-msg {
  background: rgba(255, 209, 45, 0.15);
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.88rem;
  margin-bottom: 1.2rem;
}

.timeline-editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-pane, .list-pane {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.2rem;
}

.form-title {
  margin: 0 0 1.2rem 0;
  font-size: 1.05rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.input-field {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  font-size: 0.88rem;
  outline: none;
}

.textarea-field {
  resize: vertical;
}

.form-row {
  display: flex;
  gap: 0.8rem;
}

.flex-1 {
  flex: 1;
}

.checkbox-group {
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.2rem;
}

.events-manage-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-height: 520px;
  overflow-y: auto;
}

.manage-item {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 0.8rem 1rem;
  transition: border-color 0.2s ease;
}

.manage-item.editing {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
}

.item-title {
  margin: 0.2rem 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.item-summary {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin: 0.2rem 0 0.5rem 0;
}

.item-img-preview {
  font-size: 0.75rem;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.4rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-edit-item, .btn-delete-item {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-edit-item {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.btn-delete-item {
  background: transparent;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}

@media (max-width: 860px) {
  .editor-workspace, .timeline-editor-grid {
    grid-template-columns: 1fr;
  }
}
</style>
