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

import React, { createRef } from 'react'
import PropTypes from 'prop-types'
import { merge } from 'lodash'
import clsx from 'clsx'

class EnableSwitch extends React.Component {
  labelRef = createRef()

  onLevelClick (e) {
    e.preventDefault()
    if (this.labelRef.current) {
      this.labelRef.current.click()
    }
  }

  render () {
    const combinedStyle = merge({ margin: '17px 0 0 0' }, this.props.style)
    return (
      <div className='md-switch-wrapper md-switch md-green uk-float-right uk-clearfix' style={combinedStyle}>
        <label ref={this.labelRef} htmlFor={this.props.stateName} style={this.props.labelStyle || {}}>
          {this.props.label}
          {this.props.sublabel}
        </label>

        <input
          type='checkbox'
          id={this.props.stateName}
          name={this.props.stateName}
          onChange={this.props.onChange}
          checked={this.props.checked}
          disabled={this.props.disabled}
        />
        <span className={clsx('lever', this.props.leverClass)} onClick={e => this.onLevelClick(e)} />
      </div>
    )
  }
}

EnableSwitch.propTypes = {
  stateName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  labelStyle: PropTypes.object,
  sublabel: PropTypes.node,
  style: PropTypes.object,
  leverClass: PropTypes.string,
  onChange: PropTypes.func,
  checked: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  disabled: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
}

export default EnableSwitch
