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
const ticketSchema = require('../models/ticket')

_.mixin({
  sortKeysBy: function (obj, comparator) {
    const keys = _.sortBy(_.keys(obj), function (key) {
      return comparator ? comparator(obj[key], key) : key
    })

    return _.zipObject(
      keys,
      _.map(keys, function (key) {
        return obj[key]
      })
    )
  }
})

const init = function (tickets, callback) {
  const obj = {}
  let $tickets = []

  async.series(
    [
      function (done) {
        if (tickets) {
          ticketSchema.populate(tickets, { path: 'owner comments.owner assignee' }, function (err, _tickets) {
            if (err) return done(err)

            $tickets = _tickets

            return done()
          })
        } else {
          ticketSchema.getForCache(function (err, tickets) {
            if (err) return done(err)

            ticketSchema.populate(tickets, { path: 'owner comments.owner assignee' }, function (err, _tickets) {
              if (err) return done(err)

              $tickets = _tickets

              return done()
            })
          })
        }
      },
      function (done) {
        buildMostRequester($tickets, function (result) {
          obj.mostRequester = _.first(result)

          return done()
        })
      },
      function (done) {
        buildMostComments($tickets, function (result) {
          obj.mostCommenter = _.first(result)

          return done()
        })
      },
      function (done) {
        buildMostAssignee($tickets, function (result) {
          obj.mostAssignee = _.first(result)

          return done()
        })
      },
      function (done) {
        buildMostActiveTicket($tickets, function (result) {
          obj.mostActiveTicket = _.first(result)

          return done()
        })
      }
    ],
    function (err) {
      $tickets = null // clear it
      if (err) return callback(err)

      return callback(null, obj)
    }
  )
}

function buildMostRequester (ticketArray, callback) {
  let requesters = _.map(ticketArray, function (m) {
    if (m.owner) {
      return m.owner.fullname
    }

    return null
  })

  requesters = _.compact(requesters)

  let r = _.countBy(requesters, function (k) {
    return k
  })
  r = _(r).value()

  r = _.map(r, function (v, k) {
    return { name: k, value: v }
  })

  r = _.sortBy(r, function (o) {
    return -o.value
  })

  return callback(r)
}

function flatten (arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
  }, [])
}

function buildMostComments (ticketArray, callback) {
  let commenters = _.map(ticketArray, function (m) {
    return _.map(m.comments, function (i) {
      return i.owner.fullname
    })
  })

  commenters = flatten(commenters)

  let c = _.countBy(commenters, function (k) {
    return k
  })

  c = _(c).value()

  c = _.map(c, function (v, k) {
    return { name: k, value: v }
  })

  c = _.sortBy(c, function (o) {
    return -o.value
  })

  return callback(c)
}

function buildMostAssignee (ticketArray, callback) {
  ticketArray = _.reject(ticketArray, function (v) {
    return _.isUndefined(v.assignee) || _.isNull(v.assignee)
  })

  const assignees = _.map(ticketArray, function (m) {
    return m.assignee.fullname
  })

  let a = _.countBy(assignees, function (k) {
    return k
  })

  a = _(a).value()

  a = _.map(a, function (v, k) {
    return { name: k, value: v }
  })

  a = _.sortBy(a, function (o) {
    return -o.value
  })

  return callback(a)
}

function buildMostActiveTicket (ticketArray, callback) {
  let tickets = _.map(ticketArray, function (m) {
    return { uid: m.uid, cSize: _.size(m.history) }
  })

  tickets = _.sortBy(tickets, 'cSize').reverse()

  return callback(tickets)
}

module.exports = init
