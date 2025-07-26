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

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import helpers from 'lib/helpers'

import { updateSetting } from 'actions/settings'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'

@observer
class InputWithSave extends React.Component {
  @observable value = ''

  constructor (props) {
    super(props)

    makeObservable(this)
  }

  componentDidMount () {
    this.value = this.props.initialValue ? this.props.initialValue : ''
    helpers.UI.inputs()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (typeof this.props.initialValue !== 'undefined') {
      if (prevProps.initialValue !== this.props.initialValue) {
        this.value = this.props.initialValue
      }
    }
  }

  onSaveClicked () {
    this.props.updateSetting({ name: this.props.settingName, value: this.value, stateName: this.props.stateName })
  }

  updateValue (evt) {
    this.value = evt.target.value
  }

  render () {
    let width = '100%'
    if (this.props.width) width = this.props.width

    return (
      <div className='uk-width-1-1 uk-float-right' style={{ width: width }}>
        <div className='uk-width-3-4 uk-float-left' style={{ paddingRight: '10px' }}>
          <input
            id={this.props.stateName}
            className='md-input md-input-width-medium'
            type='text'
            value={this.value}
            onChange={evt => this.updateValue(evt)}
          />
        </div>
        <div className='uk-width-1-4 uk-float-right' style={{ marginTop: '10px', textAlign: 'center' }}>
          <button className='md-btn md-btn-small' onClick={e => this.onSaveClicked(e)}>
            {this.props.saveLabel ? this.props.saveLabel : 'Save'}
          </button>
        </div>
      </div>
    )
  }
}

InputWithSave.propTypes = {
  updateSetting: PropTypes.func.isRequired,
  settingName: PropTypes.string.isRequired,
  stateName: PropTypes.string.isRequired,
  saveLabel: PropTypes.string,
  initialValue: PropTypes.string,
  value: PropTypes.string,
  width: PropTypes.string
}

export default connect(null, { updateSetting })(InputWithSave)
