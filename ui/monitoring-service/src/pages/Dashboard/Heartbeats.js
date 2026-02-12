import PropTypes from 'prop-types';
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import BootstrapTable from "react-bootstrap-table-next"
// import paginationFactory, { PaginationProvider } from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';

import { Card, CardBody, UncontrolledTooltip, CardTitle } from "reactstrap"
// import { eventTitles } from "config/globals"
import { getHeartbeatsReq } from "config/httpRoutes";
import { generalize, shortenString } from "config/helpers";
import { alertError } from "config/toast";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { sendMessage } from 'config/websocket';
import { saveList } from 'actions/lists';
import { eventTitles } from 'config/globals';

class Heartbeats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gridColumns: [
        {
          dataField: "event_id",
          text: "Event ID",
          sort: true,
          formatter: (cellContent, row) => {
            const type = eventTitles[row.event_id];
            return (
              <>
              <span id={`UncontrolledTooltip${generalize(row.keyF)}EventId`}>{shortenString(type, 25)}</span>
              <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.keyF)}EventId`}>
                {type}
              </UncontrolledTooltip>
              </>
            );
          }
        },
        {
          dataField: "source_system",
          text: "Source System",
          sort: false,
          formatter: (cellContent, row) => (
            <>
            <span id={`UncontrolledTooltip${generalize(row.keyF)}EventType`}>{shortenString(row.source_system, 25)}</span>
            <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.keyF)}EventType`}>
              {row.source_system}
            </UncontrolledTooltip>
            </>
          ),
        },
        {
          dataField: "description",
          text: "Description",
          sort: false,
          formatter: (cellContent, row) => (
            <>
            <span id={`UncontrolledTooltip${generalize(row.keyF)}Description`}>{shortenString(row.description, 25)}</span>
            <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.keyF)}Description`}>
              {row.description}
            </UncontrolledTooltip>
            </>
          ),
        },
        {
          dataField: "executed_on",
          text: "Executed On",
          sort: false,
          formatter: (cellContent, row) => (
            <>
            <span id={`UncontrolledTooltip${generalize(row.keyF)}ExecutedOn`}>{shortenString(row.executed_on, 25)}</span>
            <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.keyF)}ExecutedOn`}>
              {row.executed_on}
            </UncontrolledTooltip>
            </>
          ),
        },
      ],
    }
    this.toLowerCase1 = this.toLowerCase1.bind(this)
  }

  toLowerCase1(str) {
    return str.toLowerCase();
  }

  componentDidMount() {
    this.getHeartbeats();
  }

  getHeartbeats = () => {
    this.props.changePreloader(true);
    const error = sendMessage('events', {
      actionPack: 'heartbeats',
    });
    if(error) {
      this.getHeartbeatsAsync();
    }
  }

  getHeartbeatsAsync = () => {
    this.props.changePreloader(true);
    getHeartbeatsReq()
		.then( (res) => {
      const beats = res.beats.map( (r) => ({
        ...r,
        keyF: `${r.event_id}${r.source_system}`,
        date: new Date(r.executed_on)
      }));
      beats.sort((a, b) =>  a.date - b.date);
      this.props.saveList({beats});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch beats");
		}).finally( () => {
      this.props.changePreloader(false);
		});
  }

  getDayDiff = (day) => {
    switch(day) {
      // case 0:
      //   return 2;
      case 1:
        return 2;
      default:
        return 1;
    }
  }

  getRowBG = (exe) => {
    const dt = new Date(exe);
    const td = new Date();
    td.setDate(td.getDate() - this.getDayDiff(td.getDay()));
    // if((Math.abs(td-dt)/3600000) >= 24) {
    if(((td-dt)/3600000) >= 24) {
      // return { backgroundColor: '#E71A1A66' };
      return "#E71A1A66";
    }
    // return { backgroundColor: 'var(--bs-table-bg)' };
    return "var(--bs-table-bg)";
  }

  render() {
    const { beats } = this.props;
    document.title = "Heartbeats";
    return (
      <React.Fragment>
        <Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
          <CardBody>
            <div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
              <CardTitle className="card-title mb-4 h4">
                Heartbeats
              </CardTitle>
              <i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getHeartbeats()}} />
            </div>
            {Array.isArray(beats) && beats.length > 0 && beats[0].event_id &&
              // <PaginationProvider
              //   pagination={paginationFactory({ // pagination customization
              //     sizePerPage: 10,
              //     hideSizePerPage: true,
              //     hidePageListOnlyOnePage: false,
              //     showTotal: false,
              //   })}
              //   keyField='keyF'
              //   columns={this.state.gridColumns}
              //   data={beats}
              // >
              //   {({ paginationProps, paginationTableProps }) => (
                  <ToolkitProvider
                    keyField="keyF"
                    data={beats}
                    columns={this.state.gridColumns}
                    bootstrap4
                    // search
                  >
                    {toolkitProps => (
                      <React.Fragment>
                        <div className="table-responsive">
                          <BootstrapTable
                            {...toolkitProps.baseProps}
                            // {...paginationTableProps}
                            responsive
                            defaultSorted={[{ dataField: 'date', order: 'desc' }]}
                            bordered={false}
                            striped={false}
                            // selectRow={{ mode: 'checkbox' }}
                            classes={
                              "table align-middle table-nowrap table-check"
                            }
                            headerWrapperClasses={"table-light"}
                            selectRow={{
                              hideSelectAll: true,
                              hideSelectColumn: true,
                              clickToSelect: false,
                              // mode: 'ROW_SELECT_DISABLED',
                              selected: beats.map( (b, i) => b.keyF ),
                              bgColor: (row, rowIndex) => this.getRowBG(row.executed_on),
                              // nonSelectable: beats.map( (b, i) => b.keyF ),
                              // nonSelectableStyle: (row, rowIndex) => this.getRowBG(row.executed_on)
                            }}
                          />
                        </div>
                        {/* <div className="pagination pagination-rounded justify-content-end"> */}
                          {/* <PaginationListStandalone
                            {...paginationProps}
                          /> */}
                          {/* <PaginationTotalStandalone
                            {...paginationProps}
                          /> */}
                        {/* </div> */}
                      </React.Fragment>
                    )}
                  </ToolkitProvider>
              //   )}
              // </PaginationProvider>
            }
          </CardBody>
        </Card>
      </React.Fragment>
    )
  }
}

Heartbeats.propTypes = {
  changePreloader: PropTypes.func,
  saveList: PropTypes.func,
};

const mapStateToProps = (state) => ({
  beats: state.lists.beats,
});

export default withRouter(connect(mapStateToProps, { saveList, changePreloader })(Heartbeats));