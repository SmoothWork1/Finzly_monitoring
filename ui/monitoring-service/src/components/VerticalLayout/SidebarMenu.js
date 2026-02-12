import PropTypes from "prop-types";
import React, { Component } from "react";

//Simple bar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";

//i18n
import { withTranslation } from "react-i18next";
import { alertError } from "config/toast";
import { pageTypes } from "config/globals";
import { getEventTypeCountReq } from "config/httpRoutes";
import { limitNumVal } from "config/helpers";
import { connect } from "react-redux";
import { sendMessage } from "config/websocket";
import { saveList } from "actions/lists";

class SidebarMenuContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counts: {},
      isRA: (props?.location?.pathname?.indexOf('release_automation') || -1) > -1
    };
    this.refDiv = React.createRef();
  }

  componentDidMount() {
    this.initMenu();
    this.getRecentEventTypeCounts();
  }

  getRecentEventTypeCounts = () => {
    const error = sendMessage('events', {actionPack: 'event_counts', user_id: this.props.userid});
    if(error) {
      this.getRecentEventTypeCountsAsync();
    }
  }
  getRecentEventTypeCountsAsync = () => {
    getEventTypeCountReq()
		.then( (res) => {
			// this.setState({counts: res.counts});
      this.props.saveList({counts: res.counts});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch recent event counts");
		});
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, ss) {
    if (this.props.type !== prevProps.type) {
      this.initMenu();
    }
    if(this.props.location.pathname !== prevProps.location.pathname) {
      this.reInitMenu();
      // Check for RA in URL
      this.setState({isRA: (this.props?.location?.pathname?.indexOf('release_automation') || -1) > -1})
    }
  }

  reInitMenu() {
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    for(let i = 0; i < items.length; ++i) {
      if(this.props.location.pathname === items[i].pathname) {
        matchingMenuItem = items[i];
      } else {
        items[i].classList.remove("active");
        items[i].parentElement?.classList.remove("mm-active");
      }
    }
    if (matchingMenuItem) {
      this.activateParentDropdown(matchingMenuItem);
    }
  }

  initMenu() {
    new MetisMenu("#side-menu");
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    for (let i = 0; i < items.length; ++i) {
      if (this.props.location.pathname === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      this.activateParentDropdown(matchingMenuItem);
    }
  }

  scrollElement = item => {
    setTimeout(() => {
      if (this.refDiv.current !== null) {
        if (item) {
          const currentPosition = item.offsetTop;
          if (currentPosition > window.innerHeight) {
            if (this.refDiv.current)
              this.refDiv.current.getScrollElement().scrollTop =
                currentPosition - 300;
          }
        }
      }
    }, 300);
  };

  activateParentDropdown = item => {
    item.classList.add("active");
    const parent = item.parentElement;

    const parent2El = parent.childNodes[1];
    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      this.scrollElement(item);
      return false;
    }
    this.scrollElement(item);
    return false;
  };

  render() {
    const { counts } = this.props;
    return (
      <React.Fragment>
        <SimpleBar className="h-100" ref={this.refDiv}>
          <div id="sidebar-menu">
            <ul className="metismenu list-unstyled" id="side-menu">
              <li className="menu-title">{this.props.t("Menu")}</li>

              {this.state.isRA ? 
                <>
                <li>
                  <Link to="/release_automation/dashboard">
                    <i className="bx bx-home-circle" />
                    <span>{this.props.t("Dashboard")}</span>
                  </Link>
                </li>
                {/* <li>
                  <Link to="/release_automation/setup">
                    <i className="bx bx-building-house" />
                    <span>{this.props.t("Setup")}</span>
                  </Link>
                </li> */}
                <li>
                <Link to="/#" className="has-arrow" aria-expanded="true">
                    <i className="bx bx-building-house" />
                    <span>{this.props.t("Setup")}</span>
                  </Link>
                  <ul className="sub-menu">
                    <li>
                      <Link to="/release_automation/tenants">
                        {this.props.t("Tenant")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/release_automation/environments">
                        {this.props.t("Environment")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/release_automation/releases">
                        {this.props.t("Release")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/release_automation/tenant_env">
                        {this.props.t("Tenant Env Mapping")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/release_automation/release_env">
                        {this.props.t("Release Env Mapping")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/release_automation/configuration">
                        {this.props.t("Configurations")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/release_automation/applications">
                        {this.props.t("Applications")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/release_automation/devops_properties">
                        {this.props.t("DevOps Properties")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/release_automation/onboarding_questions">
                        {this.props.t("Onboarding Questions")}
                      </Link>
                    </li>
                    <li>
                      <Link to="/release_automation/db_schema">
                        {this.props.t("DB Schemas & Updates")}
                      </Link>
                    </li>
                  </ul>
                </li>
                {/* <li>
                  <Link to="/release_automation/configuration">
                    <i className="bx bx-spreadsheet" />
                    <span>{this.props.t("Configuration")}</span>
                  </Link>
                </li> */}
                </>
              :
                <>
                <li>
                  <Link to="/blockdash">
                    <i className="bx bx-spreadsheet" />
                    <span>{this.props.t("Dashboard")}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/grid/rtExceptions">
                    <i className="bx bx-home-circle" />
                    <span>{this.props.t("Runtime Exceptions")}</span>
                    {counts[pageTypes['rtExceptions']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['rtExceptions']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/prodIssues">
                    <i className="bx bx-home-circle" />
                    <span>{this.props.t("Production Issues")}</span>
                    {counts[pageTypes['prodIssues']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['prodIssues']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/serverHealth">
                    <i className="bx bx-home-circle" />
                    <span>{this.props.t("Application Health")}</span>
                    {counts[pageTypes['serverHealth']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['serverHealth']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/appProcessHealth">
                    <i className="bx bx-home-circle" />
                    <span>{this.props.t("Website Health")}</span>
                    {counts[pageTypes['appProcessHealth']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['appProcessHealth']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/achInbound">
                    <i className="bx bx-money" />
                    <span>{this.props.t("ACH Inbound Files")}</span>
                    {counts[pageTypes['achInbound']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['achInbound']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/achOutbound">
                    <i className="bx bx-money" />
                    <span>{this.props.t("ACH Outbound Files")}</span>
                    {counts[pageTypes['achOutbound']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['achOutbound']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/bulk">
                    <i className="bx bx-money" />
                    <span>{this.props.t("Bulk Payment Files")}</span>
                    {counts[pageTypes['bulk']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['bulk']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/stuckPayments">
                    <i className="bx bx-money" />
                    <span>{this.props.t("Stuck Payments")}</span>
                    {counts[pageTypes['stuckPayments']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['stuckPayments']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/paymentFailure">
                    <i className="bx bx-money" />
                    <span>{this.props.t("Failed Payments")}</span>
                    {counts[pageTypes['paymentFailure']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['paymentFailure']])}</span>)}
                  </Link>
                </li>

                <li>
                  <Link to="/grid/rtMsg">
                    <i className="bx bx-building-house" />
                    <span>{this.props.t("Real Time Message Issues")}</span>
                    {counts[pageTypes['rtMsg']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['rtMsg']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/ssl">
                    <i className="bx bx-building-house" />
                    <span>{this.props.t("SSL Certificates")}</span>
                    {counts[pageTypes['ssl']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['ssl']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/mqHealth">
                    <i className="bx bx-building-house" />
                    <span>{this.props.t("MQ Health")}</span>
                    {counts[pageTypes['mqHealth']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['mqHealth']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/passExp">
                    <i className="bx bx-building-house" />
                    <span>{this.props.t("Password Expiration")}</span>
                    {counts[pageTypes['passExp']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['passExp']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/upConns">
                    <i className="bx bx-building-house" />
                    <span>{this.props.t("Upstream Connections")}</span>
                    {counts[pageTypes['upConns']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['upConns']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/vpnStatus">
                    <i className="bx bx-building-house" />
                    <span>{this.props.t("VPN Status")}</span>
                    {counts[pageTypes['vpnStatus']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['vpnStatus']])}</span>)}
                  </Link>
                </li>
                {/* <li>
                  <Link to="/grid/schedMaint">
                    <i className="bx bx-building-house" />
                    <span>{this.props.t("Scheduled Maintenance")}</span>
                    {counts[pageTypes['schedMaint']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['schedMaint']])}</span>)}
                  </Link>
                </li> */}

                <li>
                  <Link to="/grid/notification">
                    <i className="bx bx-spreadsheet" />
                    <span>{this.props.t("Notifications")}</span>
                    {counts[pageTypes['notification']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['notification']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/grid/job">
                    <i className="bx bx-spreadsheet" />
                    <span>{this.props.t("Job Executions")}</span>
                    {counts[pageTypes['job']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['job']])}</span>)}
                  </Link>
                </li>
                <li>
                  <Link to="/heartbeats">
                    <i className="bx bx-spreadsheet" />
                    <span>{this.props.t("Heartbeats")}</span>
                  </Link>
                </li>
                </>
              }
              {/* <li>
                <Link to="/#" className="has-arrow" aria-expanded="true">
                  <i className="bx bx-home-circle" />
                  <span>{this.props.t("General")}</span>
                </Link>
                <ul className="sub-menu">
                  <li>
                    <Link to="/grid/rtExceptions">
                      {this.props.t("Runtime Exceptions")}
                      {counts[pageTypes['rtExceptions']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['rtExceptions']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/prodIssues">
                      {this.props.t("Production Issues")}
                      {counts[pageTypes['prodIssues']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['prodIssues']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/serverHealth">
                      {this.props.t("Application Health")}
                      {counts[pageTypes['serverHealth']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['serverHealth']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/appProcessHealth">
                      {this.props.t("Website Health")}
                      {counts[pageTypes['appProcessHealth']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['appProcessHealth']])}</span>)}
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/#" className="has-arrow" aria-expanded="true">
                  <i className="bx bx-money" />
                  <span>{this.props.t("Payments")}</span>
                </Link>
                <ul className="sub-menu">
                  <li>
                    <Link to="/grid/achInbound">
                      {this.props.t("ACH Inbound Files")}
                      {counts[pageTypes['achInbound']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['achInbound']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/achOutbound">
                      {this.props.t("ACH Outbound Files")}
                      {counts[pageTypes['achOutbound']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['achOutbound']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/bulk">
                      {this.props.t("Bulk Payment Files")}
                      {counts[pageTypes['bulk']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['bulk']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/stuckPayments">
                      {this.props.t("Stuck Payments")}
                      {counts[pageTypes['stuckPayments']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['stuckPayments']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/paymentFailure">
                      {this.props.t("Failed Payments")}
                      {counts[pageTypes['paymentFailure']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['paymentFailure']])}</span>)}
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/#" className="has-arrow" aria-expanded="true">
                  <i className="bx bx-building-house" />
                  <span>{this.props.t("Infrastructure")}</span>
                </Link>
                <ul className="sub-menu">
                  <li>
                    <Link to="/grid/ssl">
                      {this.props.t("SSL Certificates")}
                      {counts[pageTypes['ssl']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['ssl']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/mqHealth">
                      {this.props.t("MQ Health")}
                      {counts[pageTypes['mqHealth']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['mqHealth']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/passExp">
                      {this.props.t("Password Expiration")}
                      {counts[pageTypes['passExp']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['passExp']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/upConns">
                      {this.props.t("Upstream Connections")}
                      {counts[pageTypes['upConns']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['upConns']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/vpnStatus">
                      {this.props.t("VPN Status")}
                      {counts[pageTypes['vpnStatus']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['vpnStatus']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/schedMaint">
                      {this.props.t("Scheduled Maintenance")}
                      {counts[pageTypes['schedMaint']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['schedMaint']])}</span>)}
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/#" className="has-arrow" aria-expanded="true">
                  <i className="bx bx-spreadsheet" />
                  <span>{this.props.t("Others")}</span>
                </Link>
                <ul className="sub-menu">
                  <li>
                    <Link to="/grid/notification">
                      {this.props.t("Notifications")}
                      {counts[pageTypes['notification']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['notification']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grid/job">
                      {this.props.t("Job Executions")}
                      {counts[pageTypes['job']] && (<span className="badge bg-danger rounded-pill ml-1 mt-0">{limitNumVal(counts[pageTypes['job']])}</span>)}
                    </Link>
                  </li>
                  <li>
                    <Link to="/heartbeats">
                      {this.props.t("Heartbeats")}
                    </Link>
                  </li>
                </ul>
              </li> */}

              {/* <li className="menu-title">{this.props.t("Apps")}</li>

              <li>
                <Link to="/calendar" className="">
                  <i className="bx bx-calendar" />
                  <span>{this.props.t("Calendar")}</span>
                </Link>
              </li>

              <li>
                <Link to="/chat" className="">
                  <i className="bx bx-chat" />
                  <span>{this.props.t("Chat")}</span>
                </Link>
              </li>
              <li>
                <Link to="/apps-filemanager" className="">
                  <i className="bx bx-file" />
                  <span>{this.props.t("File Manager")}</span>
                </Link>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-store" />
                  <span>{this.props.t("Ecommerce")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/ecommerce-products">
                      {this.props.t("Products")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/ecommerce-product-details/1">
                      {this.props.t("Product Details")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/ecommerce-orders">{this.props.t("Orders")}</Link>
                  </li>
                  <li>
                    <Link to="/ecommerce-customers">
                      {this.props.t("Customers")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/ecommerce-cart">{this.props.t("Cart")}</Link>
                  </li>
                  <li>
                    <Link to="/ecommerce-checkout">
                      {this.props.t("Checkout")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/ecommerce-shops">{this.props.t("Shops")}</Link>
                  </li>
                  <li>
                    <Link to="/ecommerce-add-product">
                      {this.props.t("Add Product")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-bitcoin" />
                  <span>{this.props.t("Crypto")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/crypto-wallet">{this.props.t("Wallet")}</Link>
                  </li>
                  <li>
                    <Link to="/crypto-buy-sell">
                      {this.props.t("Buy/Sell")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/crypto-exchange">
                      {this.props.t("Exchange")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/crypto-lending">{this.props.t("Lending")}</Link>
                  </li>
                  <li>
                    <Link to="/crypto-orders">{this.props.t("Orders")}</Link>
                  </li>
                  <li>
                    <Link to="/crypto-kyc-application">
                      {this.props.t("KYC Application")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/crypto-ico-landing">
                      {this.props.t("ICO Landing")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-envelope"></i>
                  <span>{this.props.t("Email")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/email-inbox">{this.props.t("Inbox")}</Link>
                  </li>
                  <li>
                    <Link to="/email-read">{this.props.t("Read Email")} </Link>
                  </li>
                  <li>
                    <Link to="/#" className="has-arrow">
                      <span key="t-email-templates">
                        {this.props.t("Templates")}
                      </span>
                    </Link>
                    <ul className="sub-menu" aria-expanded="false">
                      <li>
                        <Link to="/email-template-basic">
                          {this.props.t("Basic Action")}
                        </Link>
                      </li>
                      <li>
                        <Link to="/email-template-alert">
                          {this.props.t("Alert Email")}{" "}
                        </Link>
                      </li>
                      <li>
                        <Link to="/email-template-billing">
                          {this.props.t("Billing Email")}{" "}
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-receipt" />
                  <span>{this.props.t("Invoices")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/invoices-list">
                      {this.props.t("Invoice List")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/invoices-detail">
                      {this.props.t("Invoice Detail")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-briefcase-alt-2" />
                  <span>{this.props.t("Projects")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/projects-grid">
                      {this.props.t("Projects Grid")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/projects-list">
                      {this.props.t("Projects List")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/projects-overview">
                      {this.props.t("Project Overview")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/projects-create">
                      {this.props.t("Create New")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-task" />
                  <span>{this.props.t("Tasks")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/tasks-list">{this.props.t("Task List")}</Link>
                  </li>
                  <li>
                    <Link to="/tasks-create">
                      {this.props.t("Create Task")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bxs-user-detail" />
                  <span>{this.props.t("Contacts")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/contacts-grid">{this.props.t("User Grid")}</Link>
                  </li>
                  <li>
                    <Link to="/contacts-list">{this.props.t("User List")}</Link>
                  </li>
                  <li>
                    <Link to="/contacts-profile">
                      {this.props.t("Profile")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bxs-detail" />
                  <span>{this.props.t("Blog")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/blog-list">{this.props.t("Blog List")}</Link>
                  </li>
                  <li>
                    <Link to="/blog-grid">{this.props.t("Blog Grid")}</Link>
                  </li>
                  <li>
                    <Link to="/blog-details">
                      {this.props.t("Blog Details")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#">
                  <span className="badge rounded-pill bg-success float-end" key="t-new">New</span>
                  <i className="bx bx-briefcase-alt"></i>
                  <span key="t-jobs">{this.props.t("Jobs")}</span>
                </Link>
                <ul className="sub-menu">
                  <li><Link to="/job-list">{this.props.t("Job List")}</Link></li>
                  <li><Link to="/job-grid">{this.props.t("Job Grid")}</Link></li>
                  <li><Link to="/job-apply">{this.props.t("Apply Job")}</Link></li>
                  <li><Link to="/job-details">{this.props.t("Job Details")}</Link></li>
                  <li><Link to="/job-categories">{this.props.t("Jobs Categories")}</Link></li>
                  <li>
                    <Link to="/#" className="has-arrow">{this.props.t("Candidate")}</Link>
                    <ul className="sub-menu" aria-expanded="true">
                      <li><Link to="/candidate-list">{this.props.t("List")}</Link></li>
                      <li><Link to="/candidate-overview">{this.props.t("Overview")}</Link></li>
                    </ul>
                  </li>
                </ul>
              </li>

              <li className="menu-title">Pages</li>
              <li>
                <Link to="/#" className="has-arrow ">
                  <i className="bx bx-user-circle" />
                  <span>{this.props.t("Authentication")}</span>
                </Link>
                <ul className="sub-menu">
                  <li>
                    <Link to="/pages-login">{this.props.t("Login")}</Link>
                  </li>
                  <li>
                    <Link to="/pages-login-2">{this.props.t("Login 2")}</Link>
                  </li>
                  <li>
                    <Link to="/pages-register">{this.props.t("Register")}</Link>
                  </li>
                  <li>
                    <Link to="/pages-register-2">
                      {this.props.t("Register 2")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/page-recoverpw">
                      {this.props.t("Recover Password")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/pages-recoverpw-2">
                      {this.props.t("Recover Password 2")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth-lock-screen">
                      {this.props.t("Lock Screen")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth-lock-screen-2">
                      {this.props.t("Lock Screen 2")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/page-confirm-mail">
                      {this.props.t("Confirm Mail")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/page-confirm-mail-2">
                      {this.props.t("Confirm Mail 2")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth-email-verification">
                      {this.props.t("Email Verification")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth-email-verification-2">
                      {this.props.t("Email Verification 2")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth-two-step-verification">
                      {this.props.t("Two Step Verification")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth-two-step-verification-2">
                      {this.props.t("Two Step Verification 2")}
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-file" />
                  <span>{this.props.t("Utility")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/pages-starter">
                      {this.props.t("Starter Page")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/pages-maintenance">
                      {this.props.t("Maintenance")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/pages-comingsoon">
                      {this.props.t("Coming Soon")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/pages-timeline">{this.props.t("Timeline")}</Link>
                  </li>
                  <li>
                    <Link to="/pages-faqs">{this.props.t("FAQs")}</Link>
                  </li>
                  <li>
                    <Link to="/pages-pricing">{this.props.t("Pricing")}</Link>
                  </li>
                  <li>
                    <Link to="/pages-404">{this.props.t("Error 404")}</Link>
                  </li>
                  <li>
                    <Link to="/pages-500">{this.props.t("Error 500")}</Link>
                  </li>
                </ul>
              </li>

              <li className="menu-title">{this.props.t("Components")}</li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-tone" />
                  <span>{this.props.t("UI Elements")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/ui-alerts">{this.props.t("Alerts")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-buttons">{this.props.t("Buttons")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-cards">{this.props.t("Cards")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-carousel">{this.props.t("Carousel")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-dropdowns">{this.props.t("Dropdowns")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-grid">{this.props.t("Grid")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-images">{this.props.t("Images")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-lightbox">{this.props.t("Lightbox")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-modals">{this.props.t("Modals")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-offcanvas">{this.props.t("OffCanvas")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-rangeslider">
                      {this.props.t("Range Slider")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/ui-session-timeout">
                      {this.props.t("Session Timeout")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/ui-progressbars">
                      {this.props.t("Progress Bars")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/ui-placeholders">{this.props.t("Placeholders")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-tabs-accordions">
                      {this.props.t("Tabs & Accordions")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/ui-typography">
                      {this.props.t("Typography")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/ui-toasts">{this.props.t("Toasts")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-video">{this.props.t("Video")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-general">{this.props.t("General")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-colors">{this.props.t("Colors")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-rating">{this.props.t("Rating")}</Link>
                  </li>
                  <li>
                    <Link to="/ui-notifications">
                      {this.props.t("Notifications")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/ui-utilities">
                      <span className="badge rounded-pill bg-success float-end">
                        {this.props.t("New")}
                      </span>
                      {this.props.t("Utilities")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#">
                  <i className="bx bxs-eraser" />
                  <span className="badge rounded-pill bg-danger float-end">
                    10
                  </span>
                  <span>{this.props.t("Forms")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/form-elements">
                      {this.props.t("Form Elements")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/form-layouts">
                      {this.props.t("Form Layouts")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/form-validation">
                      {this.props.t("Form Validation")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/form-advanced">
                      {this.props.t("Form Advanced")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/form-editors">
                      {this.props.t("Form Editors")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/form-uploads">
                      {this.props.t("Form File Upload")}{" "}
                    </Link>
                  </li>
                  <li>
                    <Link to="/form-xeditable">
                      {this.props.t("Form Xeditable")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/form-repeater">
                      {this.props.t("Form Repeater")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/form-wizard">{this.props.t("Form Wizard")}</Link>
                  </li>
                  <li>
                    <Link to="/form-mask">{this.props.t("Form Mask")}</Link>
                  </li>
                  <li>
                    <Link to="/dual-listbox">
                      {this.props.t("Transfer List")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-list-ul" />
                  <span>{this.props.t("Tables")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/tables-basic">
                      {this.props.t("Basic Tables")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/tables-datatable">
                      {this.props.t("Data Tables")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/tables-responsive">
                      {this.props.t("Responsive Table")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/tables-editable">
                      {this.props.t("Editable Table")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/tables-dragndrop">
                      {this.props.t("Drag & Drop Table")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bxs-bar-chart-alt-2" />
                  <span>{this.props.t("Charts")}</span>
                </Link>

                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/apex-charts">{this.props.t("Apex charts")}</Link>
                  </li>
                  <li>
                    <Link to="/e-charts">{this.props.t("E Chart")}</Link>
                  </li>
                  <li>
                    <Link to="/chartjs-charts">
                      {this.props.t("Chartjs Chart")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/chartist-charts">
                      {this.props.t("Chartist Chart")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/charts-knob">{this.props.t("Knob Charts")}</Link>
                  </li>
                  <li>
                    <Link to="/sparkline-charts">
                      {this.props.t("Sparkline Chart")}
                    </Link>
                  </li>

                  <li>
                    <Link to="/re-charts">{this.props.t("Re Chart")}</Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-aperture" />
                  <span>{this.props.t("Icons")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/icons-boxicons">{this.props.t("Boxicons")}</Link>
                  </li>
                  <li>
                    <Link to="/icons-materialdesign">
                      {this.props.t("Material Design")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/icons-dripicons">
                      {this.props.t("Dripicons")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/icons-fontawesome">
                      {this.props.t("Font awesome")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-map" />
                  <span>{this.props.t("Maps")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="false">
                  <li>
                    <Link to="/maps-google">{this.props.t("Google Maps")}</Link>
                  </li>
                  <li>
                    <Link to="/maps-vector">{this.props.t("Vector Maps")}</Link>
                  </li>
                  <li>
                    <Link to="/maps-leaflet">
                      {this.props.t("Leaflet Maps")}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-share-alt" />
                  <span>{this.props.t("Multi Level")}</span>
                </Link>
                <ul className="sub-menu" aria-expanded="true">
                  <li>
                    <Link to="#">{this.props.t("Level 1.1")}</Link>
                  </li>
                  <li>
                    <Link to="#" className="has-arrow">
                      {this.props.t("Level 1.2")}
                    </Link>
                    <ul className="sub-menu" aria-expanded="true">
                      <li>
                        <Link to="#">{this.props.t("Level 2.1")}</Link>
                      </li>
                      <li>
                        <Link to="#">{this.props.t("Level 2.2")}</Link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li> */}
            </ul>
          </div>
        </SimpleBar>
      </React.Fragment>
    );
  }
}

SidebarMenuContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
  type: PropTypes.string,
};

const mapStateToProps = (state) => ({
  counts: state.lists.counts,
  userid: state.session.userid
});

const mapDispatchToProps = (dispatch) => ({
  saveList: (list) => {dispatch(saveList(list))},
});

export default withRouter(withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SidebarMenuContent)));