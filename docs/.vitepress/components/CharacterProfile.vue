<script setup lang="ts">
import { computed } from 'vue';
import { wikiLinkEntries } from '../data/wikiLinks';

interface ProfileItem {
  label: string;
  value?: string;
}

interface LinkedTextPart {
  text: string;
  href?: string;
}

const linkTargets = wikiLinkEntries
  .filter(entry => entry.link.startsWith('/terminology/'))
  .flatMap(entry => [entry.term, ...(entry.aliases ?? [])].map(term => ({ term, link: entry.link })))
  .sort((a, b) => b.term.length - a.term.length);

const linkPattern = new RegExp(`(${linkTargets.map(item => item.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
const linkMap = new Map(linkTargets.map(item => [item.term, item.link]));

const linkify = (value = '未確認'): LinkedTextPart[] => {
  if (!value || value === '未確認' || value === '未記入') return [{ text: value || '未確認' }];

  const parts: LinkedTextPart[] = [];
  let lastIndex = 0;
  linkPattern.lastIndex = 0;

  value.replace(linkPattern, (match, _term, offset) => {
    if (offset > lastIndex) parts.push({ text: value.slice(lastIndex, offset) });
    parts.push({ text: match, href: linkMap.get(match) });
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < value.length) parts.push({ text: value.slice(lastIndex) });
  return parts.length > 0 ? parts : [{ text: value }];
};

const props = withDefaults(defineProps<{
  image?: string;
  alt?: string;
  factionLogo?: string;
  factionLogoAlt?: string;
  realName?: string;
  alias?: string;
  gender?: string;
  age?: string;
  height?: string;
  birthday?: string;
  species?: string;
  faction?: string;
  cv?: string;
  occupation?: string;
  releaseDate?: string;
  attribute?: string;
  specialty?: string;
  attackType?: string;
}>(), {
  image: '/images/characters/placeholder.svg',
  alt: 'キャラクター画像',
  factionLogo: '',
  factionLogoAlt: '陣営ロゴ',
  realName: '未確認',
  alias: '未確認',
  gender: '未確認',
  age: '未確認',
  height: '未確認',
  birthday: '未確認',
  species: '未確認',
  faction: '未確認',
  cv: '未確認',
  occupation: '未確認',
  releaseDate: '未確認',
  attribute: '未確認',
  specialty: '未確認',
  attackType: '未確認',
});

const profileItems = computed<ProfileItem[]>(() => [
  { label: '本名', value: props.realName },
  { label: '通称', value: props.alias },
  { label: '性別', value: props.gender },
  { label: '年齢', value: props.age },
  { label: '身長', value: props.height },
  { label: '誕生日', value: props.birthday },
  { label: '種族', value: props.species },
  { label: '陣営', value: props.faction },
  { label: 'CV', value: props.cv },
  { label: '職業', value: props.occupation },
  { label: 'リリース日', value: props.releaseDate },
]);

const combatItems = computed<ProfileItem[]>(() => [
  { label: '属性', value: props.attribute },
  { label: '特性', value: props.specialty },
  { label: '攻撃タイプ', value: props.attackType },
]);
</script>

<template>
  <section class="character-profile" aria-label="プロフィール">
    <div class="profile-media">
      <div class="profile-photo">
        <img :src="image" :alt="alt" loading="lazy" />
      </div>
      <div v-if="factionLogo" class="faction-logo">
        <span>陣営ロゴ</span>
        <img :src="factionLogo" :alt="factionLogoAlt" loading="lazy" />
      </div>
    </div>
    <div class="profile-details">
      <dl class="profile-grid">
        <div v-for="item in profileItems" :key="item.label" class="profile-row">
          <dt>{{ item.label }}</dt>
          <dd>
            <template v-for="(part, index) in linkify(item.value)" :key="`${item.label}-${index}`">
              <a v-if="part.href" :href="part.href">{{ part.text }}</a>
              <span v-else>{{ part.text }}</span>
            </template>
          </dd>
        </div>
      </dl>

      <section class="combat-profile" aria-label="属性・特性・攻撃タイプ">
        <h2>属性・特性・攻撃タイプ</h2>
        <dl class="combat-grid">
          <div v-for="item in combatItems" :key="item.label" class="combat-row">
            <dt>{{ item.label }}</dt>
            <dd>
              <template v-for="(part, index) in linkify(item.value)" :key="`${item.label}-${index}`">
                <a v-if="part.href" :href="part.href">{{ part.text }}</a>
                <span v-else>{{ part.text }}</span>
              </template>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  </section>
</template>
