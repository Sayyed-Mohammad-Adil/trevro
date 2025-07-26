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

class SettingSubItem extends React.Component {
  render () {
    const { parentClass, title, titleCss, subtitle, component, tooltip } = this.props
    const headCss = titleCss ? titleCss : { fontWeight: 'normal' }
    return (
      <div className={parentClass}>
        <div className='uk-float-left uk-width-1-2'>
          <h5 style={headCss}>
            {title}
            {tooltip && (
              <i
                className='material-icons'
                style={{ color: '#888', fontSize: '14px', cursor: 'pointer', lineHeight: '3px', marginLeft: '4px' }}
                data-uk-tooltip
                title={tooltip}
              >
                error
              </i>
            )}
          </h5>
          <div className='p uk-text-muted'>{subtitle}</div>
        </div>
        <div className='uk-float-right uk-width-1-2 uk-clearfix' style={{ position: 'relative', marginTop: '5px' }}>
          <div className='uk-width-1-1 uk-float-right'>{component}</div>
        </div>
      </div>
    )
  }
}

SettingSubItem.propTypes = {
  parentClass: PropTypes.string,
  title: PropTypes.string.isRequired,
  titleCss: PropTypes.object,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.element]),
  tooltip: PropTypes.string,
  component: PropTypes.element
}

SettingSubItem.defaultProps = {
  parentClass: ''
}

export default SettingSubItem
