import terms from './terminologyData.json';

export interface WikiLinkEntry {
  term: string;
  link: string;
  aliases?: string[];
}

interface TermEntry {
  slug: string;
  term: string;
  aliases?: string[];
}

const terminologyLinkEntries: WikiLinkEntry[] = (terms as TermEntry[]).map(term => ({
  term: term.term,
  link: `/terminology/${term.slug}`,
  aliases: term.aliases,
}));

export const wikiLinkEntries: WikiLinkEntry[] = [
  ...terminologyLinkEntries,
  { term: 'アキラ', link: '/characters/akira' },
  { term: 'リン', link: '/characters/rin' },
];
