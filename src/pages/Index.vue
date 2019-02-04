<template>
  <q-page>
    <q-layout view="LHh lpR fff" container style="height: 100vh;" >
      <q-layout-header class="no-shadow">
        <q-toolbar color="transparent">
          <q-btn
            flat round
            icon="fas fa-cog"
            @click="settingsDialog = true"
            color="grey"
          />
          <q-toolbar-title></q-toolbar-title>

          <q-btn flat icon="fas fa-sun" :label="joy" />
          <transition style="z-index: 100000" appear :enter-active-class="'animated ' + (deltaJoy > 0 ? 'fadeInUp' : 'fadeInDown')" :leave-active-class="'animated ' + (deltaJoy > 0 ? 'fadeOutUp' : 'fadeOutDown')">
            <span style="z-index: 100000" :class="'q-title q-mr-sm text-weight-bold ' + (deltaJoy > 0 ? 'text-green' : 'text-red')"  v-if="deltaJoy">{{(deltaJoy > 0 ? "+" : "" )+ deltaJoy}}</span>
          </transition>

          <q-btn flat icon="fas fa-heartbeat" :label="health" v-if="withHealth" />
          <transition appear :enter-active-class="'animated ' + (deltaHealth > 0 ? 'fadeInUp' : 'fadeInDown')" leave-active-class="animated fadeOutDown" v-if="withHealth" >
            <span :class="'q-body-2 q-mr-sm text-weight-bold ' + (deltaHealth > 0 ? 'text-green' : 'text-red')"  v-if="deltaHealth">{{(deltaHealth > 0 ? "+" : "" )+ deltaHealth}}</span>
          </transition>

          <q-toolbar-title></q-toolbar-title>

          <q-btn flat round icon="fas fa-question" v-if="step > 34 || IN_PLOTS" color="grey" @click="antDialogOpen = true"></q-btn>
        </q-toolbar>
      </q-layout-header>
      <q-layout-footer class="no-shadow row justify-around" v-if="DEBUG">
        <q-btn :glossy="caste=='minim'" label="minim" @click="caste='minim'"/>
        <q-btn :glossy="caste=='minor'" label="minor" @click="caste='minor'" />
        <q-btn :glossy="caste=='media'" label="media" @click="caste='media'" />
        <q-btn :glossy="caste=='major'" label="major" @click="caste='major'" />
      </q-layout-footer>
      <q-page-container>
        <q-page padding class="row content-around flex-center" style="height:100%">
          <div v-show="alert" style="background-color: red; height: 100vh; width: 100vw; z-index: -10;" class="fullscreen animate-blink">
          </div>
          <div class="col-12 q-headline text-center">
            <span v-html="text"></span>
            <span class="animate-fade" v-show="cursor">|</span><span class="animate-fade" v-show="!cursor">&nbsp;</span>
          </div>
          <div class="col-12 animate-pop" v-if="question1">
            <div class="row">
              <q-btn class="col-12 q-mb-md" flat color="white" size="lg" :label="question1" @click="nextStep(1)"></q-btn>
              <q-btn class="col-12 q-mb-md" flat color="white" size="lg" :label="question2" @click="nextStep(2)" v-if="question2"></q-btn>
              <q-btn class="col-12" flat color="white" size="lg" :label="question3" @click="nextStep(3)" v-if="question3"></q-btn>
            </div>
          </div>
        </q-page>
      </q-page-container>
      <q-modal v-model="antDialogOpen" maximized>
        <div :style="'padding: ' + paddingDialog + 'px'">
          <q-btn flat @click="antDialogOpen = false" label="Fermer" icon="fas fa-times-circle" class="float-right"/>
          <h4>Les types de fourmis</h4>
          <p>
            <b>La minim:</b> la plus petite des ouvrières, elle s'occupe principalement des cuvées en croissance, et des cultures de champignons à partir des feuilles ramenées par les autres.
          </p>
          <p>
            <b>La minor:</b> présente en nombre dans les expéditions de recherche de nourriture, elle patrouille le territoire et attaque vigoureusement les ennemis potentiels.
          </p>
          <p>
            <b>La media:</b> c'est la fourragère. Elle coupe les feuilles et en rapporte les morceaux au nid pour les cultures de champignons.
          </p>
          <p>
            <b>La major:</b> la plus grande, elle défend la fourmilière contre les envahisseurs, débarasse les obstacles sur les chemins d'approvisionnements, ou ramène les gros objets.
          </p>
          <q-btn flat full-width color="red" label="Je pense savoir qui je suis!" @click="guessCast" v-if="step > 35 || IN_PLOTS"></q-btn>
        </div>
      </q-modal>
      <q-modal v-model="settingsDialog" maximized>
        <div :style="'padding: ' + paddingDialog + 'px'">
          <q-btn flat @click="settingsDialog = false" label="Fermer" icon="fas fa-times-circle" class="float-right"/>
          <h4>Options</h4>

          <q-field
            icon="fas fa-tachometer-alt"
            :label="'Vitesse: ' + SPEED_LABEL"
            class="q-mb-md"
          >
            <q-slider v-model="SPEED_SLIDER" :min="0" :max="3"  color="white"/>
          </q-field>

          <q-field
            icon="fas fa-undo"
            label="Recommancer l'aventure avec une nouvelle fourmi"
            class="q-mb-xl"
          >
            <q-btn color="dark" label="Recommencer" @click="$router.go()"/>
          </q-field>

          <q-field
            icon="fas fa-vials"
            label="Eugénisme: choisis ta caste"
            helper="Choisis cette option si tu veux explorer les différents chemins du jeu, mais tu perds bien sûr l'intérêt de la découverte."
            class="q-mb-md"
          >
            <q-btn flat  label="Choisir ma caste" @click="showCheat=true" v-if="!showCheat" />
            <q-option-group
              v-if="showCheat"
              type="radio"
              v-model="caste"
              :options="[
                {label: 'Minim', value: 'minim'},
                {label: 'Minor', value: 'minor'},
                {label: 'Media', value: 'media'},
                {label: 'Major', value: 'major'},
              ]"
            />
          </q-field>
        </div>
      </q-modal>
    </q-layout>
  </q-page>
</template>

<script>
import SCENARIO from '../assets/scenario.json'
var S = SCENARIO.scenario
var PLOTS = SCENARIO.plots

export default {
  name: 'Jeu',
  data () {
    return {
      timerCursor: null,
      timerCursorSpeed: 500,
      timerText: null,
      targetText: '',
      cursor: true,
      alert: false,
      text: '',
      SPEED_SLIDER: 1, // Value used in settings
      TYPE_SPEED: 60,
      TYPE_SPEED_ORIGINAL: 60,
      step: -1, // -1
      pause: 0,
      ended: false,
      question1: '',
      question2: '',
      question3: '',
      joy: 10,
      deltaJoy: 0,
      health: 10,
      deltaHealth: 0,
      withHealth: false,
      caste: ['minim', 'minor', 'media', 'major'][Math.floor(Math.random() * 4)],
      lastAnswer: null,
      DEBUG: false,
      IN_PLOTS: false, // while FALSE, still in original scenario
      currentPlot: 0,
      antDialogOpen: false,
      plotVars: {}, // store vars defined during plot
      settingsDialog: false,
      showCheat: false
    }
  },
  computed: {
    paddingDialog () {
      return this.$q.screen.gt.md ? 50 : 15
    },
    SPEED () {
      switch (this.SPEED_SLIDER) {
        case 0: return 0.4
        case 1: return 1
        case 2: return 2
        case 3: return 4
      }
    },
    SPEED_LABEL () {
      switch (this.SPEED_SLIDER) {
        case 0: return 'Lent'
        case 1: return 'Normal'
        case 2: return 'Rapide'
        case 3: return 'Très rapide'
      }
    }
  },
  methods: {
    inverseCursor () {
      this.cursor = !this.cursor
    },
    typeChar () {
      var l = 1
      if (this.targetText.substring(this.text.length, this.text.length + 1) === '<') {
        while (this.targetText.substring(this.text.length + l - 1, this.text.length + l) !== '>' && l < this.targetText.length) {
          l += 1
        }
      }

      this.text = this.targetText.substring(0, this.text.length + l)

      if (this.text !== this.targetText) {
        setTimeout(this.typeChar, this.TYPE_SPEED * (0.8 + Math.random() * 0.4) / this.SPEED)
      } else if (this.pause !== -1) {
        setTimeout(this.nextStep, this.pause)
      }
    },
    nextStep (answer) {
      this.step += 1
      this.pause = 0
      if (this.ended) {
        return
      }

      if (answer) {
        this.lastAnswer = answer
      }

      var step
      if (!this.IN_PLOTS && this.step < S.length) {
        // Still in main scenario
        step = S[this.step]
      } else if (!this.IN_PLOTS && this.step >= S.length) {
        // Just ended main scenario !
        this.IN_PLOTS = true
        this.step = -1
      }
      if (this.IN_PLOTS && (this.step >= PLOTS[this.currentPlot].length || this.step === -1)) {
        // New plot, exciting !
        this.currentPlot = Math.floor(Math.random() * PLOTS.length)
        this.step = 0
        this.plotVars = {} // reset story vars
      }
      if (this.IN_PLOTS && this.step < PLOTS[this.currentPlot].length) {
        step = PLOTS[this.currentPlot][this.step]
      }

      // console.log('STEP ' + this.step + ': ')
      // console.log(step)

      // Checking whether step has condition and verify them
      if (step.if !== undefined) {
        var succeed = true
        // console.log(this.plotVars)
        step.if.split('&').forEach(condition => {
          if (condition.includes('caste:')) {
            // check caste
            if (!condition.includes(this.caste)) {
              // Fail check
              succeed = false
            }
          }
          if (condition.includes('=')) {
            let regex = /\s*(.*)\s*=\s*(.*)\s*/g
            let m = regex.exec(condition)
            if (this.plotVars[m[1]] !== m[2]) {
              succeed = false
            }
          }
          if (['J=', 'J>', 'J<'].includes(condition.substr(0, 2))) {
            let val = parseInt(condition.substr(2))
            let op = condition.substr(1, 1)
            if (op === '=' && this.joy !== val) { succeed = false }
            if (op === '<' && this.joy >= val) { succeed = false }
            if (op === '>' && this.joy <= val) { succeed = false }
          }
        })
        if (!succeed) {
          this.nextStep()
          return false
        }
      }

      // Applying current step
      if (step.text !== undefined) {
        // Text
        if (step.add) {
          this.targetText = this.targetText + step.text
        } else {
          this.text = ''
          this.targetText = step.text
        }
        if (step.effects) {
          this.applyEffects(step.effects)
        }
        this.pause = step.pause !== undefined ? step.pause / this.SPEED : -1
        this.TYPE_SPEED = step.speed ? step.speed : this.TYPE_SPEED_ORIGINAL
        this.typeChar()
      } else if (step.alert !== undefined) {
        // Alert
        this.alert = step.alert
        this.nextStep()
      } else if (step.question !== undefined) {
        // Question
        this.question1 = step.question[0]
        this.question2 = step.question[1]
        this.question3 = step.question[2]
      } else if (step.answer && this.lastAnswer === null) {
        this.nextStep()
      } else if (step.answer && this.lastAnswer) {
        // Answer
        var A = this.lastAnswer === 1 ? step.answer : (this.lastAnswer === 2 ? step.answer2 : step.answer3)
        this.question1 = ''
        this.question2 = ''
        this.question3 = ''
        this.lastAnswer = null

        Object.keys(A).forEach(cat => {
          if (cat.includes(this.caste) || cat === '*') {
            this.applyEffects(A[cat])
          }
        })
        this.nextStep()
      }
    },
    applyEffects (effects) {
      effects.forEach(s => {
        if (s[0] === 'J') {
          // Impact Joy
          let n = parseInt(s.substr(1))
          this.joy += n
          this.deltaJoy = 0
          setTimeout(() => this.setDeltaJoy(n), 100)
          setTimeout(() => this.setDeltaJoy(0), 4000 / this.SPEED)
        } else if (s[0] === 'S') {
          // Impacts Health / Santé
          let n = parseInt(s.substr(1))
          this.health += n
          this.deltaHealth = 0
          setTimeout(() => this.setDeltaHealth(n), 100)
          setTimeout(() => this.setDeltaHealth(0), 4000 / this.SPEED)
        } else if (s.substr(0, 2) === 'D:' && s.includes('=')) {
          // Defines var
          let regex = /\s*(.*)\s*=\s*(.*)\s*/g
          let m = regex.exec(s.substr(2))
          this.plotVars[m[1]] = m[2]
        }
      })
    },
    setDeltaJoy (n = 0) {
      this.deltaJoy = n
    },
    setDeltaHealth (n = 0) {
      this.deltaHealth = n
    },
    moveStep (val) {
      this.step += val - 1
      this.nextStep()
    },
    guessCast () {
      this.$q.dialog({
        title: 'Alors, petite Atta, quelle est ta caste?',
        message: 'Je suis…',
        options: {
          type: 'radio',
          model: 'guess',
          items: [
            {label: 'une minim', value: 'minim'},
            {label: 'une minor', value: 'minor'},
            {label: 'une media', value: 'media'},
            {label: 'une major', value: 'major'}
          ]
        },
        cancel: 'Plus tard',
        preventClose: false
      }).then(data => {
        if (data === this.caste) {
          this.$q.dialog({
            title: 'Félicitations !',
            message: 'Tu es bien une ' + data + '.'
          })
        } else {
          this.$q.dialog({
            title: 'Essaie encore…',
            message: 'Eh non, tu n\'es pas une ' + data + '. Essaie encore un peu de découvrir qui tu es.'
          })
        }
      }).catch(() => {})
    }
  },
  mounted: function () {
    this.timerCursor = setInterval(this.inverseCursor, this.timerCursorSpeed)
    this.$nextTick(function () {
      this.nextStep()
    })
  },
  beforeDestroy () {
    clearInterval(this.timerCursor)
    this.ended = true
  }
}
</script>

<style lang="stylus" >

body
  background-color #000
  color #fff

.modal-content
  background-color #000

.modal-body
  color #fff

</style>
