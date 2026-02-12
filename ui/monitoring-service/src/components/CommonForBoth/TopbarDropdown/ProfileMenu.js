import React, { Component } from "react";
import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { withRouter, Link } from "react-router-dom";

//i18n
import { withTranslation } from "react-i18next";

// users
import user1 from "../../../assets/images/users/avatar-1.jpg";

import { connect } from "react-redux";
import { logout } from "actions/session";
import { closeWebsocketConn } from "config/websocket";

// const getUserName = () => {
//   if (localStorage.getItem("authUser")) {
//     const obj = JSON.parse(localStorage.getItem("authUser"))
//     return obj;
//   }
// }

class ProfileMenu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      menu: false,
      name: props.name.split("$~")[0],
    }
    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.setState(prevState => ({
      menu: !prevState.menu,
    }))
  }

  // componentDidMount() {
  //   const userData = getUserName();
  //   if (userData) {
  //     this.setState({ name: userData.username })
  //   }
  // }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.success !== this.props.success) {
  //     const userData = getUserName();
  //     if (userData) {
  //       this.setState({ name: userData.username })
  //     }
  //   }
  // }

  render() {
    return (
      <React.Fragment>
        <Dropdown
          isOpen={this.state.menu}
          toggle={this.toggle}
          className="d-inline-block"
        >
          <DropdownToggle
            className="btn header-item"
            id="page-header-user-dropdown"
            tag="button"
          >
            {/* <img
              className="rounded-circle header-profile-user"
              src={user1}
              alt="Header Avatar"
            />{" "} */}
            <span className="d-none d-sm-inline-block ms-1">
              {this.state.name}
            </span>
            <i className="mdi mdi-chevron-down d-none d-sm-inline-block" />
            <i className="bx bx-chevron-down fs-3 d-xs d-sm-none" />
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-end">
            {/* <DropdownItem tag="a" href="/profile">
              <i className="bx bx-user font-size-16 align-middle ms-1" />
              {this.props.t("Profile")}
            </DropdownItem>
            <DropdownItem tag="a" href="/crypto-wallet">
              <i className="bx bx-wallet font-size-16 align-middle me-1" />
              {this.props.t("My Wallet")}
            </DropdownItem>
            <DropdownItem tag="a" href="auth-lock-screen">
              <span className="badge bg-success float-end">11</span>
              <i className="bx bx-lock-open font-size-16 align-middle me-1" />
              {this.props.t("Lock screen")}
            </DropdownItem> */}
            <DropdownItem tag="a" href="/flags">
              <i className="bx bx-flag font-size-17 align-middle me-1" />
              {this.props.t("Event Flags")}
            </DropdownItem>
            {/* {this.props.usertype === 'Support' && */}
              <DropdownItem tag="a" href="/subscriptions">
                <i className="bx bx-wrench font-size-17 align-middle me-1" />
                {this.props.t("Event Subscriptions")}
              </DropdownItem>
            {/* } */}
            <div className="dropdown-divider" />
            <Link to="/#" className="dropdown-item" onClick={() => {closeWebsocketConn(this.props.userid); this.props.logout();}}>
              <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
              <span>{this.props.t("Logout")}</span>
            </Link>
          </DropdownMenu>
        </Dropdown>
      </React.Fragment>
    )
  }
}

ProfileMenu.propTypes = {
  t: PropTypes.any,
  success: PropTypes.string,
  logout: PropTypes.func,
  name: PropTypes.string,
  usertype: PropTypes.string,
}

const mapStateToProps = state => {
  const { success } = state.Profile
  const { name, type:usertype, userid } = state.session
  return { success, name, usertype, userid }
}

export default withRouter(
  connect(mapStateToProps, { logout })(withTranslation()(ProfileMenu))
)
