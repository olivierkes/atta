<template>
  <q-page padding>
    <div v-html="content">
    </div>
    <q-page-sticky expand position="top">
      <q-toolbar>
        <q-btn flat round dense icon="fas fa-arrow-left" @click="$router.push('/')" />
        <q-toolbar-title>Comment jouer?</q-toolbar-title>
      </q-toolbar>
    </q-page-sticky>
  </q-page>
</template>

<style>
</style>

<script>

import categories from '../assets/help.md'
var MD = require('markdown').markdown

export default {
  name: 'Help',
  computed: {
    content () {
      return MD.toHTML(categories)
    }
  }
}
</script>
