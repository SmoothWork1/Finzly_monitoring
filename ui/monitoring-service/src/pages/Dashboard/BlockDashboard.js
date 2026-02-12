// import PropTypes from "prop-types";
import React, { Component } from "react";

// Simple bar
// import SimpleBar from "simplebar-react";

// MetisMenu
// import MetisMenu from "metismenujs";
import { withRouter } from "react-router-dom";
// import { Link } from "react-router-dom";

// i18n
import { withTranslation } from "react-i18next";
import { alertError } from "config/toast";
import { blockTitles/* , pageTypes */ } from "config/globals";
import { getBlocksReq, getUsersReq } from "config/httpRoutes";
// import { limitNumVal } from "config/helpers";
import { connect } from "react-redux";
import { sendMessage } from "config/websocket";
import { saveList } from "actions/lists";
// import dripImg from "../../assets/images/dripping.png";
import paryGif from "../../assets/images/party.gif";
import { safelyParseJSONObj } from "config/helpers";
import GridDetailsModal from "./GridDetailsModal";

class BlockDashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			blocks: {},
			viewmodal: false,
			users: null,
			event: {}
		};
		this.refDiv = React.createRef();
	}

	componentDidMount() {
		this.getRecentEventTypeBlocks();
		this.getUsers();
	}

	getUsers = () => {
		getUsersReq()
		.then( (res) => {
			this.setState({users: res.users});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch required data");
		});
	}

	getRecentEventTypeBlocks = () => {
		const error = sendMessage('events', {actionPack: 'blocks', user_id: this.props.userid});
		if(error) {
			this.getRecentEventTypeBlocksAsync();
		}
	}

	getRecentEventTypeBlocksAsync = () => {
		getBlocksReq()
		.then( (res) => {
			// const blocks = res.blocks.map( (r) => ({
			// 	...r,
			// 	details: safelyParseJSONObj(r.details),
			// }));
			// this.setState({blocks: res.blocks});
			// this.props.saveList({blocks});
			this.props.saveList({blocks: res.blocks});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch recent event blocks");
		});
	}

	getBlockTenant = (block) => {
		const details = safelyParseJSONObj(block.details);
		return details?.Tenant || details?.tenant /* || details?.host */ || '';
	}

	toggleViewModal = (event) => {
		this.setState(prevState => ({
			viewmodal: !prevState.viewmodal, event
		}));
	}

	render() {
		const { blocks } = this.props;
		const { event } = this.state;
		const keys = Object.keys(blocks);
		document.title = "Blocks Dashboard";
		return (
			<React.Fragment>
				<GridDetailsModal
					isOpen={this.state.viewmodal}
					toggle={() => {this.toggleViewModal({})}}
					event={event}
					users={this.state.users}
					refresh={this.getRecentEventTypeBlocks}
				/>
				<div className="blockDashContainer">
					{Array.isArray(keys) && keys.length > 0 ?
						keys.map( (b, i) => (
							<React.Fragment key={`column${i}`}>
							<div className="blockDashColumn">
								<div className="blockDashTitleBlock">
									<p className="blockDashColumnTitle">{blockTitles[b]}</p>
								</div>
								{/* {(new Array(blocks[b])).fill(1).map( (x, j) => ( */}
								{blocks[b].map( (x, j) => (
									<div onClick={() => {this.toggleViewModal(x)}} key={`box${j}`} className={`d-flex border-${x.severity} cursor-pointer`}>
										<div className="blockDashTenantBlock">
											<p className="blockDashTenantName">{this.getBlockTenant(x)}</p>
										</div>
										<div className={`blockDashBlock-${x.severity}`} />
									</div>
								))}
								{/* <img src={dripImg} alt="" className="img-fluid blockDashDrip" /> */}
							</div>
							</React.Fragment>
						))
					:
						<img src={paryGif} alt="" className="img-fluid blockDashParty" />
					}
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	blocks: state.lists.blocks,
	userid: state.session.userid
});

const mapDispatchToProps = (dispatch) => ({
	saveList: (list) => {dispatch(saveList(list))},
});

export default withRouter(withTranslation()(connect(mapStateToProps, mapDispatchToProps)(BlockDashboard)));