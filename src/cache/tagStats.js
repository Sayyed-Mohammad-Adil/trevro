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
const async = require('async')
const moment = require('moment')

const ticketSchema = require('../models/ticket')

const init = function (tickets, timespan, callback) {
  let tags = []
  let $tickets = []
  if (_.isUndefined(timespan) || _.isNaN(timespan) || timespan === 0) timespan = 365

  let today = moment()
    .hour(23)
    .minute(59)
    .second(59)
  const tsDate = today
    .clone()
    .subtract(timespan, 'd')
    .toDate()
    .getTime()
  today = today.toDate().getTime()

  async.series(
    [
      function (done) {
        if (tickets) {
          ticketSchema.populate(tickets, { path: 'tags' }, function (err, _tickets) {
            if (err) return done(err)

            $tickets = _tickets
            return done()
          })
        } else {
          ticketSchema.getForCache(function (err, tickets) {
            if (err) return done(err)
            ticketSchema.populate(tickets, { path: 'tags' }, function (err, _tickets) {
              if (err) return done(err)

              $tickets = _tickets

              return done()
            })
          })
        }
      },
      function (done) {
        let t = []

        $tickets = _.filter($tickets, function (v) {
          return v.date < today && v.date > tsDate
        })

        for (let i = 0; i < $tickets.length; i++) {
          _.each(tickets[i].tags, function (tag) {
            t.push(tag.name)
          })
        }

        tags = _.reduce(
          t,
          function (counts, key) {
            counts[key]++
            return counts
          },
          _.fromPairs(
            _.map(t, function (key) {
              return [key, 0]
            })
          )
        )

        tags = _.fromPairs(
          _.sortBy(_.toPairs(tags), function (a) {
            return a[1]
          }).reverse()
        )

        t = null

        return done()
      }
    ],
    function (err) {
      if (err) return callback(err)

      $tickets = null // clear it

      return callback(null, tags)
    }
  )
}

module.exports = init
