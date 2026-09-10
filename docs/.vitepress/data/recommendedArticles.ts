export interface RecommendedArticle {
  id: string;
  title: string;
  link: string;
  description?: string;
}

// 管理者が手動指定する「おすすめ記事」データ
export const recommendedArticlesData: RecommendedArticle[] = [
  {
    id: 'rec-1',
    title: '「Sunbringer三人説」徹底検証',
    link: '/theories/',
    description: '同一人物説と複数存在説の作中根拠比較'
  },
  {
    id: 'rec-2',
    title: '「Miss Sunbringerと結使」の歴史的交錯',
    link: '/theories/',
    description: '旧都崩壊期の極秘記録文書より'
  },
  {
    id: 'rec-3',
    title: '「Prophecy MV考察」記号論的アプローチ',
    link: '/theories/',
    description: '映像中のルーン文字とエーテル波形データ解析'
  }
];
