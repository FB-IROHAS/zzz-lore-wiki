import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "ZZZ Lore & Theory Archive",
  description: "「ゼンレスゾーンゼロ」のストーリー・世界観・設定・時系列・考察を整理するアーカイブWiki",
  lang: 'ja-JP',
  
  head: [
    ['meta', { name: 'theme-color', content: '#121316' }],
    ['meta', { name: 'author', content: 'ZZZ Lore Archive Administrator' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'ZZZ Lore & Theory Archive' }],
    ['meta', { property: 'og:description', content: '「ゼンレスゾーンゼロ」のストーリー・世界観・設定・時系列・考察を整理するアーカイブWiki' }],
  ],

  themeConfig: {
    siteTitle: 'ZZZ Lore & Archive',

    // 上部ナビゲーション
    nav: [
      { text: 'ホーム', link: '/' },
      { text: '年代表', link: '/timeline/' },
      { text: 'キャラクター', link: '/characters/' },
      { text: '組織・勢力', link: '/organizations/' },
      { text: '用語集', link: '/terminology/' },
      { text: '考察', link: '/theories/' },
      { text: '資料・出典', link: '/sources/' },
      { text: '✏️ 編集', link: '/editor/' }
    ],

    // カテゴリごとのサイドバー構成
    sidebar: {
      '/timeline/': [
        {
          text: '時系列アーカイブ',
          items: [
            { text: '年代表一覧', link: '/timeline/' }
          ]
        }
      ],
      '/characters/': [
        {
          text: 'キャラクター',
          items: [
            { text: 'キャラクター一覧', link: '/characters/' },
            { text: '[テンプレート] キャラクター記事', link: '/templates/character' }
          ]
        }
      ],
      '/organizations/': [
        {
          text: '組織・勢力',
          items: [
            { text: '組織・勢力一覧', link: '/organizations/' }
          ]
        }
      ],
      '/terminology/': [
        {
          text: '用語集',
          items: [
            { text: '用語一覧', link: '/terminology/' },
            { text: '[テンプレート] 用語記事', link: '/templates/terminology' }
          ]
        }
      ],
      '/theories/': [
        {
          text: '考察データベース',
          items: [
            { text: '考察一覧', link: '/theories/' },
            { text: '[テンプレート] 考察記事', link: '/templates/theory' }
          ]
        }
      ],
      '/sources/': [
        {
          text: '資料・出典',
          items: [
            { text: '資料・出典一覧', link: '/sources/' }
          ]
        }
      ],
      '/editor/': [
        {
          text: 'Wiki 編集ツール',
          items: [
            { text: '記事エディタ', link: '/editor/' }
          ]
        }
      ],
      '/templates/': [
        {
          text: '記事作成テンプレート',
          items: [
            { text: 'キャラクターテンプレート', link: '/templates/character' },
            { text: '用語テンプレート', link: '/templates/terminology' },
            { text: '考察テンプレート', link: '/templates/theory' }
          ]
        }
      ]
    },

    // VitePress 組み込みローカル検索
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '検索',
            buttonAriaLabel: '検索'
          },
          modal: {
            noResultsText: '該当する記事が見つかりません',
            resetButtonTitle: '検索条件をクリア',
            footer: {
              selectText: '選択',
              navigateText: '移動',
              closeText: '閉じる'
            }
          }
        }
      }
    },

    // フッター設定
    footer: {
      message: 'Zenless Zone Zero Lore & Theory Archive (Unofficial)',
      copyright: 'Copyright © ZZZ Lore Archive'
    },

    docFooter: {
      prev: '前のページ',
      next: '次のページ'
    },

    outline: {
      label: '目次',
      level: [2, 3]
    }
  }
})
