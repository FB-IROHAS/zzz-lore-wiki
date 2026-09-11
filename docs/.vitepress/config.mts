import { defineConfig } from 'vitepress'
import { wikiLinkEntries } from './data/wikiLinks'

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const autoLinkTerms = wikiLinkEntries
  .flatMap(entry => [entry.term, ...(entry.aliases ?? [])].map(term => ({ term, link: entry.link })))
  .sort((a, b) => b.term.length - a.term.length)

const autoLinkPattern = new RegExp(`(${autoLinkTerms.map(item => escapeRegExp(item.term)).join('|')})`, 'g')
const autoLinkMap = new Map(autoLinkTerms.map(item => [item.term, item.link]))
const normalizeWikiPath = (value: string) => `/${value.replace(/^\//, '').replace(/\.md$/, '').replace(/\.html$/, '')}`
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "ZZZ Lore & Archive",
  description: "「ゼンレスゾーンゼロ」のストーリー・世界観・設定・時系列・考察を整理する設定資料Wiki",
  lang: 'ja-JP',
  appearance: 'dark',
  srcExclude: [
    'editor/**/*.md',
    'templates/**/*.md',
    'characters/index.md',
    'terminology/index.md'
  ],
  
  head: [
    ['meta', { name: 'theme-color', content: '#121316' }],
    ['meta', { name: 'author', content: 'ZZZ Lore Archive Administrator' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'ZZZ Lore & Archive' }],
    ['meta', { property: 'og:description', content: '「ゼンレスゾーンゼロ」の設定資料・時系列・考察データベース' }],
  ],

  themeConfig: {
    siteTitle: 'ZZZ Lore & Archive',

    // 上部ナビゲーション
    nav: [
      { text: 'ホーム', link: '/' },
      { text: '年代表', link: '/timeline/' },
      { text: '考察', link: '/theories/' },
      { text: '資料・出典', link: '/sources/' }
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
          text: '記事',
          items: [
            { text: 'アキラ', link: '/characters/akira' },
            { text: 'リン', link: '/characters/rin' }
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
      '/theories/': [
        {
          text: '記事',
          items: [
            { text: '考察一覧', link: '/theories/' }
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
  },

  markdown: {
    config(md) {
      md.core.ruler.after('inline', 'zzz_wiki_auto_links', state => {
        const Token = state.Token
        const currentPath = normalizeWikiPath(String(state.env?.path ?? state.env?.relativePath ?? ''))

        state.tokens.forEach((blockToken, blockIndex) => {
          if (blockToken.type !== 'inline' || !blockToken.children) return
          if (state.tokens[blockIndex - 1]?.type === 'heading_open') return

          let inLink = false
          const nextChildren: typeof blockToken.children = []

          blockToken.children.forEach(child => {
            if (child.type === 'link_open') inLink = true
            if (child.type === 'link_close') inLink = false

            if (inLink || child.type !== 'text' || !autoLinkPattern.test(child.content)) {
              autoLinkPattern.lastIndex = 0
              nextChildren.push(child)
              return
            }

            autoLinkPattern.lastIndex = 0
            let lastIndex = 0
            child.content.replace(autoLinkPattern, (match, _term, offset) => {
              if (offset > lastIndex) {
                const textToken = new Token('text', '', 0)
                textToken.content = child.content.slice(lastIndex, offset)
                nextChildren.push(textToken)
              }

              const linkHref = autoLinkMap.get(match) ?? '/'

              if (normalizeWikiPath(linkHref) === currentPath) {
                const textToken = new Token('text', '', 0)
                textToken.content = match
                nextChildren.push(textToken)
                lastIndex = offset + match.length
                return match
              }

              const linkOpen = new Token('link_open', 'a', 1)
              linkOpen.attrs = [['href', linkHref]]
              const linkText = new Token('text', '', 0)
              linkText.content = match
              const linkClose = new Token('link_close', 'a', -1)

              nextChildren.push(linkOpen, linkText, linkClose)
              lastIndex = offset + match.length
              return match
            })

            if (lastIndex < child.content.length) {
              const textToken = new Token('text', '', 0)
              textToken.content = child.content.slice(lastIndex)
              nextChildren.push(textToken)
            }
          })

          blockToken.children = nextChildren
        })
      })
    }
  }
})
