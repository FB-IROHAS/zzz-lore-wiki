export interface TimelineEvent {
  id: string;
  era: string;            // 時代区分 (例: "古代・旧文明", "旧都崩壊期", "新エルド建設期", "現代")
  date?: string;          // 具体的な時期・年号表記
  title: string;         // イベント名
  summary: string;       // 1〜2行程度の短い概要説明 (デフォルト表示用)
  details?: string;      // クリック後に展開表示される詳細説明
  characters?: string[]; // 関連人物
  organizations?: string[]; // 関連組織・勢力
  link?: string;         // 詳細記事への内部リンク
  source?: string;       // 公式出典
  isFact: boolean;       // 作中確定情報か(true) / 推定・考察含むか(false)
}

// 時代区分のリスト（歴史の流れ順）
export const ERA_LIST = [
  'すべて',
  '古代・旧文明期',
  '旧都崩壊・大災害期',
  '新エルド建設期',
  '現代 (Ver.1.x~)'
] as const;

// 年代表データ（歴史の流れ：古代 ➔ 現代）
export const defaultTimelineEvents: TimelineEvent[] = [
  {
    id: 'evt-100',
    era: '古代・旧文明期',
    date: '古代 / 年代不詳',
    title: '最初のホロウ現象の発生観測',
    summary: '世界の特定領域で空間変異現象（ホロウ）が最初に記録された歴史的出来事。',
    details: '古文書および断片的な石刻記録に残る最古のホロウ観測データ。当時からエーテル変異の兆候が確認されているが、原因の解明には至っていない。',
    characters: ['古代研究者'],
    organizations: ['黎明観測機関'],
    link: '/theories/',
    source: 'ゲーム内フレーバーテキスト [サンプル]',
    isFact: true
  },
  {
    id: 'evt-050',
    era: '旧都崩壊・大災害期',
    date: '旧都暦 XX年',
    title: '旧都崩壊と大規模ホロウ拡張大災害',
    summary: '巨大ホロウの急激な侵蝕により旧首都が壊滅。生存者が現在の新エルドの基盤を形成する。',
    details: '旧都中心部に発生した特異点型ホロウの侵蝕速度は当時の予測を遥かに上回り、主要インフラが数日で全滅。残された市民は「Sunbringer」や防衛隊の手により現在の安全圏へと避難した。',
    characters: ['Sunbringer', 'Miss Sunbringer', '業核'],
    organizations: ['旧都防衛隊', '結使'],
    link: '/timeline/',
    source: 'メインストーリー序章',
    isFact: true
  },
  {
    id: 'evt-020',
    era: '新エルド建設期',
    date: '新エルド暦 10年',
    title: '新エルド多重防壁の完成と都市機構発足',
    summary: 'エーテル遮断技術を用いた多重外郭防壁が完成。都市としての安全圏が確立。',
    details: '旧都の犠牲をもとに開発された特殊防壁技術が新エルド全域を包囲。これにより都市内部での定常的ホロウ発生を防ぐことに成功した。',
    organizations: ['新エルド統治局', '治安局'],
    link: '/organizations/',
    source: '公式設定資料集 Vol.1',
    isFact: true
  },
  {
    id: 'evt-005',
    era: '新エルド建設期',
    date: '新エルド暦 18年',
    title: '伴空局（Hollow Special Operations）の設立',
    summary: 'ホロウ内の資源採掘とエーテル侵蝕対策を管轄する専門捜査機関が発足。',
    details: 'ホロウ内部への本格的な侵入調査およびエーテル濃縮鉱石の採掘を管理するため、軍事機関から独立した特別対策班が組織された。',
    organizations: ['治安局', 'Hollow対策班'],
    link: '/organizations/',
    source: '設定集',
    isFact: true
  },
  {
    id: 'evt-000',
    era: '現代 (Ver.1.x~)',
    date: '現代',
    title: '六分街プロキシ「Random Play」の暗躍開始',
    summary: '六分街のビデオ屋を表の顔とするプロキシが、特殊なナビゲーション能力で頭角を現す。',
    details: '裏社会のホロウ探索依頼において、驚異的な生存率とルート導きを誇るプロキシ兄弟（アキラ / リン）が暗躍。様々な陣営や治安局から注目を集める。',
    characters: ['プロキシ主人公', 'アキラ', 'リン'],
    organizations: ['Random Play', '邪兎屋'],
    link: '/theories/',
    source: 'Ver.1.0 メインポスター',
    isFact: false
  }
];

export const TIMELINE_STORAGE_KEY = 'zzz_wiki_timeline_events_data';

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

export const saveTimelineEvents = (events: TimelineEvent[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(events));
};

export const resetTimelineEvents = (): TimelineEvent[] => {
  if (typeof window === 'undefined') return defaultTimelineEvents;
  localStorage.removeItem(TIMELINE_STORAGE_KEY);
  return defaultTimelineEvents;
};
