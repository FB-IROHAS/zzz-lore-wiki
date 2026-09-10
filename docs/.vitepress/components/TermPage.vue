<script setup lang="ts">
import { computed } from 'vue';
import terms from '../data/terminologyData.json';

interface TermEntry {
  slug: string;
  term: string;
  english?: string;
  aliases?: string[];
  category: string;
  summary: string;
  description: string;
  related?: string[];
  references?: string[];
}

const props = defineProps<{ slug: string }>();
const allTerms = terms as TermEntry[];
const term = computed(() => allTerms.find(item => item.slug === props.slug));
const termByName = new Map(allTerms.map(item => [item.term, item]));
</script>

<template>
  <article v-if="term" class="term-page">
    <div class="term-meta-line">
      <span>{{ term.category }}</span>
      <span v-if="term.english">{{ term.english }}</span>
      <span v-if="term.aliases?.length">別名: {{ term.aliases.join(' / ') }}</span>
    </div>

    <h2>説明</h2>
    <p>{{ term.description }}</p>

    <h2 v-if="term.related?.length">関連語</h2>
    <ul v-if="term.related?.length">
      <li v-for="related in term.related" :key="related">
        <a v-if="termByName.get(related)" :href="`/terminology/${termByName.get(related)?.slug}`">{{ related }}</a>
        <span v-else>{{ related }}</span>
      </li>
    </ul>

    <h2>参考文献</h2>
    <div class="custom-block info">
      <p class="custom-block-title">参考文献</p>
      <ul>
        <li v-for="reference in term.references ?? ['未登録']" :key="reference">{{ reference }}</li>
      </ul>
    </div>
  </article>

  <div v-else class="term-page-missing">
    <p>この用語はマスターに登録されていません。</p>
  </div>
</template>
