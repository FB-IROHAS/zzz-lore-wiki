export interface TimelineEvent {
  id: string;
  era: string;            // 時代区分 (例: "100年前 (黎明期)", "50年前 (旧都期)", "20年前 (新エルド建設)", "5年前", "現在 (Ver.1.x)")
  date?: string;          // 具体的な時期・年代表記
  title: string;         // イベント名
  summary: string;       // 短い概要説明
  image?: string;         // 画像URL・パス (新規追加)
  characters?: string[]; // 関連人物
  organizations?: string[]; // 関連組織・勢力
  link?: string;         // 詳細記事への内部リンク
  source?: string;       // 公式出典・記録媒体
  isFact: boolean;       // 作中確定情報か(true) / 推定・考察含むか(false)
}

// 時代区分のリスト（左側が100年前・右側が現在）
export const ERA_LIST = [
  'すべて',
  '100年前 (黎明期) [サンプル]',
  '50年前 (旧都災害期) [サンプル]',
  '20年前 (新エルド建設期) [サンプル]',
  '5年前 (伴空局発足) [サンプル]',
  '現在 (Ver.1.x) [サンプル]'
] as const;

// 年代表初期サンプルデータ（左:100年前 ➔ 右:現在）
export const defaultTimelineEvents: TimelineEvent[] = [
  {
    id: 'evt-100',
    era: '100年前 (黎明期) [サンプル]',
    date: '約100年前',
    title: '[サンプル] 最初のホロウ現象の観測',
    summary: '世界各地で空間変異現象（ホロウ）が最初に記録されたとされる黎明期の歴史的出来事。古文書と断片的な記録のみが残る。',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    characters: ['古代研究者A'],
    organizations: ['黎明観測機関'],
    link: '/terminology/',
    source: 'ゲーム内フレーバーテキスト [サンプル]',
    isFact: true
  },
  {
    id: 'evt-050',
    era: '50年前 (旧都災害期) [サンプル]',
    date: '約50年前',
    title: '[サンプル] 旧都崩壊と大規模ホロウ大災害',
    summary: '巨大ホロウの急激な侵蝕により、旧首都が壊滅。生存した人類が現在の新エルドの基盤となる居住区の建設を開始する。',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    characters: ['旧都防衛隊長'],
    organizations: ['旧都防衛隊'],
    link: '/timeline/',
    source: 'メインストーリー序章 [サンプル]',
    isFact: true
  },
  {
    id: 'evt-020',
    era: '20年前 (新エルド建設期) [サンプル]',
    date: '約20年前',
    title: '[サンプル] 新エルド都市防壁の完成',
    summary: 'エーテル遮断技術を用いた多重外郭防壁が完成。都市としての新エルドが安全圏を確立する。',
    organizations: ['新エルド統治局'],
    link: '/organizations/',
    source: '公式設定資料集 Vol.1 [サンプル]',
    isFact: true
  },
  {
    id: 'evt-005',
    era: '5年前 (伴空局発足) [サンプル]',
    date: '約5年前',
    title: '[サンプル] 伴空局（Hollow Special Operations）の改組',
    summary: 'ホロウ内の調査・特殊資源採掘およびエーテル侵蝕防護を専門とする公的捜査機関が強化・再構築される。',
    organizations: ['治安局', 'Hollow対策班'],
    link: '/organizations/',
    source: '設定集 [サンプル]',
    isFact: true
  },
  {
    id: 'evt-000',
    era: '現在 (Ver.1.x) [サンプル]',
    date: '現在 (Ver.1.x)',
    title: '[サンプル] 六分街「Random Play」を拠点とするプロキシの暗躍',
    summary: '新エルドの裏社会およびホロウ探索において、高いナビゲーション能力を持つプロキシが異彩を放ち始める。',
    characters: ['プロキシ主人公'],
    organizations: ['Random Play', '邪兎屋'],
    link: '/theories/',
    source: 'Ver.1.0 メインポスター [サンプル]',
    isFact: false
  }
];

export const TIMELINE_STORAGE_KEY = 'zzz_wiki_timeline_events_data';

// ローカルストレージからのイベントデータ取得
export const loadTimelineEvents = (): TimelineEvent[] => {
  if (typeof window === 'undefined') return defaultTimelineEvents;
  const saved = localStorage.getItem(TIMELINE_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('年代表データのパース失敗:', e);
    }
  }
  return defaultTimelineEvents;
};

// ローカルストレージへのイベントデータ保存
export const saveTimelineEvents = (events: TimelineEvent[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(events));
};

// 初期データにリセット
export const resetTimelineEvents = (): TimelineEvent[] => {
  if (typeof window === 'undefined') return defaultTimelineEvents;
  localStorage.removeItem(TIMELINE_STORAGE_KEY);
  return defaultTimelineEvents;
};
