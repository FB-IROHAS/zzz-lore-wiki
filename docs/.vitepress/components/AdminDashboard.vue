<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import terms from '../data/terminologyData.json';

type Category = 'character' | 'organization' | 'terminology' | 'theory' | 'timeline' | 'source';
type Status = 'draft' | 'published' | 'archived';

interface ArticleSummary {
  title: string;
  description: string;
  category: Category;
  slug: string;
  sha: string;
  tags: string[];
  updatedAt: string;
  status: Status;
}

interface ArticleDetail {
  slug: string;
  sha: string;
  meta: Partial<ArticleSummary> & { createdAt?: string };
  body: string;
}

interface ImageItem {
  key: string;
  url: string;
  size: number;
  uploadedAt?: string;
}

const categories: { value: Category; label: string }[] = [
  { value: 'character', label: 'キャラクター' },
  { value: 'organization', label: '組織・陣営' },
  { value: 'terminology', label: '用語' },
  { value: 'theory', label: '考察' },
  { value: 'timeline', label: '年表' },
  { value: 'source', label: '参考文献' },
];

const statuses: { value: Status; label: string }[] = [
  { value: 'draft', label: '下書き' },
  { value: 'published', label: '公開' },
  { value: 'archived', label: 'アーカイブ' },
];

const imageCategories = [
  { value: 'characters', label: 'キャラクター' },
  { value: 'terminology', label: '用語' },
  { value: 'theories', label: '考察' },
  { value: 'timeline', label: '年表' },
  { value: 'organizations', label: '組織・陣営' },
  { value: 'sources', label: '参考文献' },
  { value: 'misc', label: 'その他' },
];

const sessionEmail = ref('');
const csrf = ref('');
const articles = ref<ArticleSummary[]>([]);
const images = ref<ImageItem[]>([]);
const selectedCategory = ref<Category | 'all'>('all');
const query = ref('');
const message = ref('');
const error = ref('');
const isLoading = ref(false);
const isSaving = ref(false);
const showImages = ref(false);
const imageCategory = ref('characters');
const fileInput = ref<HTMLInputElement | null>(null);
const sidebarCollapsed = ref(false);
const mobilePane = ref<'markdown' | 'preview'>('markdown');

const form = ref({
  title: '',
  description: '',
  category: 'theory' as Category,
  slug: '',
  tagsText: '',
  status: 'draft' as Status,
  body: '',
  sha: '',
  originalSlug: '',
  originalCategory: 'theory' as Category,
  createdAt: '',
});

const categoryLabel = (value: Category | string) =>
  categories.find(category => category.value === value)?.label ?? String(value);

const statusLabel = (value: Status | string) =>
  statuses.find(status => status.value === value)?.label ?? String(value);

const filteredArticles = computed(() => articles.value.filter(article => {
  const matchesCategory = selectedCategory.value === 'all' || article.category === selectedCategory.value;
  const target = `${article.title} ${article.slug} ${(article.tags ?? []).join(' ')}`.toLowerCase();
  return matchesCategory && target.includes(query.value.toLowerCase());
}));

const renderedPreview = computed(() => renderMarkdown(form.value.body));
const terminologyOptions = computed(() => (terms as { term: string; slug: string }[]).map(term => ({
  label: term.term,
  value: `[${term.term}](/terminology/${term.slug})`,
})));

const api = async <T,>(url: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set('content-type', 'application/json');
  if (csrf.value && init.method && init.method !== 'GET') headers.set('x-csrf-token', csrf.value);
  const response = await fetch(url, { ...init, headers, credentials: 'same-origin' });
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => ({})) : {};
  if (url.startsWith('/api/admin/') && !response.ok && !isJson) throw new Error(adminHttpMessage(response.status));
  if (!response.ok) {
    console.error('Admin API request failed', { url, status: response.status, data });
    throw new Error(data.error || adminHttpMessage(response.status));
  }
  if (url.startsWith('/api/admin/') && !isJson) {
    console.error('Admin API returned a non-JSON response', { url, status: response.status });
    throw new Error('管理APIが見つかりません');
  }
  return data as T;
};

const adminHttpMessage = (status: number) => {
  if (status === 401 || status === 403) return '管理者認証が必要です';
  if (status === 404) return '管理APIが見つかりません。Cloudflare の Deploy command が npm run deploy:cloudflare になっているか、/api/admin/* が Cloudflare Access の保護対象になっているか確認してください。';
  if (status >= 500) return '管理APIでエラーが発生しました';
  return `リクエストに失敗しました（${status}）`;
};

const initialize = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const session = await api<{ email: string; csrf: string }>('/api/admin/session');
    sessionEmail.value = session.email;
    csrf.value = session.csrf;
    await Promise.all([loadArticles(), loadImages()]);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '管理APIへ接続できません';
  } finally {
    isLoading.value = false;
  }
};

const loadArticles = async () => {
  const data = await api<{ articles: ArticleSummary[] }>('/api/admin/articles');
  articles.value = (Array.isArray(data.articles) ? data.articles : [])
    .sort((a, b) => `${b.updatedAt ?? ''}${b.title ?? ''}`.localeCompare(`${a.updatedAt ?? ''}${a.title ?? ''}`));
};

const loadImages = async () => {
  try {
    const data = await api<{ images: ImageItem[] }>('/api/admin/images');
    images.value = Array.isArray(data.images) ? data.images : [];
  } catch {
    images.value = [];
  }
};

const newArticle = () => {
  const today = new Date().toISOString().slice(0, 10);
  form.value = {
    title: '',
    description: '',
    category: 'theory',
    slug: '',
    tagsText: '',
    status: 'draft',
    body: '## 概要\n\n',
    sha: '',
    originalSlug: '',
    originalCategory: 'theory',
    createdAt: today,
  };
  persistDraft();
};

const selectArticle = async (article: ArticleSummary) => {
  isLoading.value = true;
  error.value = '';
  try {
    const data = await api<{ article: ArticleDetail }>(`/api/admin/articles/${article.category}/${article.slug}`);
    form.value = {
      title: String(data.article.meta.title || article.title),
      description: String(data.article.meta.description || ''),
      category: (data.article.meta.category as Category) || article.category,
      slug: data.article.slug,
      tagsText: Array.isArray(data.article.meta.tags) ? data.article.meta.tags.join(', ') : '',
      status: (data.article.meta.status as Status) || 'draft',
      body: data.article.body,
      sha: data.article.sha,
      originalSlug: data.article.slug,
      originalCategory: article.category,
      createdAt: String(data.article.meta.createdAt || ''),
    };
    persistDraft();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '記事を取得できません';
  } finally {
    isLoading.value = false;
  }
};

const saveArticle = async () => {
  error.value = '';
  message.value = '';
  if (form.value.sha && (form.value.slug !== form.value.originalSlug || form.value.category !== form.value.originalCategory)) {
    const ok = window.confirm('slugまたはカテゴリを変更すると旧URLが削除され、新URLで作成されます。続行しますか？');
    if (!ok) return;
  }

  isSaving.value = true;
  try {
    const payload = {
      slug: form.value.slug,
      sha: form.value.sha || undefined,
      previousSlug: form.value.originalSlug || undefined,
      previousCategory: form.value.originalCategory || undefined,
      meta: {
        title: form.value.title,
        description: form.value.description,
        category: form.value.category,
        tags: form.value.tagsText.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: form.value.createdAt || new Date().toISOString().slice(0, 10),
        status: form.value.status,
      },
      body: form.value.body,
    };
    if (form.value.sha) {
      await api(`/api/admin/articles/${form.value.originalCategory}/${form.value.originalSlug}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      await api('/api/admin/articles', { method: 'POST', body: JSON.stringify(payload) });
    }
    message.value = `保存しました: ${form.value.title}`;
    localStorage.removeItem('zzz-admin-draft');
    await loadArticles();
    const refreshed = articles.value.find(item => item.slug === form.value.slug && item.category === form.value.category);
    if (refreshed) await selectArticle(refreshed);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存に失敗しました';
  } finally {
    isSaving.value = false;
  }
};

const deleteArticle = async () => {
  if (!form.value.sha) return;
  const typed = window.prompt(`削除するには記事タイトルを入力してください: ${form.value.title}`);
  if (typed !== form.value.title) {
    error.value = '削除確認のタイトルが一致しません';
    return;
  }
  try {
    await api(`/api/admin/articles/${form.value.originalCategory}/${form.value.originalSlug}`, {
      method: 'DELETE',
      body: JSON.stringify({ title: form.value.title, sha: form.value.sha }),
    });
    message.value = `削除しました: ${form.value.title}`;
    newArticle();
    await loadArticles();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '削除に失敗しました';
  }
};

const uploadImage = async () => {
  const file = fileInput.value?.files?.[0];
  if (!file) return;
  const body = new FormData();
  body.set('category', imageCategory.value);
  body.set('file', file);
  try {
    const uploaded = await api<{ url: string }>('/api/admin/images', { method: 'POST', body });
    insertAtCursor(`![image](${uploaded.url})`);
    await loadImages();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '画像アップロードに失敗しました';
  }
};

const deleteImage = async (image: ImageItem) => {
  if (!window.confirm(`${image.key} を削除しますか？`)) return;
  try {
    await api(`/api/admin/images/${image.key}`, { method: 'DELETE' });
    await loadImages();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '画像削除に失敗しました';
  }
};

const insertAtCursor = (snippet: string) => {
  const textarea = document.querySelector<HTMLTextAreaElement>('.admin-editor-textarea');
  if (!textarea) {
    form.value.body += snippet;
    persistDraft();
    return;
  }
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  form.value.body = `${form.value.body.slice(0, start)}${snippet}${form.value.body.slice(end)}`;
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
  });
  persistDraft();
};

const wrapSelection = (before: string, after = before) => {
  const textarea = document.querySelector<HTMLTextAreaElement>('.admin-editor-textarea');
  if (!textarea) return insertAtCursor(`${before}text${after}`);
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = form.value.body.slice(start, end) || 'text';
  form.value.body = `${form.value.body.slice(0, start)}${before}${selected}${after}${form.value.body.slice(end)}`;
  persistDraft();
};

const insertBlock = (snippet: string) => insertAtCursor(`\n${snippet.trim()}\n`);

const insertTerm = (value: string) => {
  if (value) insertAtCursor(value);
};

const handleTermSelect = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  insertTerm(select.value);
  select.value = '';
};

const persistDraft = () => {
  localStorage.setItem('zzz-admin-draft', JSON.stringify(form.value));
};

const restoreDraft = () => {
  const raw = localStorage.getItem('zzz-admin-draft');
  if (!raw) return;
  try {
    form.value = JSON.parse(raw);
  } catch {
    localStorage.removeItem('zzz-admin-draft');
  }
};

const renderMarkdown = (markdown: string) => {
  const blocks: string[] = [];
  const lines = markdown.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
    } else if (line.startsWith(':::')) {
      const content: string[] = [];
      const containerType = line.replace(':::', '').trim() || 'info';
      i += 1;
      while (i < lines.length && !lines[i].startsWith(':::')) {
        content.push(lines[i]);
        i += 1;
      }
      const blockType = containerClass(containerType);
      blocks.push(`<div class="custom-block ${blockType}"><p class="custom-block-title">${escapeHtml(containerType)}</p>${renderMarkdown(content.join('\n'))}</div>`);
    } else if (/^\|.+\|$/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|.+\|$/.test(lines[i])) {
        if (!/^\|\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|$/.test(lines[i])) {
          rows.push(lines[i].split('|').slice(1, -1).map(cell => cell.trim()));
        }
        i += 1;
      }
      const htmlRows = rows.map(row => `<tr>${row.map(cell => `<td>${renderInline(cell)}</td>`).join('')}</tr>`).join('');
      blocks.push(`<table><tbody>${htmlRows}</tbody></table>`);
      continue;
    } else if (line.startsWith('### ')) {
      blocks.push(`<h3>${renderInline(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      blocks.push(`<h2>${renderInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      blocks.push(`<h1>${renderInline(line.slice(2))}</h1>`);
    } else if (line.startsWith('> ')) {
      blocks.push(`<blockquote>${renderInline(line.slice(2))}</blockquote>`);
    } else if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i += 1;
      }
      blocks.push(`<ul>${items.map(item => `<li>${renderInline(item)}</li>`).join('')}</ul>`);
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i += 1;
      }
      blocks.push(`<ol>${items.map(item => `<li>${renderInline(item)}</li>`).join('')}</ol>`);
      continue;
    } else {
      const paragraph = [line];
      while (i + 1 < lines.length && lines[i + 1].trim() && !isBlockStart(lines[i + 1])) {
        i += 1;
        paragraph.push(lines[i]);
      }
      blocks.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    }
    i += 1;
  }
  return blocks.join('\n');
};

const isBlockStart = (line: string) =>
  line.startsWith('# ') ||
  line.startsWith('## ') ||
  line.startsWith('### ') ||
  line.startsWith('> ') ||
  line.startsWith('```') ||
  line.startsWith(':::') ||
  /^[-*] /.test(line) ||
  /^\d+\. /.test(line) ||
  /^\|.+\|$/.test(line);

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const renderInline = (value: string) => {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
  return html;
};

const containerClass = (value: string) => {
  const normalized = value.split(/\s+/)[0]?.toLowerCase();
  return ['info', 'tip', 'warning', 'danger'].includes(normalized) ? normalized : 'info';
};

onMounted(() => {
  restoreDraft();
  initialize();
});
</script>

<template>
  <div class="admin-shell">
    <header class="admin-page-header">
      <div>
        <p>ZZZ Lore & Archive</p>
        <h1>管理者ダッシュボード</h1>
      </div>
      <div class="admin-header-actions">
        <button type="button" @click="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '記事一覧を表示' : '記事一覧を隠す' }}
        </button>
        <button type="button" @click="initialize">再読み込み</button>
      </div>
    </header>

    <div class="admin-status">
      <span v-if="sessionEmail">ログイン中: {{ sessionEmail }}</span>
      <span v-else>Cloudflare Accessで保護された管理画面です</span>
      <span>{{ isLoading ? '読み込み中' : 'API: /api/admin/*' }}</span>
    </div>

    <p v-if="error" class="admin-alert error">{{ error }}</p>
    <p v-if="message" class="admin-alert success">{{ message }}</p>

    <div class="admin-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-actions">
          <button type="button" class="primary" @click="newArticle">新規記事</button>
          <button type="button" @click="showImages = !showImages">画像管理</button>
        </div>

        <input v-model="query" class="admin-input" type="search" placeholder="記事検索" />
        <select v-model="selectedCategory" class="admin-input">
          <option value="all">すべて</option>
          <option v-for="category in categories" :key="category.value" :value="category.value">{{ category.label }}</option>
        </select>

        <div v-if="showImages" class="image-manager">
          <strong>画像管理</strong>
          <select v-model="imageCategory" class="admin-input">
            <option v-for="category in imageCategories" :key="category.value" :value="category.value">{{ category.label }}</option>
          </select>
          <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />
          <button type="button" @click="uploadImage">アップロードして挿入</button>

          <ul class="image-list">
            <li v-for="image in images" :key="image.key">
              <img :src="image.url" alt="" loading="lazy" />
              <button type="button" @click="insertAtCursor(`![image](${image.url})`)">挿入</button>
              <button type="button" @click="navigator.clipboard?.writeText(image.url)">URLコピー</button>
              <button type="button" class="danger" @click="deleteImage(image)">削除</button>
            </li>
          </ul>
        </div>

        <div class="article-list" aria-label="記事一覧">
          <button
            v-for="article in filteredArticles"
            :key="`${article.category}/${article.slug}`"
            type="button"
            class="article-list-item"
            @click="selectArticle(article)"
          >
            <strong>{{ article.title }}</strong>
            <span>{{ categoryLabel(article.category) }} / {{ article.slug }}</span>
            <small>{{ article.updatedAt || '更新日なし' }} / {{ statusLabel(article.status) }}</small>
          </button>
        </div>
      </aside>

      <main class="admin-editor">
        <div class="meta-grid">
          <label>タイトル<input v-model="form.title" class="admin-input" @input="persistDraft" /></label>
          <label>カテゴリ
            <select v-model="form.category" class="admin-input" @change="persistDraft">
              <option v-for="category in categories" :key="category.value" :value="category.value">{{ category.label }}</option>
            </select>
          </label>
          <label>slug<input v-model="form.slug" class="admin-input" placeholder="sunbringer" @input="persistDraft" /></label>
          <label>状態
            <select v-model="form.status" class="admin-input" @change="persistDraft">
              <option v-for="status in statuses" :key="status.value" :value="status.value">{{ status.label }}</option>
            </select>
          </label>
          <label class="wide">概要<input v-model="form.description" class="admin-input" @input="persistDraft" /></label>
          <label class="wide">タグ<input v-model="form.tagsText" class="admin-input" placeholder="旧文明, 考察" @input="persistDraft" /></label>
        </div>

        <div class="markdown-toolbar">
          <button type="button" @click="insertAtCursor('\n## 見出し\n')">H2</button>
          <button type="button" @click="insertAtCursor('\n### 小見出し\n')">H3</button>
          <button type="button" @click="wrapSelection('**')">太字</button>
          <button type="button" @click="wrapSelection('*')">斜体</button>
          <button type="button" @click="insertAtCursor('[text](/terminology/)')">リンク</button>
          <button type="button" @click="insertAtCursor('\n> 引用\n')">引用</button>
          <button type="button" @click="insertAtCursor('\n- item\n')">リスト</button>
          <button type="button" @click="insertAtCursor('\n1. item\n')">番号</button>
          <button type="button" @click="insertAtCursor('\n| 項目 | 内容 |\n| :--- | :--- |\n|  |  |\n')">表</button>
          <button type="button" @click="insertAtCursor('\n```\ncode\n```\n')">コード</button>
          <button type="button" @click="insertBlock('::: info 作中事実\n\n:::')">事実</button>
          <button type="button" @click="insertBlock('::: tip 考察\n\n:::')">考察</button>
          <button type="button" @click="insertBlock('::: warning 注意\n\n:::')">注意</button>
          <button type="button" @click="insertBlock('::: danger 未解決\n\n:::')">未解決</button>
          <select class="term-insert" @change="handleTermSelect">
            <option value="">用語リンク</option>
            <option v-for="term in terminologyOptions" :key="term.value" :value="term.value">{{ term.label }}</option>
          </select>
        </div>

        <div class="mobile-editor-tabs" role="tablist" aria-label="編集表示">
          <button type="button" :class="{ active: mobilePane === 'markdown' }" @click="mobilePane = 'markdown'">Markdown</button>
          <button type="button" :class="{ active: mobilePane === 'preview' }" @click="mobilePane = 'preview'">Preview</button>
        </div>

        <div class="editor-grid">
          <textarea
            v-model="form.body"
            class="admin-editor-textarea"
            :class="{ active: mobilePane === 'markdown' }"
            spellcheck="false"
            @input="persistDraft"
          ></textarea>

          <section class="admin-preview vp-doc" :class="{ active: mobilePane === 'preview' }" aria-label="Markdown preview" v-html="renderedPreview"></section>
        </div>

        <div class="editor-actions">
          <button type="button" @click="restoreDraft">Cancel</button>
          <button type="button" class="primary" :disabled="isSaving" @click="saveArticle">
            {{ isSaving ? 'Saving...' : form.status === 'published' ? 'Save Publish' : 'Save Draft' }}
          </button>
          <button type="button" class="danger" :disabled="!form.sha" @click="deleteArticle">削除</button>
        </div>
      </main>
    </div>
  </div>
</template>
