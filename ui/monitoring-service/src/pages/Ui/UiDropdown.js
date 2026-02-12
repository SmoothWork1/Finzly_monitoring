import React, { Component } from "react"
import {
  Button,
  ButtonDropdown,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
  Form,
  Label,
  Input
} from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb"

class UiDropdown extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    //meta title
    document.title = "Dropdowns | Skote - React Admin & Dashboard Template";
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid={true}>
            <Breadcrumbs title="UI Elements" breadcrumbItem="Dropdowns" />

            <Row>
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">Single button dropdowns</CardTitle>
                    <p className="card-title-desc">
                      Any single <code className="highlighter-rouge">.btn</code>{" "}
                      can be turned into a dropdown toggle with some markup
                      changes. Here’s how you can put them to work with either{" "}
                      <code className="highlighter-rouge">&lt;button&gt;</code>{" "}
                      elements:
                    </p>
                    <Row>
                      <Col sm={6}>
                        <Dropdown
                          isOpen={this.state.singlebtn}
                          toggle={() =>
                            this.setState({ singlebtn: !this.state.singlebtn })
                          }
                        >
                          <DropdownToggle className="btn btn-secondary" caret>
                            Dropdown button{" "}
                            <i className="mdi mdi-chevron-down"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem>Action</DropdownItem>
                            <DropdownItem>Another action</DropdownItem>
                            <DropdownItem>Something else here</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </Col>
                      <Col sm={6}>
                        <Dropdown
                          isOpen={this.state.singlebtn1}
                          toggle={() =>
                            this.setState({
                              singlebtn1: !this.state.singlebtn1,
                            })
                          }
                          className="mt-4 mt-sm-0"
                        >
                          <DropdownToggle className="btn btn-secondary" caret>
                            Dropdown Link{" "}
                            <i className="mdi mdi-chevron-down"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem>Action</DropdownItem>
                            <DropdownItem>Another action</DropdownItem>
                            <DropdownItem>Something else here</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>

              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">Variant</CardTitle>
                    <p className="card-title-desc">
                      The best part is you can do this with any button variant,
                      too:
                    </p>

                    <div className="d-flex gap-2 flex-wrap">
                      <Dropdown
                        isOpen={this.state.btnprimary1}
                        toggle={() =>
                          this.setState({
                            btnprimary1: !this.state.btnprimary1,
                          })
                        }
                      >
                        <DropdownToggle
                          tag="button"
                          className="btn btn-primary"
                        >
                          Primary <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem>Action</DropdownItem>
                          <DropdownItem>Another action</DropdownItem>
                          <DropdownItem>Something else here</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>{" "}
                      <Dropdown
                        isOpen={this.state.btnsecondary1}
                        toggle={() =>
                          this.setState({
                            btnsecondary1: !this.state.btnsecondary1,
                          })
                        }
                      >
                        <DropdownToggle
                          tag="button"
                          className="btn btn-secondary"
                        >
                          Secondary <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem>Action</DropdownItem>
                          <DropdownItem>Another action</DropdownItem>
                          <DropdownItem>Something else here</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>{" "}
                      <Dropdown
                        isOpen={this.state.btnsuccess1}
                        toggle={() =>
                          this.setState({
                            btnsuccess1: !this.state.btnsuccess1,
                          })
                        }
                      >
                        <DropdownToggle
                          tag="button"
                          className="btn btn-success"
                        >
                          Success <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem>Action</DropdownItem>
                          <DropdownItem>Another action</DropdownItem>
                          <DropdownItem>Something else here</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <Dropdown
                        isOpen={this.state.btnInfo1}
                        toggle={() =>
                          this.setState({ btnInfo1: !this.state.btnInfo1 })
                        }
                      >
                        <DropdownToggle tag="button" className="btn btn-info">
                          Info <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem>Action</DropdownItem>
                          <DropdownItem>Another action</DropdownItem>
                          <DropdownItem>Something else here</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <Dropdown
                        isOpen={this.state.btnWarning1}
                        toggle={() =>
                          this.setState({
                            btnWarning1: !this.state.btnWarning1,
                          })
                        }
                      >
                        <DropdownToggle
                          tag="button"
                          className="btn btn-warning"
                        >
                          Warning <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem>Action</DropdownItem>
                          <DropdownItem>Another action</DropdownItem>
                          <DropdownItem>Something else here</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <Dropdown
                        isOpen={this.state.btnDanger1}
                        toggle={() =>
                          this.setState({ btnDanger1: !this.state.btnDanger1 })
                        }
                      >
                        <DropdownToggle tag="button" className="btn btn-danger">
                          Danger <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem>Action</DropdownItem>
                          <DropdownItem>Another action</DropdownItem>
                          <DropdownItem>Something else here</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">Split button dropdowns</CardTitle>
                    <p className="card-title-desc">
                      The best part is you can do this with any button variant,
                      too:
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      <div className="btn-group mb-2">
                        <ButtonDropdown
                          isOpen={this.state.drp_primary1}
                          toggle={() =>
                            this.setState({
                              drp_primary1: !this.state.drp_primary1,
                            })
                          }
                        >
                          <Button id="caret" color="primary">Primary</Button>
                          <DropdownToggle caret color="primary" className="dropdown-toggle-split"><i className="mdi mdi-chevron-down"></i></DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem header>Header</DropdownItem>
                            <DropdownItem disabled>Action</DropdownItem>
                            <DropdownItem>Another Action</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem>Another Action</DropdownItem>
                          </DropdownMenu>
                        </ButtonDropdown>
                      </div>
                      <div className="btn-group mb-2">
                        <ButtonDropdown
                          isOpen={this.state.drp_secondary1}
                          toggle={() =>
                            this.setState({
                              drp_secondary1: !this.state.drp_secondary1,
                            })
                          }
                        >
                          <Button id="caret" color="secondary">
                            Secondary
                          </Button>
                          <DropdownToggle caret color="secondary" className="dropdown-toggle-split">
                            <i className="mdi mdi-chevron-down"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem header>Header</DropdownItem>
                            <DropdownItem disabled>Action</DropdownItem>
                            <DropdownItem>Another Action</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem>Another Action</DropdownItem>
                          </DropdownMenu>
                        </ButtonDropdown>
                      </div>
                      <div className="btn-group mb-2">
                        <ButtonDropdown
                          isOpen={this.state.drp_success1}
                          toggle={() =>
                            this.setState({
                              drp_success1: !this.state.drp_success1,
                            })
                          }
                        >
                          <Button id="caret" color="success">
                            Success
                          </Button>
                          <DropdownToggle caret color="success" className="dropdown-toggle-split">
                            <i className="mdi mdi-chevron-down"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem header>Header</DropdownItem>
                            <DropdownItem disabled>Action</DropdownItem>
                            <DropdownItem>Another Action</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem>Another Action</DropdownItem>
                          </DropdownMenu>
                        </ButtonDropdown>
                      </div>
                      <div className="btn-group mb-2">
                        <ButtonDropdown
                          isOpen={this.state.drp_info1}
                          toggle={() =>
                            this.setState({ drp_info1: !this.state.drp_info1 })
                          }
                        >
                          <Button id="caret" color="info">
                            Info
                          </Button>
                          <DropdownToggle caret color="info" className="dropdown-toggle-split">
                            <i className="mdi mdi-chevron-down"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem header>Header</DropdownItem>
                            <DropdownItem disabled>Action</DropdownItem>
                            <DropdownItem>Another Action</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem>Another Action</DropdownItem>
                          </DropdownMenu>
                        </ButtonDropdown>
                      </div>
                      <div className="btn-group mb-2">
                        <ButtonDropdown
                          isOpen={this.state.drp_warning1}
                          toggle={() =>
                            this.setState({
                              drp_warning1: !this.state.drp_warning1,
                            })
                          }
                        >
                          <Button id="caret" color="warning">
                            Warning
                          </Button>
                          <DropdownToggle caret color="warning" className="dropdown-toggle-split">
                            <i className="mdi mdi-chevron-down"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem header>Header</DropdownItem>
                            <DropdownItem disabled>Action</DropdownItem>
                            <DropdownItem>Another Action</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem>Another Action</DropdownItem>
                          </DropdownMenu>
                        </ButtonDropdown>
                      </div>
                      <div className="btn-group mb-2">
                        <ButtonDropdown
                          isOpen={this.state.drp_danger1}
                          toggle={() =>
                            this.setState({
                              drp_danger1: !this.state.drp_danger1,
                            })
                          }
                        >
                          <Button id="caret" color="danger">
                            Danger
                          </Button>
                          <DropdownToggle caret color="danger" className="dropdown-toggle-split">
                            <i className="mdi mdi-chevron-down"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem header>Header</DropdownItem>
                            <DropdownItem disabled>Action</DropdownItem>
                            <DropdownItem>Another Action</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem>Another Action</DropdownItem>
                          </DropdownMenu>
                        </ButtonDropdown>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">Sizing</CardTitle>
                    <p className="card-title-desc mb-3">
                      Button dropdowns work with buttons of all sizes, including
                      default and split dropdown buttons.
                    </p>
                    <div className="btn-group me-1 mt-2">
                      <ButtonDropdown
                        isOpen={this.state.drp_secondary}
                        toggle={() =>
                          this.setState({
                            drp_secondary: !this.state.drp_secondary,
                          })
                        }
                      >
                        <DropdownToggle
                          caret
                          color="primary"
                          className="btn-lg"
                        >
                          Large button{" "}
                          <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem disabled>Action</DropdownItem>
                          <DropdownItem>Another Action</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Another Action</DropdownItem>
                        </DropdownMenu>
                      </ButtonDropdown>
                    </div>{" "}
                    <div className="btn-group me-1 mt-2">
                      <Button color="secondary" className="btn btn-secondary btn-lg">
                        Large button
                      </Button>
                      <ButtonDropdown
                        isOpen={this.state.drp_secondary_lg}
                        toggle={() =>
                          this.setState({
                            drp_secondary_lg: !this.state.drp_secondary_lg,
                          })
                        }
                      >
                        <DropdownToggle
                          caret
                          color="secondary"
                          className="btn btn-secondary btn-lg"
                        >
                          <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem disabled>Action</DropdownItem>
                          <DropdownItem>Another Action</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Another Action</DropdownItem>
                        </DropdownMenu>
                      </ButtonDropdown>
                    </div>{" "}
                    <div className="btn-group me-1 mt-2">
                      <ButtonDropdown
                        isOpen={this.state.drp_secondary_sm}
                        toggle={() =>
                          this.setState({
                            drp_secondary_sm: !this.state.drp_secondary_sm,
                          })
                        }
                      >
                        <DropdownToggle
                          caret
                          color="info"
                          className="btn btn-info btn-sm"
                        >Small button
                          <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem disabled>Action</DropdownItem>
                          <DropdownItem>Another Action</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Another Action</DropdownItem>
                        </DropdownMenu>
                      </ButtonDropdown>
                    </div>{" "}
                    <div className="btn-group me-1 mt-2">
                      <ButtonDropdown
                        isOpen={this.state.drp_secondary_sm1}
                        toggle={() =>
                          this.setState({
                            drp_secondary_sm1: !this.state.drp_secondary_sm1,
                          })
                        }
                      >
                        <Button className="btn btn-secondary btn-sm">
                          Small button
                        </Button>
                        <DropdownToggle
                          caret
                          color="secondary"
                          className="btn btn-secondary btn-sm"
                        >
                          <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem disabled>Action</DropdownItem>
                          <DropdownItem>Another Action</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Another Action</DropdownItem>
                        </DropdownMenu>
                      </ButtonDropdown>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="card-title">Menu Content</CardTitle>
                    <p className="card-title-desc">Example of dropdown menu Headers, Text, Forms content</p>

                    <div className="d-flex flex-wrap gap-2">
                      <UncontrolledDropdown
                      >
                        <DropdownToggle color="primary" type="button">
                          Header <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <div className="dropdown-header noti-title">
                            <h5 className="font-size-13 text-muted text-truncate mn-0">Welcome Jessie!</h5>
                          </div>
                          <DropdownItem href="#">Action</DropdownItem>
                          <DropdownItem href="#">Another action</DropdownItem>
                          <DropdownItem href="#">Something else here</DropdownItem>
                          <div className="dropdown-divider"></div>
                          <DropdownItem href="#">Separated link</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>

                      <UncontrolledDropdown>
                        <DropdownToggle type="button" className="btn btn-success">
                          Text <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-md p-3">
                          <p>
                            Some example text that&apos;s free-flowing within the dropdown menu.
                          </p>
                          <p className="mb-0">
                            And this is more example text.
                          </p>
                        </DropdownMenu>
                      </UncontrolledDropdown>

                      <UncontrolledDropdown>
                        <DropdownToggle type="button" className="btn btn-light">
                          Forms <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-md p-4">
                          <Form>
                            <div className="mb-2">
                              <Label className="form-label" htmlFor="exampleDropdownFormEmail">Email address</Label>
                              <Input type="email" className="form-control" id="exampleDropdownFormEmail" placeholder="email@example.com" />
                            </div>
                            <div className="mb-2">
                              <Label className="form-label" htmlFor="exampleDropdownFormPassword">Password</Label>
                              <Input type="password" className="form-control" id="exampleDropdownFormPassword" placeholder="Password" />
                            </div>
                            <div className="mb-2">
                              <div className="form-check custom-checkbox">
                                <Input type="checkbox" className="form-check-input" id="rememberdropdownCheck" />
                                <Label className="form-check-label" htmlFor="rememberdropdownCheck">Remember me</Label>
                              </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Sign in</button>
                          </Form>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle>Dropdown Menu Dark</CardTitle>
                    <p className="card-title-desc">Opt into darker dropdowns to match a dark navbar or custom style by adding <code>.dropdown-menu-dark</code> onto an existing <code>.dropdown-menu</code>. No changes are required to the dropdown items.</p>

                    <UncontrolledDropdown>
                      <DropdownToggle type="button" className="btn btn-secondary">
                        Menu is right-aligned <i className="mdi mdi-chevron-down"></i>
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-dark">
                        <DropdownItem href="#">Action</DropdownItem>
                        <DropdownItem href="#">Another action</DropdownItem>
                        <DropdownItem href="#">Something else here</DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle>Menu Alignment</CardTitle>
                    <p className="card-title-desc">
                      Add{" "}
                      <code className="highlighter-rouge">
                        .dropdown-menu-end
                      </code>{" "}
                      to a{" "}
                      <code className="highlighter-rouge">.dropdown-menu</code> to
                      right align the dropdown menu.
                    </p>
                    <div className="d-flex flex-wrap gap-3">
                      <UncontrolledDropdown>
                        <DropdownToggle type="button" className="btn btn-secondary">
                          Right-aligned menu example  <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-end">
                          <DropdownItem href="#">Action</DropdownItem>
                          <DropdownItem href="#">Another action</DropdownItem>
                          <DropdownItem href="#">Something else here</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>

                      <UncontrolledDropdown>
                        <DropdownToggle type="button" className="btn btn-secondary">
                          Left-aligned but right aligned when large screen <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-lg-end">
                          <DropdownItem href="#">Action</DropdownItem>
                          <DropdownItem href="#">Another action</DropdownItem>
                          <DropdownItem href="#">Something else here</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>


                      <UncontrolledDropdown>
                        <DropdownToggle type="button" className="btn btn-secondary">
                          Right-aligned but left aligned when large screen <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu-lg-start">
                          <DropdownItem href="#">Action</DropdownItem>
                          <DropdownItem href="#">Another action</DropdownItem>
                          <DropdownItem href="#">Something else Header</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col xl={6}>
                <Card>
                  <CardBody>

                    <CardTitle className="card-title">Auto Close Behavior</CardTitle>
                    <p className="card-title-desc">By default, the dropdown menu is closed when clicking inside or outside the dropdown menu. You can use the <code>autoClose</code> option to change this behavior of the dropdown.</p>

                    <div className="d-flex gap-2 flex-wrap">
                      <UncontrolledDropdown>
                        <DropdownToggle className="btn btn-secondary" type="button" id="defaultDropdown">
                          Default dropdown <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem href="#">Menu item</DropdownItem>
                          <DropdownItem href="#">Menu item</DropdownItem>
                          <DropdownItem href="#">Menu item</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>

                      <UncontrolledDropdown>
                        <DropdownToggle className="btn btn-secondary" type="button" id="dropdownMenuClickableOutside">
                          Clickable outside <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem href="#">Menu item</DropdownItem>
                          <DropdownItem href="#">Menu item</DropdownItem>
                          <DropdownItem href="#">Menu item</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>

                      <UncontrolledDropdown>
                        <DropdownToggle className="btn btn-secondary" type="button" id="dropdownMenuClickableInside">
                          Clickable inside <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem href="#">Menu item</DropdownItem>
                          <DropdownItem href="#">Menu item</DropdownItem>
                          <DropdownItem href="#">Menu item</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>

                      <UncontrolledDropdown>
                        <DropdownToggle className="btn btn-secondary" type="button" id="dropdownMenuClickable" data-bs-toggle="dropdown" data-bs-auto-close="false" aria-expanded="false">
                          Manual close <i className="mdi mdi-chevron-down"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem href="#">Menu item</DropdownItem>
                          <DropdownItem href="#">Menu item</DropdownItem>
                          <DropdownItem href="#">Menu item</DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </div>

                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">Dropup variation</CardTitle>
                    <p className="card-title-desc">
                      Trigger dropdown menus above elements by adding{" "}
                      <code className="highlighter-rouge">.dropup</code> to the
                      parent element.
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      <Dropdown
                        isOpen={this.state.dropup1}
                        direction="up"
                        toggle={() =>
                          this.setState({ dropup1: !this.state.dropup1 })
                        }
                      >
                        <DropdownToggle className="btn btn-info">
                          Dropup <i className="mdi mdi-chevron-up"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem>Action</DropdownItem>
                          <DropdownItem>Another action</DropdownItem>
                          <DropdownItem>Something else here</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <ButtonDropdown
                        direction="up"
                        isOpen={this.state.drp_up11}
                        toggle={() =>
                          this.setState({
                            drp_up11: !this.state.drp_up11,
                          })
                        }
                      >
                        <Button id="caret" color="info">
                          Split dropup
                        </Button>
                        <DropdownToggle caret color="info">
                          <i className="mdi mdi-chevron-up"></i>
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem header>Header</DropdownItem>
                          <DropdownItem disabled>Action</DropdownItem>
                          <DropdownItem>Another Action</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Another Action</DropdownItem>
                        </DropdownMenu>
                      </ButtonDropdown>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">Dropleft variation</CardTitle>
                    <p className="card-title-desc">
                      Trigger dropdown menus at the right of the elements by
                      adding <code>.dropstart</code> to the parent element.
                    </p>

                    <div className="d-flex gap-2 flex-wrap">
                      <Dropdown
                        isOpen={this.state.info_dropup111}
                        direction="left"
                        className="btn-group dropstart"
                        toggle={() =>
                          this.setState({
                            info_dropup111: !this.state.info_dropup111,
                          })
                        }
                      >
                        <DropdownToggle className="btn btn-info">
                          <i className="mdi mdi-chevron-left"></i> Dropleft
                        </DropdownToggle>
                        <DropdownMenu data-popper-placement="left-start">
                          <DropdownItem header>Header</DropdownItem>
                          <DropdownItem disabled>Action</DropdownItem>
                          <DropdownItem>Another Action</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Another Action</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <ButtonDropdown
                        direction="left"
                        className="btn-group dropstart"
                        isOpen={this.state.infodrp_up1111}
                        toggle={() =>
                          this.setState({
                            infodrp_up1111: !this.state.infodrp_up1111,
                          })
                        }
                      >
                        <DropdownToggle caret color="info">
                          <i className="mdi mdi-chevron-left"></i>
                        </DropdownToggle>
                        <Button id="caret" color="info">
                          Split dropstart
                        </Button>
                        <DropdownMenu data-popper-placement="left-start">
                          <DropdownItem header>Header</DropdownItem>
                          <DropdownItem disabled>Action</DropdownItem>
                          <DropdownItem>Another Action</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Another Action</DropdownItem>
                        </DropdownMenu>
                      </ButtonDropdown>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">Dropright variation</CardTitle>
                    <p className="card-title-desc">
                      Trigger dropdown menus at the right of the elements by
                      adding <code>.dropend</code> to the parent element.
                    </p>

                    <div className="d-flex gap-2 flex-wrap">
                      <Dropdown
                        isOpen={this.state.info_dropup1}
                        direction="right"
                        className="btn-group dropend"
                        toggle={() =>
                          this.setState({
                            info_dropup1: !this.state.info_dropup1,
                          })
                        }
                      >
                        <DropdownToggle className="btn btn-info" caret>
                          Dropright <i className="mdi mdi-chevron-right"></i>
                        </DropdownToggle>
                        <DropdownMenu data-popper-placement="right-start">
                          <DropdownItem>Action</DropdownItem>
                          <DropdownItem>Another action</DropdownItem>
                          <DropdownItem>Something else here</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <ButtonDropdown
                        direction="right"
                        className="btn-group dropend"
                        isOpen={this.state.infodrp_up11}
                        toggle={() =>
                          this.setState({
                            infodrp_up11: !this.state.infodrp_up11,
                          })
                        }
                      >
                        <Button id="caret" color="info">
                          Split dropend
                        </Button>
                        <DropdownToggle caret color="info">
                          <i className="mdi mdi-chevron-right"></i>
                        </DropdownToggle>
                        <DropdownMenu data-popper-placement="right-start">
                          <DropdownItem header>Header</DropdownItem>
                          <DropdownItem disabled>Action</DropdownItem>
                          <DropdownItem>Another Action</DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem>Another Action</DropdownItem>
                        </DropdownMenu>
                      </ButtonDropdown>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    )
  }
}

export default UiDropdown
