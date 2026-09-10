import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import Timeline from '../components/Timeline.vue';
import Editor from '../components/Editor.vue';
import LatestPopularArticles from '../components/LatestPopularArticles.vue';
import SidebarWidget from '../components/SidebarWidget.vue';
import WikiPortal from '../components/WikiPortal.vue';
import CharacterProfile from '../components/CharacterProfile.vue';
import TerminologyIndex from '../components/TerminologyIndex.vue';
import TermPage from '../components/TermPage.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import './custom.css';

// VitePress テーマの拡張設定
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // コンポーネントをグローバル登録（MD内で直接利用可能にする）
    app.component('Timeline', Timeline);
    app.component('Editor', Editor);
    app.component('LatestPopularArticles', LatestPopularArticles);
    app.component('SidebarWidget', SidebarWidget);
    app.component('WikiPortal', WikiPortal);
    app.component('CharacterProfile', CharacterProfile);
    app.component('TerminologyIndex', TerminologyIndex);
    app.component('TermPage', TermPage);
    app.component('AdminDashboard', AdminDashboard);
  }
} satisfies Theme;
