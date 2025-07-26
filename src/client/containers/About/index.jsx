import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { showModal, hideModal } from 'actions/common'

import helpers from 'lib/helpers'

class AboutContainer extends React.Component {
  componentDidMount () {
    helpers.setupScrollers()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    helpers.resizeAll()
  }

  render () {
    return (
      <div className='nopadding page-content'>
        <div className='uk-grid full-height scrollable' style={{ padding: '0 15px' }}>
          <div className='uk-width-1-2 uk-position-relative' style={{ padding: '25px 0 0 0' }}>
            <span style={{ position: 'absolute', top: 7, left: 35, fontSize: '11px' }} className='uk-text-muted'>
              Powered by
            </span>
            <a href="/" ><img src="/img/logo.png" alt="Trevyro Logo" style="display: block; position: absolute; top: 15px; left: 15px; height: 75px" /></a>
            <div style={{ paddingLeft: 40 }}>
              <h6>Trevyro version {this.props.viewdata.get('version')}</h6>
              <p style={{ fontSize: '12px' }}>
                Copyright &copy;2014-2022 Trevyro, Inc. (Chris Brame) <br /> <br />
                <a href='https://docs.trevyro.io/v1.2/' className='no-ajaxy' rel={'noreferrer'} target='_blank'>
                  General Documentation
                </a>
                <br />
                <a href='https://docs.trevyro.io/v1/api' className='no-ajaxy' rel={'noreferrer'} target='_blank'>
                  API Documentation
                </a>
                <br />
                <a
                  href='#'
                  className='no-ajaxy'
                  onClick={e => {
                    this.props.showModal('PRIVACY_POLICY')
                  }}
                >
                  Privacy Policy
                </a>{' '}
                <br />
                <br />
                Licensed under the Apache License, Version 2.0 (the &quot;License&quot;); you may not use this file
                except in compliance with the License. You may obtain a copy of the License at{' '}
                <a href='http://www.apache.org/licenses/LICENSE-2.0' rel={'noreferrer'} target='_blank'>
                  http://www.apache.org/licenses/LICENSE-2.0
                </a>
                .
                <br />
                Unless required by applicable law or agreed to in writing, software distributed under the License is
                distributed on an &quot;AS IS&quot; BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
                or implied. See the License for the specific language governing permissions and limitations under the
                License.
              </p>
              <p style={{ color: '#55616e', fontSize: '12px' }}>
                Please support the project by donating. A simple cup of coffee or a good dinner goes a long way.
                <a
                  href='https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=USPWFP6P6RTKC'
                  target='_blank'
                  rel={'noreferrer'}
                >
                  Donate
                </a>
              </p>
              <hr style={{ width: '100%', height: 1 }} className='bg-accent' />
              <p style={{ color: '#55616e', fontSize: '12px', marginBottom: 5 }}>
                This software uses the following third party plugins:
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  fontSize: '11px',
                  color: '#55616e',
                  padding: 0,
                  margin: 0
                }}
              >
                <li>
                  Chosen -{' '}
                  <a href='https://harvesthq.github.io/chosen/' target='_blank' rel={'noreferrer'}>
                    https://harvesthq.github.io/chosen/
                  </a>
                </li>
                <li>
                  D3 -{' '}
                  <a href='https://d3js.org/' target='_blank' rel={'noreferrer'}>
                    https://d3js.org/
                  </a>
                </li>
                <li>
                  Datatables -{' '}
                  <a href='https://www.datatables.net/' target='_blank' rel={'noreferrer'}>
                    https://www.datatables.net/
                  </a>
                </li>
                <li>
                  Easy Pie Chart -{' '}
                  <a href='https://rendro.github.io/easy-pie-chart/' target='_blank' rel={'noreferrer'}>
                    https://rendro.github.io/easy-pie-chart/
                  </a>
                </li>
                <li>
                  jQuery -{' '}
                  <a href='https://jquery.com/' target='_blank' rel={'noreferrer'}>
                    https://jquery.com/
                  </a>
                </li>
                <li>
                  Js-cookie -{' '}
                  <a href='https://github.com/js-cookie/js-cookie' target='_blank' rel={'noreferrer'}>
                    https://github.com/js-cookie/js-cookie
                  </a>
                </li>
                <li>
                  Lodash -{' '}
                  <a href='http://lodash.com/' target='_blank' rel={'noreferrer'}>
                    http://lodash.com/
                  </a>
                </li>
                <li>
                  MetricsGraphics.js -{' '}
                  <a href='http://metricsgraphicsjs.org/' target='_blank' rel={'noreferrer'}>
                    http://metricsgraphicsjs.org/
                  </a>
                </li>
                <li>
                  PACE -{' '}
                  <a href='https://codebyzach.github.io/pace/' target='_blank' rel={'noreferrer'}>
                    https://codebyzach.github.io/pace/
                  </a>
                </li>
                <li>
                  Selectize.js -{' '}
                  <a href='http://selectize.github.io/selectize.js/' target='_blank' rel={'noreferrer'}>
                    http://selectize.github.io/selectize.js/
                  </a>
                </li>
                <li>
                  Snackbar -{' '}
                  <a href='http://www.polonel.com/snackbar' target='_blank' rel={'noreferrer'}>
                    http://www.polonel.com/snackbar
                  </a>
                </li>
                <li>
                  Turndown -{' '}
                  <a href='https://github.com/domchristie/to-markdown' target='_blank' rel={'noreferrer'}>
                    https://github.com/domchristie/to-markdown
                  </a>
                </li>
                <li>
                  UIKit (customized) -{' '}
                  <a href='http://getuikit.com' target='_blank' rel={'noreferrer'}>
                    http://getuikit.com
                  </a>
                </li>
                <li>
                  Webpack -{' '}
                  <a href='https://webpack.github.io/' target='_blank' rel={'noreferrer'}>
                    https://webpack.github.io/
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

AboutContainer.propTypes = {
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  viewdata: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  viewdata: state.common.viewdata
})

export default connect(mapStateToProps, { showModal, hideModal })(AboutContainer)
