export interface PopularArticle {
  id: string;
  rank: string;         // "01", "02", "03" 等
  title: string;        // 記事タイトル
  link: string;         // 記事リンク
  category?: string;    // カテゴリ表記
}

// 手動管理可能な「人気記事」データ
export const popularArticlesData: PopularArticle[] = [
  {
    id: 'pop-1',
    rank: '01',
    title: 'Sunbringer (サンブリンガー) の正体と歴史的足跡',
    link: '/theories/',
    category: '考察'
  },
  {
    id: 'pop-2',
    rank: '02',
    title: 'Miss Sunbringer と結使の関係性についての仮説',
    link: '/theories/',
    category: '考察'
  },
  {
    id: 'pop-3',
    rank: '03',
    title: '業核 (エーテルコア) の高濃度変異現象',
    link: '/terminology/',
    category: '用語'
  },
  {
    id: 'pop-4',
    rank: '04',
    title: '結使と旧都崩壊時に残された暗号文書',
    link: '/sources/',
    category: '資料'
  },
  {
    id: 'pop-5',
    rank: '05',
    title: 'Prophecy (預言) MVおよびフレーバーテキスト徹底考察',
    link: '/theories/',
    category: '考察'
  }
];
