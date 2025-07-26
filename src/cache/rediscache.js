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
const redis = require('redis')
const logger = require('winston')

// const REDIS_PORT = process.env.REDIS_PORT || 6379;
// const REDIS_HOST = process.env.REDIS_HOST || 'localhost';

const client = redis.createClient(32819, '127.0.0.1')

client.on('error', function (err) {
  logger.warn(err)
})

const redisCache = {}

redisCache.setCache = function (key, value, callback, ttl) {
  if (!_.isArray(value)) {
    value = [value]
  }
  if (!_.isUndefined(ttl)) {
    const importMulti = client.multi()
    const v = JSON.stringify(value)
    importMulti.hmset(rake('$trevyro', key), { data: v })
    importMulti.expire(rake('$trevyro', key), 600)

    // value.forEach(function(item) {
    //     const v = JSON.stringify(item);
    //     importMulti.hmset(rake('$trevyro', key), {_id: item._id.toString(), data: v});
    //     importMulti.expire(rake('$trevyro', key), 600);
    // });

    importMulti.exec(function (err) {
      if (err) return callback(err)

      client.quit()

      return callback()
    })
  } else {
    return client.set(key, value)
  }
}

redisCache.getCache = function (key, callback) {
  return client.hgetall(key, callback)
}

function rake () {
  return Array.prototype.slice.call(arguments).join(':')
}

module.exports = redisCache
