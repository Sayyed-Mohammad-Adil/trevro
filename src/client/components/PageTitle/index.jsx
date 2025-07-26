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
import clsx from 'clsx'

class PageTitle extends React.Component {
  render () {
    const { title, rightComponent, shadow, hideBorderBottom, extraClasses } = this.props
    return (
      <div className={clsx('nopadding', extraClasses)}>
        <div
          className={clsx(
            'uk-width-1-1',
            'page-title',
            'pl-25',
            'uk-clearfix',
            hideBorderBottom ? 'nbb' : 'dt-borderBottom',
            !shadow && 'noshadow'
          )}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <p style={{ flexGrow: 1 }}>{title}</p>
          <div>{rightComponent}</div>
        </div>
      </div>
    )
  }
}

PageTitle.propTypes = {
  title: PropTypes.string.isRequired,
  shadow: PropTypes.bool,
  hideBorderBottom: PropTypes.bool,
  extraClasses: PropTypes.string,
  rightComponent: PropTypes.element
}

PageTitle.defaultProps = {
  shadow: false,
  hideBorderBottom: false
}

export default PageTitle
