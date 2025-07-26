/*
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 ≡  ooooooooooooo                                                                 
 ≡  8'   888   `8                                                                 
 ≡       888      oooo d8b  .ooooo.  oooo    ooo oooo    ooo oooo d8b  .ooooo.    
 ≡       888      `888""8P d88' `88b  `88.  .8'   `88.  .8'  `888""8P d88' `88b   
 ≡       888       888     888ooo888   `88..8'     `88..8'    888     888   888   
 ≡       888       888     888    .o    `888'       `888'     888     888   888   
 ≡      o888o     d888b    `Y8bod8P'     `8'         .8'     d888b    `Y8bod8P'   
 ≡                                               .o..P'                           
 ≡                                               `Y8P'                            
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 ≡  ≡≡≡≡≡≡≡≡ ⟦ Author   ⟧  Sayyed Mohammad Adil ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡ 
 ≡  ≡≡≡≡≡≡≡≡ ⟦ Updated  ⟧  01/04/2025 • 00:00:00 AM ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡ 
 ≡  ≡≡≡≡≡≡≡≡ ⟦ License  ⟧  Copyright © 2025–2026. All rights reserved. ≡≡≡≡≡≡≡≡≡ 
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 */

const _ = require('lodash')
const NodeCache = require('node-cache')
const path = require('path')
const cache = {}

cache.init = function () {
  global.cache = new NodeCache({ checkperiod: 0 })
  cache.memLimit = process.env.CACHE_MEMLIMIT || '2048'
  const env = { FORK: 1, NODE_ENV: global.env, TIMEZONE: global.timezone }
  cache.env = _.merge(cache.env, env)

  spawnCache()
  setInterval(spawnCache, 55 * 60 * 1000)
}

cache.forceRefresh = function() {
  spawnCache()
}

function spawnCache () {
  const fork = require('child_process').fork

  const n = fork(path.join(__dirname, './index.js'), {
    execArgv: ['--max-old-space-size=' + cache.memLimit],
    env: cache.env
  })

  cache.fork = n

  global.forks.push({ name: 'cache', fork: n })

  n.on('message', function (data) {
    if (data.cache) {
      global.cache.data = data.cache.data
    }
  })

  n.on('close', function () {
    _.remove(global.forks, function (i) {
      return i.name === 'cache'
    })
  })
}

module.exports = cache
