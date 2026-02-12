import PropTypes from 'prop-types';
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import BootstrapTable from "react-bootstrap-table-next"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';

import { Card, CardBody, UncontrolledTooltip, CardTitle, DropdownToggle, Dropdown, DropdownMenu, DropdownItem, Row, Col, Button } from "reactstrap"
import { getManagableUsersReq, getUsersReq, rmUserReq } from "config/httpRoutes";
import { generalize, shortenString } from "config/helpers";
import { alertError } from "config/toast";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import UserModal from './UserModal';

class Users extends Component {
	constructor(props) {
		super(props);
		this.state = {
			viewmodal: false,
			user: {},
			users: [],
			gridColumns: [
				{
					dataField: "id",
					text: "User ID",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
							<span id={`UncontrolledTooltip${generalize(row.id)}UserId`}>{shortenString(row.id, 25)}</span>
							<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}UserId`}>
								{row.id}
							</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "name",
					text: "Name",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
							<span id={`UncontrolledTooltip${generalize(row.id)}UserName`}>{shortenString(row.name, 25)}</span>
							<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}UserName`}>
								{row.name}
							</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "email",
					text: "Email",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
							<span id={`UncontrolledTooltip${generalize(row.id)}UserEmail`}>{shortenString(row.email, 25)}</span>
							<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}UserEmail`}>
								{row.email}
							</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "contact_number",
					text: "Contact Number",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
							<span id={`UncontrolledTooltip${generalize(row.id)}UserContactNumber`}>{shortenString(row.contact_number, 25)}</span>
							<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}UserContactNumber`}>
								{row.contact_number}
							</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "address",
					text: "Address",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
							<span id={`UncontrolledTooltip${generalize(row.id)}UserAddress`}>{shortenString(row.address, 25)}</span>
							<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}UserAddress`}>
								{row.address}
							</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "type",
					text: "Type",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
							<span id={`UncontrolledTooltip${generalize(row.id)}UserType`}>{shortenString(row.type, 25)}</span>
							<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}UserType`}>
								{row.type}
							</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "devops_type",
					text: "DevOps Type",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
							<span id={`UncontrolledTooltip${generalize(row.id)}UserDevOpsType`}>{shortenString(row.devops_type, 25)}</span>
							<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}UserDevOpsType`}>
								{row.devops_type}
							</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "tenant_id",
					text: "Tenant ID",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
							<span id={`UncontrolledTooltip${generalize(row.id)}UserTenantId`}>{shortenString(row.tenant_id, 25)}</span>
							<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}UserTenantId`}>
								{row.tenant_id}
							</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "view",
					isDummyField: true,
					text: "Actions",
					sort: false,
					formatter: (cellContent, row, i) => {
					return (
						<Dropdown
							isOpen={row.menu}
							toggle={() => {this.toggleAction(i)}}
							className="dropdown d-inline-block"
							tag="li"
						>
							<DropdownToggle
								className="btn header-item noti-icon position-relative"
								tag="button"
								id={`grid-table-${row.id}`}
							>
								{/* <i className="bx bx-dots-vertical" /> */}
								<i className="bx bx-dots-horizontal-rounded color-primary" />
							</DropdownToggle>
					
							<DropdownMenu className="dropdown-menu-end">
								<DropdownItem
									className={`notify-item align-middle`}
									onClick={() => {this.toggleViewModal(row)}}
								>
									<span className="text-success">Update</span>
								</DropdownItem>
								<DropdownItem
									className={`notify-item align-middle`}
									onClick={() => {this.removeUser(row.email)}}
								>
									<span className="text-danger">Delete</span>
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					);},
				}
			],
		}
		this.toLowerCase1 = this.toLowerCase1.bind(this)
	}

	toLowerCase1(str) {
		return str.toLowerCase();
	}

	componentDidMount() {
		this.getUsers();
	}

	getUsers = () => {
		this.props.changePreloader(true);
		getManagableUsersReq()
		.then( (res) => {
			const users = res.users.map( (usr) => ({
				...usr,
				name: `${usr.first_name} ${usr.last_name}`,
				menu: false
			}));
			this.setState({users, viewmodal: false});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch users details");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}
	toggleAction = (i) => {
		const users = this.state.users.map( (r, idx) => ({
			...r,
			menu: idx === i ? !r.menu : r.menu
		}));
		this.setState({users});
	}

	removeUser = (email) => {
		rmUserReq({email})
		.then( (res) => {
			this.getUsers();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove user");
		}).finally( () => {
			this.setState({fetchLoading: false});
		});
	}

	toggleViewModal = (user) => {
		this.setState(prevState => ({
			viewmodal: !prevState.viewmodal, user
		}));
	}

  render() {
    const { users, user, viewmodal } = this.state;
    document.title = "Manage Users";
    return (
      <React.Fragment>
		<UserModal
          isOpen={viewmodal}
          toggle={() => {this.toggleViewModal({})}}
          user={user}
          refresh={this.getUsers}
        />
		<Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
			<Col sm="12">
				<div className="text-sm-end">
				<Button
					color="primary"
					className="font-16 btn-block btn btn-primary mr-1"
					onClick={() => {this.toggleViewModal({})}}
				>
					Add User
				</Button>
				</div>
			</Col>
        </Row>
        <Card style={{marginRight: '0.4rem'}}>
          <CardBody>
            <div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
              <CardTitle className="card-title mb-4 h4">
                Users
              </CardTitle>
              <i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getUsers()}} />
            </div>
            {Array.isArray(users) && users.length > 0 && users[0].id &&
                  <ToolkitProvider
                    keyField="id"
                    data={users}
                    columns={this.state.gridColumns}
                    bootstrap4
                  >
                    {toolkitProps => (
                      <React.Fragment>
                        <div className="table-responsive">
                          <BootstrapTable
                            {...toolkitProps.baseProps}
                            responsive
                            bordered={false}
                            striped={false}
                            classes={
                              "table align-middle table-nowrap table-check"
                            }
                            headerWrapperClasses={"table-light"}
                          />
                        </div>
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

Users.propTypes = {
  changePreloader: PropTypes.func,
//   saveList: PropTypes.func,
};

// const mapStateToProps = (state) => ({
//   beats: state.lists.beats,
// });

export default withRouter(connect(null, { /* saveList, */ changePreloader })(Users));