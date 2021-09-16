/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding startup/initialization code.
 * Use "quasar new boot <name>" and add it there.
 * One boot file per concern. Then reference the file(s) in quasar.conf.js > boot:
 * boot: ['file', ...] // do not add ".js" extension to it.
 *
 * Boot files are your "main.js"
 **/


import { createApp } from 'vue'







import '@quasar/extras/roboto-font/roboto-font.css'

import '@quasar/extras/material-icons/material-icons.css'



import '@quasar/extras/animate/slideInLeft.css'

import '@quasar/extras/animate/fadeInDown.css'

import '@quasar/extras/animate/fadeOutUp.css'

import '@quasar/extras/animate/fadeOutDown.css'

import '@quasar/extras/animate/fadeInUp.css'


// We load Quasar stylesheet file
import 'quasar/dist/quasar.css'




import 'src/css/app.css'


import createQuasarApp from './app.js'
import quasarUserOptions from './quasar-user-options.js'






console.info('[Quasar] Running ELECTRON.')





const publicPath = ``


async function start ({ app, router, store, storeKey }, bootFiles) {
  

  
  let hasRedirected = false
  const redirect = url => {
    hasRedirected = true
    const normalized = Object(url) === url
      ? router.resolve(url).fullPath
      : url

    window.location.href = normalized
  }

  const urlPath = window.location.href.replace(window.location.origin, '')

  for (let i = 0; hasRedirected === false && i < bootFiles.length; i++) {
    try {
      await bootFiles[i]({
        app,
        router,
        store,
        ssrContext: null,
        redirect,
        urlPath,
        publicPath
      })
    }
    catch (err) {
      if (err && err.url) {
        window.location.href = err.url
        return
      }

      console.error('[Quasar] boot error:', err)
      return
    }
  }

  if (hasRedirected === true) {
    return
  }
  

  app.use(router)
  app.use(store, storeKey)

  

    

    
      app.mount('#q-app')
    

    

  

}

createQuasarApp(createApp, quasarUserOptions)

  .then(app => {
    return Promise.all([
      
      import(/* webpackMode: "eager" */ 'boot/axios'),
      
      import(/* webpackMode: "eager" */ 'boot/github'),
      
      import(/* webpackMode: "eager" */ 'boot/i18n'),
      
      import(/* webpackMode: "eager" */ 'boot/notify-defaults')
      
    ]).then(bootFiles => {
      const boot = bootFiles
        .map(entry => entry.default)
        .filter(entry => typeof entry === 'function')

      start(app, boot)
    })
  })

