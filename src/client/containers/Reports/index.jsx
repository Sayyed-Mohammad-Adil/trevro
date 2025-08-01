import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'

import PageTitle from 'components/PageTitle'
import TruCard from 'components/TruCard'
import Grid from 'components/Grid'
import GridItem from 'components/Grid/GridItem'

import ReportTicketByGroups from 'containers/Reports/subreports/ticketsByGroups'
import ReportTicketsByPriorities from 'containers/Reports/subreports/ticketsByPriorities'
import ReportTicketsByStatus from 'containers/Reports/subreports/ticketsByStatus'
import ReportTicketsByTags from 'containers/Reports/subreports/ticketsByTags'
import ReportTicketsByTypes from 'containers/Reports/subreports/ticketsByTypes'
import ReportTicketsByAssignee from 'containers/Reports/subreports/ticketsByAssignee'

import helpers from 'lib/helpers'

@observer
class ReportsContainer extends React.Component {
  @observable selectedReport = ''

  constructor (props) {
    super(props)

    makeObservable(this)
  }

  componentDidMount () {
    helpers.resizeFullHeight()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    helpers.resizeFullHeight()
  }

  onSelectReportClicked (e, type) {
    e.preventDefault()
    this.selectedReport = type
  }

  render () {
    return (
      <>
        <PageTitle title={'Generate Report'} />
        <Grid>
          <GridItem width={'1-4'} extraClass={'full-height'}>
            <TruCard
              fullSize={true}
              hover={false}
              extraContentClass={'nopadding'}
              content={
                <div>
                  <h6 style={{ padding: '15px 30px', margin: 0, fontSize: '14px' }}>Select Report</h6>
                  <hr className={'nomargin'} />
                  <div style={{ padding: '15px 30px' }}>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      <li style={{ marginBottom: 5 }}>
                        <button
                          className={'btn-link'}
                          onClick={e => this.onSelectReportClicked(e, 'tickets_by_groups')}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#1976d2', textDecoration: 'none' }}
                        >
                          Tickets by Groups
                        </button>
                      </li>
                      <li>
                        <button
                          className={'btn-link'}
                          onClick={e => this.onSelectReportClicked(e, 'tickets_by_priorities')}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#1976d2', textDecoration: 'none' }}
                        >
                          Tickets by Priorities
                        </button>
                      </li>
                      <li>
                        <button
                          className={'btn-link'}
                          onClick={e => this.onSelectReportClicked(e, 'tickets_by_status')}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#1976d2', textDecoration: 'none' }}
                        >
                          Tickets by Status
                        </button>
                      </li>
                      <li>
                        <button
                          className={'btn-link'}
                          onClick={e => this.onSelectReportClicked(e, 'tickets_by_tags')}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#1976d2', textDecoration: 'none' }}
                        >
                          Tickets by Tags
                        </button>
                      </li>
                      <li>
                        <button
                          className={'btn-link'}
                          onClick={e => this.onSelectReportClicked(e, 'tickets_by_types')}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#1976d2', textDecoration: 'none' }}
                        >
                          Tickets by Types
                        </button>
                      </li>
                      <li>
                        <button
                          className={'btn-link'}
                          onClick={e => this.onSelectReportClicked(e, 'tickets_by_assignee')}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#1976d2', textDecoration: 'none' }}
                        >
                          Tickets by Assignee
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              }
            />
          </GridItem>
          <GridItem width={'3-4'} extraClass={'nopadding'}>
            <div style={{ padding: '15px 25px' }}>
              <div>
                {!this.selectedReport && (
                  <h3 className={'uk-text-muted'} style={{ fontWeight: 300, opacity: 0.7 }}>
                    Please select a report type
                  </h3>
                )}
                {this.selectedReport === 'tickets_by_groups' && <ReportTicketByGroups />}
                {this.selectedReport === 'tickets_by_priorities' && <ReportTicketsByPriorities />}
                {this.selectedReport === 'tickets_by_status' && <ReportTicketsByStatus />}
                {this.selectedReport === 'tickets_by_tags' && <ReportTicketsByTags />}
                {this.selectedReport === 'tickets_by_types' && <ReportTicketsByTypes />}
                {this.selectedReport === 'tickets_by_assignee' && <ReportTicketsByAssignee />}
              </div>
            </div>
          </GridItem>
        </Grid>
      </>
    )
  }
}

ReportsContainer.propTypes = {}

const mapStateToProps = state => ({})

export default connect(mapStateToProps, {})(ReportsContainer)
