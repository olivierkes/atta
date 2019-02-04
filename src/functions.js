import settings from './store/settings'

export function playSound (sound) {
  if (settings.getSetting('soundsEnabled')) {
    const audio = new Audio('statics/sounds/' + sound)
    audio.play()
  }
}

export function navigateTo (dest, replace = false) {
  playSound('menu-selection-1.mp3')
  if (!replace) {
    // Pushes a new history entry
    this.$router.push(dest)
  } else {
    // Does not push a new history entry
    this.$router.replace(dest)
  }
}

export function readableTime (sec, twoLines = false) {
  sec = Math.round(sec)
  let s = sec % 60
  let m = (sec - s) / 60
  return (m ? m + ' min' : '') + (twoLines && s && m ? '<br />' : ' ') + (s ? s + ' sec' : '')
}

export function randomItem (list) {
  // Returns an element from the list at random
  return list[Math.floor(Math.random() * list.length)]
}
