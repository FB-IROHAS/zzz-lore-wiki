<script setup lang="ts">
import terms from '../data/terminologyData.json';

interface TermEntry {
  slug: string;
  term: string;
  english?: string;
  category: string;
  summary: string;
}

const groupedTerms = (terms as TermEntry[]).reduce<Record<string, TermEntry[]>>((groups, term) => {
  groups[term.category] ??= [];
  groups[term.category].push(term);
  return groups;
}, {});
</script>

<template>
  <div class="terminology-index">
    <section v-for="(items, category) in groupedTerms" :key="category" class="term-group">
      <h2>{{ category }}</h2>
      <div class="term-table-wrap">
        <table class="term-table">
          <thead>
            <tr>
              <th>用語</th>
              <th>概要</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.slug">
              <td>
                <a :href="`/terminology/${item.slug}`" class="term-name-link">
                  {{ item.term }}<span v-if="item.english"> / {{ item.english }}</span>
                </a>
              </td>
              <td>{{ item.summary }}</td>
              <td><a :href="`/terminology/${item.slug}`">読む</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
