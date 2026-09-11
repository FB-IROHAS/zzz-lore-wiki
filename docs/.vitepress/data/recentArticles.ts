export interface RecentArticle {
  id: string;
  title: string;
  link: string;
  updatedDate: string;
  category: string;
}

// 手動管理可能な「最近の更新」データ
export const recentArticlesData: RecentArticle[] = [
  {
    id: 'rec-act-1',
    title: '年代表データベース：旧都災害〜新エルド現代',
    link: '/timeline/',
    updatedDate: '09/10',
    category: '年代表'
  },
  {
    id: 'rec-act-2',
    title: 'Sunbringer (サンブリンガー) 考察追加',
    link: '/theories/',
    updatedDate: '09/10',
    category: '考察'
  },
  {
    id: 'rec-act-3',
    title: '業核・結使の公式記録テキスト整理',
    link: '/theories/',
    updatedDate: '09/09',
    category: '考察'
  }
];
