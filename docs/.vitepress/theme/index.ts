import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import Timeline from '../components/Timeline.vue';
import Editor from '../components/Editor.vue';
import LatestPopularArticles from '../components/LatestPopularArticles.vue';
import './custom.css';

// VitePress テーマの拡張設定
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // コンポーネントをグローバル登録（MD内で直接利用可能にする）
    app.component('Timeline', Timeline);
    app.component('Editor', Editor);
    app.component('LatestPopularArticles', LatestPopularArticles);
  }
} satisfies Theme;
