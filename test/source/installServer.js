const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
require('dotenv').config() // Load environment variables from .env file

// Load configuration from YAML file
const configPath = path.join(__dirname, '../../config.yml')
const config = yaml.load(fs.readFileSync(configPath, 'utf8'))

// Override tokens configuration for testing
config.tokens = {
  secret: 'TestSecretKey',
  expires: 900
}

var is = require('../../src/webserver')

describe('installServer.js', function () {
  it('should start install server', function (done) {
    if (is.server.listening) {
      is.server.close(() => {
        is.installServer(function () {
          done()
        })
      })
    } else {
      is.installServer(function () {
        done()
      })
    }
  })
})
