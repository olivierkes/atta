import { LocalStorage } from 'quasar'

export default {
  // Default values
  helpEnabled: false,
  soundsEnabled: true,
  timerEnabled: true,
  timeBefore: 1 * 60,
  timeStory: 3 * 60,
  includeSummary: true,
  includeSource: true,
  includeSuggestions: true,
  includeStrangeSuggestions: true,
  searchURL: 'https://www.biblegateway.com/passage/?search={ref}&version=SG21',
  // Getter
  getSetting: function (key) {
    return LocalStorage.has(key) ? LocalStorage.get.item(key) : this[key]
  },
  // Setter
  setSetting: function (key, val) {
    LocalStorage.set(key, val)
    this[key] = val
  }
}
