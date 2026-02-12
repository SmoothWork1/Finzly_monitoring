import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { isEmpty, size } from "lodash";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
    PaginationProvider,
    PaginationListStandalone,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';

import { Link } from "react-router-dom";

//Date Picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
    Card,
    CardBody,
    Col,
    Container,
    Row,
    Modal,
    ModalHeader,
    ModalBody,
    Label,
    UncontrolledTooltip,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownItem,
    DropdownMenu
} from "reactstrap";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

//Import Breadcrumb
import Breadcrumbs from "components/Common/Breadcrumb";
import {
    getJobList,
    addNewJobList,
    updateJobList,
    deleteJobList,
} from "store/actions";

import DeleteModal from "../../../components/Common/DeleteModal";

class JobList extends Component {
    constructor(props) {
        super(props);
        this.node = React.createRef();
        this.state = {
            jobs: [],
            job: "",
            viewmodal: false,
            modal: false,
            isOpen: false,
            selectDate: false,
            deleteModal: false,
            JobListColumns: [
                {
                    dataField: "jobId",
                    text: "No",
                    sort: true,
                    formatter: (cellContent, row) => (
                        <Link to="#" className="text-body fw-bold">
                            {row.jobId}
                        </Link>
                    ),
                },
                {
                    dataField: "jobTitle",
                    text: "Job Title",
                    sort: true,
                },
                {
                    dataField: "companyName",
                    text: "Company Name",
                    sort: true,
                },
                {
                    dataField: "location",
                    text: "Location",
                    sort: true,
                },
                {
                    dataField: "experience",
                    text: "Experience",
                    sort: true,
                },
                {
                    dataField: "position",
                    text: "Position",
                    sort: true,
                },
                {
                    dataField: "type",
                    text: "Type",
                    sort: true,
                    formatter: (cellContent, row) => (
                        <span className={"badge badge-soft-" + (row.typeBadgeColor || "success")}>
                            {row.type}
                        </span>
                    ),
                }, {
                    dataField: "postedDate",
                    text: "Posted Date",
                    sort: true,
                },
                {
                    dataField: "lastDate",
                    text: "Last Date",
                    sort: true,
                },
                {
                    dataField: "status",
                    text: "Status",
                    sort: true,
                    formatter: (cellContent, row) => (
                        <span className={"badge bg-" + (row.statusBadgeColor || "success")}>
                            {row.status}
                        </span>
                    ),
                },
                {
                    dataField: "action",
                    isDummyField: true,
                    text: "Action",
                    formatter: (cellContent, job) => (
                        <>
                            <ul className="list-unstyled hstack gap-1 mb-0">
                                <li data-bs-toggle="tooltip" data-bs-placement="top" title="View">
                                    <Link to="/job-details" className="btn btn-sm btn-soft-primary">
                                        <i className="mdi mdi-eye-outline" id="viewtooltip"></i></Link>
                                </li>
                                <UncontrolledTooltip placement="top" target="viewtooltip">
                                    View
                                </UncontrolledTooltip>

                                <li>
                                    <Link
                                        to="#"
                                        className="btn btn-sm btn-soft-info"
                                        onClick={() => this.handleJobClick(job)}
                                    >
                                        <i className="mdi mdi-pencil-outline" id="edittooltip" />
                                        <UncontrolledTooltip placement="top" target="edittooltip">
                                            Edit
                                        </UncontrolledTooltip>
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to="#"
                                        className="btn btn-sm btn-soft-danger"
                                        onClick={() => this.onClickDelete(job)}
                                    >
                                        <i className="mdi mdi-delete-outline" id="deletetooltip" />
                                        <UncontrolledTooltip placement="top" target="deletetooltip">
                                            Delete
                                        </UncontrolledTooltip>
                                    </Link>
                                </li>
                            </ul>
                        </>
                    ),
                },
            ],
        };
        this.handleJobClick = this.handleJobClick.bind(this);
        this.toggle = this.toggle.bind(this);
        this.handleJobClicks = this.handleJobClicks.bind(this);
        this.onClickDelete = this.onClickDelete.bind(this);
        this.toggleDate = this.toggleDate.bind(this),
            this.dateChange.bind(this);
    }

    componentDidMount() {
        const { jobs, onGetJobList } = this.props;
        if (jobs && !jobs.length) {
            onGetJobList();
        }
        this.setState({ jobs });
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal,
        }));
    }

    handleJobClicks = () => {
        this.setState({ job: "", isEdit: false });
        this.toggle();
    };

    // eslint-disable-next-line no-unused-vars
    componentDidUpdate(prevProps, prevState, snapshot) {
        const { jobs } = this.props;
        if (!isEmpty(jobs) && size(prevProps.jobs) !== size(jobs)) {
            this.setState({ jobs: {}, isEdit: false });
        }
    }

    onPaginationPageChange = page => {
        if (
            this.node &&
            this.node.current &&
            this.node.current.props &&
            this.node.current.props.pagination &&
            this.node.current.props.pagination.options
        ) {
            this.node.current.props.pagination.options.onPageChange(page);
        }
    };


    togglemodal = () => {
        this.setState(prevState => ({
            modal: !prevState.modal,
        }))
    }

    toggleDate = () => {
        this.setState(prevState => ({
            isOpen: !prevState.isOpen,
        }))
    }
    dateChange = date => {
        this.setState({
            selectDate: date,
        });
    };

    /* Insert,Update Delete data */

    toggleDeleteModal = () => {
        this.setState(prevState => ({
            deleteModal: !prevState.deleteModal,
        }));
    };

    onClickDelete = jobs => {
        this.setState({ jobs: jobs });
        this.setState({ deleteModal: true });
    };

    handleDeletejob = () => {
        const { onDeleteJobList } = this.props;
        const { jobs } = this.state;
        if (jobs.id !== undefined) {
            onDeleteJobList(jobs);
            this.setState({ deleteModal: false });
        }
    };

    handleJobClick = arg => {
        const job = arg;

        this.setState({
            job: {
                id: job.id,
                jobId: job.jobId,
                jobTitle: job.jobTitle,
                companyName: job.companyName,
                location: job.location,
                experience: job.experience,
                position: job.position,
                type: job.type,
                status: job.status,
            },
            isEdit: true,
        });

        this.toggle();
    };



    render() {


        //meta title
        document.title = "Jobs List | Skote - React Admin & Dashboard Template";


        const { SearchBar } = Search;

        const { jobs } = this.props;

        const { isEdit, deleteModal } = this.state;

        const { onAddNewJobList, onUpdateJobList } = this.props;
        const job = this.state.job;

        const pageOptions = {
            sizePerPage: 10,
            totalSize: jobs.length, // replace later with size(jobs),
            custom: true,
        };

        const defaultSorted = [
            {
                dataField: "jobId", // if dataField is not match to any column you defined, it will be ignored.
                order: "desc", // desc or asc
            },
        ];

        return (
            <React.Fragment>
                <DeleteModal
                    show={deleteModal}
                    onDeleteClick={this.handleDeletejob}
                    onCloseClick={() => this.setState({ deleteModal: false })}
                />

                <div className="page-content">
                    <Container fluid>
                        <Breadcrumbs title="Jobs" breadcrumbItem="Jobs Lists" />
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody className="border-bottom">
                                        <div className="d-flex align-items-center">
                                            <h5 className="mb-0 card-title flex-grow-1">Jobs Lists</h5>
                                            <div className="flex-shrink-0">
                                                <Link to="#!" onClick={this.handleJobClicks} className="btn btn-primary me-1">Add New Job</Link>
                                                <Link to="#!" className="btn btn-light me-1"><i className="mdi mdi-refresh"></i></Link>
                                                <UncontrolledDropdown className="dropdown d-inline-block me-1">
                                                    <DropdownToggle type="menu" className="btn btn-success" id="dropdownMenuButton1">
                                                        <i className="mdi mdi-dots-vertical"></i></DropdownToggle>
                                                    <DropdownMenu>
                                                        <li><DropdownItem href="#">Action</DropdownItem></li>
                                                        <li><DropdownItem href="#">Another action</DropdownItem></li>
                                                        <li><DropdownItem href="#">Something else here</DropdownItem></li>
                                                    </DropdownMenu>
                                                </UncontrolledDropdown>
                                            </div>
                                        </div>
                                    </CardBody>
                                    <CardBody>
                                        <PaginationProvider
                                            pagination={paginationFactory(pageOptions)}
                                            keyField="id"
                                            columns={this.state.JobListColumns}
                                            data={jobs}
                                        >
                                            {({ paginationProps, paginationTableProps }) => (
                                                <ToolkitProvider
                                                    keyField="id"
                                                    data={jobs}
                                                    columns={this.state.JobListColumns}
                                                    search
                                                >
                                                    {toolkitProps => (
                                                        <React.Fragment>
                                                            <CardBody className="border-bottom px-0 pt-0">
                                                                <Row className="g-2">
                                                                    {/* <Row className="mb-2"> */}
                                                                    <Col xxl="4" lg="6">
                                                                        <div className="search-box d-inline-block">
                                                                            <div className="position-relative">
                                                                                <SearchBar
                                                                                    {...toolkitProps.searchProps}
                                                                                />
                                                                                <i className="bx bx-search-alt search-icon" />
                                                                            </div>
                                                                        </div>
                                                                    </Col>
                                                                    {/* </Row> */}
                                                                    <Col xxl={2} lg={6}>
                                                                        <select className="form-control select2">
                                                                            <option>Status</option>
                                                                            <option value="Active">Active</option>
                                                                            <option value="New">New</option>
                                                                            <option value="Close">Close</option>
                                                                        </select>
                                                                    </Col>
                                                                    <Col xxl={2} lg={4}>
                                                                        <select className="form-control select2">
                                                                            <option>Select Type</option>
                                                                            <option value="1">Full Time</option>
                                                                            <option value="2">Part Time</option>
                                                                        </select>
                                                                    </Col>
                                                                    <Col xxl={2} lg={4}>
                                                                        <div id="datepicker1">
                                                                            <DatePicker
                                                                                className="form-control"
                                                                                selected={this.state.selectDate}
                                                                                onChange={this.dateChange}
                                                                            />
                                                                        </div>
                                                                    </Col>
                                                                    <Col xxl={2} lg={4}>
                                                                        <button type="button" className="btn btn-soft-secondary w-100">
                                                                            <i className="mdi mdi-filter-outline align-middle"></i> Filter</button>
                                                                    </Col>
                                                                </Row>
                                                            </CardBody>
                                                            <div className="table-responsive">
                                                                <BootstrapTable
                                                                    {...toolkitProps.baseProps}
                                                                    {...paginationTableProps}
                                                                    responsive
                                                                    defaultSorted={defaultSorted}
                                                                    bordered={true}
                                                                    striped={false}
                                                                    classes={
                                                                        "table align-middle table-nowrap table-check"
                                                                    }
                                                                    headerWrapperClasses={"table-light"}
                                                                    ref={this.node}
                                                                />
                                                                <Modal
                                                                    isOpen={this.state.modal}
                                                                    className={this.props.className}
                                                                >
                                                                    <ModalHeader toggle={this.toggle} tag="h4">
                                                                        {!!isEdit ? "Edit Job" : "Add Job"}
                                                                    </ModalHeader>
                                                                    <ModalBody>
                                                                        <Formik
                                                                            enableReinitialize={true}
                                                                            initialValues={{
                                                                                jobId: (job && job.jobId) || '',
                                                                                jobTitle: (job && job.jobTitle) || '',
                                                                                companyName: (job && job.companyName) || '',
                                                                                location: (job && job.location) || '',
                                                                                experience: (job && job.experience) || '',
                                                                                position: (job && job.position) || '',
                                                                                type: (job && job.type) || '',
                                                                                status: (job && job.status) || '',
                                                                            }}
                                                                            validationSchema={Yup.object().shape({
                                                                                jobId: Yup.string().required("Please Enter Your Job Id"),
                                                                                jobTitle: Yup.string().required("Please Enter Your Job Title"),
                                                                                companyName: Yup.string().required("Please Enter Your Company Name"),
                                                                                location: Yup.string().required("Please Enter Your Location"),
                                                                                experience: Yup.string().required("Please Enter Your Experience"),
                                                                                position: Yup.string().required("Please Enter Your Position"),
                                                                                type: Yup.string().required("Please Enter Your Type"),
                                                                                status: Yup.string().required("Please Enter Your Status"),
                                                                            })}
                                                                            onSubmit={values => {
                                                                                if (isEdit) {
                                                                                    const updateJobList = {
                                                                                        id: job ? job.id : 0,
                                                                                        jobId: values.jobId,
                                                                                        jobTitle: values.jobTitle,
                                                                                        companyName: values.companyName,
                                                                                        location: values.location,
                                                                                        experience: values.experience,
                                                                                        position: values.position,
                                                                                        type: values.type,
                                                                                        postedDate: "02 June 2021",
                                                                                        lastDate: "25 June 2021",
                                                                                        status: values.status,
                                                                                    };
                                                                                    // update Job                                                                                  
                                                                                    onUpdateJobList(updateJobList);
                                                                                } else {
                                                                                    const newJobList = {
                                                                                        id: Math.floor(Math.random() * (30 - 20)) + 20,
                                                                                        jobId: values["jobId"],
                                                                                        jobTitle: values["jobTitle"],
                                                                                        companyName: values["companyName"],
                                                                                        location: values["location"],
                                                                                        experience: values["experience"],
                                                                                        position: values["position"],
                                                                                        type: values["type"],
                                                                                        postedDate: "02 June 2021",
                                                                                        lastDate: "25 June 2021",
                                                                                        status: values["status"],
                                                                                    };
                                                                                    // save new Job                                                                                  
                                                                                    onAddNewJobList(newJobList);
                                                                                }
                                                                                this.setState({
                                                                                    selectedJob: null,
                                                                                });
                                                                                this.toggle();
                                                                            }}
                                                                        >
                                                                            {({ errors, status, touched }) => (
                                                                                <Form>
                                                                                    <Row>
                                                                                        <Col className="col-12">
                                                                                            <div className="mb-3">
                                                                                                <Label className="form-label">
                                                                                                    Job Id
                                                                                                </Label>
                                                                                                <Field
                                                                                                    name="jobId"
                                                                                                    type="text"
                                                                                                    className={
                                                                                                        "form-control" +
                                                                                                        (errors.jobId &&
                                                                                                            touched.jobId
                                                                                                            ? " is-invalid"
                                                                                                            : "")
                                                                                                    }
                                                                                                />
                                                                                                <ErrorMessage
                                                                                                    name="jobId"
                                                                                                    component="div"
                                                                                                    className="invalid-feedback"
                                                                                                />
                                                                                            </div>
                                                                                            <div className="mb-3">
                                                                                                <Label className="form-label">
                                                                                                    Job Title
                                                                                                </Label>
                                                                                                <Field
                                                                                                    name="jobTitle"
                                                                                                    type="text"
                                                                                                    className={
                                                                                                        "form-control" +
                                                                                                        (errors.jobTitle &&
                                                                                                            touched.jobTitle
                                                                                                            ? " is-invalid"
                                                                                                            : "")
                                                                                                    }
                                                                                                />
                                                                                                <ErrorMessage
                                                                                                    name="jobTitle"
                                                                                                    component="div"
                                                                                                    className="invalid-feedback"
                                                                                                />
                                                                                            </div>
                                                                                            <div className="mb-3">
                                                                                                <Label className="form-label">
                                                                                                    Company Name
                                                                                                </Label>
                                                                                                <Field
                                                                                                    name="companyName"
                                                                                                    type="text"
                                                                                                    className={
                                                                                                        "form-control" +
                                                                                                        (errors.companyName &&
                                                                                                            touched.companyName
                                                                                                            ? " is-invalid"
                                                                                                            : "")
                                                                                                    }
                                                                                                />
                                                                                                <ErrorMessage
                                                                                                    name="companyName"
                                                                                                    component="div"
                                                                                                    className="invalid-feedback"
                                                                                                />
                                                                                            </div>
                                                                                            <div className="mb-3">
                                                                                                <Label className="form-label">
                                                                                                    Location
                                                                                                </Label>
                                                                                                <Field
                                                                                                    name="location"
                                                                                                    type="text"
                                                                                                    className={
                                                                                                        "form-control" +
                                                                                                        (errors.location &&
                                                                                                            touched.location
                                                                                                            ? " is-invalid"
                                                                                                            : "")
                                                                                                    }
                                                                                                />
                                                                                                <ErrorMessage
                                                                                                    name="location"
                                                                                                    component="div"
                                                                                                    className="invalid-feedback"
                                                                                                />
                                                                                            </div>
                                                                                            <div className="mb-3">
                                                                                                <Label className="form-label">
                                                                                                    Experience
                                                                                                </Label>
                                                                                                <Field
                                                                                                    name="experience"
                                                                                                    type="text"
                                                                                                    className={
                                                                                                        "form-control" +
                                                                                                        (errors.experience &&
                                                                                                            touched.experience
                                                                                                            ? " is-invalid"
                                                                                                            : "")
                                                                                                    }
                                                                                                />
                                                                                                <ErrorMessage
                                                                                                    name="experience"
                                                                                                    component="div"
                                                                                                    className="invalid-feedback"
                                                                                                />
                                                                                            </div>
                                                                                            <div className="mb-3">
                                                                                                <Label className="form-label">
                                                                                                    Position
                                                                                                </Label>
                                                                                                <Field
                                                                                                    name="position"
                                                                                                    type="text"
                                                                                                    className={
                                                                                                        "form-control" +
                                                                                                        (errors.position &&
                                                                                                            touched.position
                                                                                                            ? " is-invalid"
                                                                                                            : "")
                                                                                                    }
                                                                                                />
                                                                                                <ErrorMessage
                                                                                                    name="position"
                                                                                                    component="div"
                                                                                                    className="invalid-feedback"
                                                                                                />

                                                                                            </div>
                                                                                            <div className="mb-3">
                                                                                                <Label className="form-label">
                                                                                                    Type
                                                                                                </Label>
                                                                                                <Field
                                                                                                    name="type"
                                                                                                    as="select"
                                                                                                    className={
                                                                                                        "form-control" +
                                                                                                        (errors.type &&
                                                                                                            touched.type
                                                                                                            ? " is-invalid"
                                                                                                            : "")
                                                                                                    }
                                                                                                >
                                                                                                    <option>Full Time</option>
                                                                                                    <option>Part Time</option>
                                                                                                    <option>Freelance</option>
                                                                                                    <option>Internship</option>
                                                                                                </Field>
                                                                                            </div>
                                                                                            <div className="mb-3">
                                                                                                <Label className="form-label">
                                                                                                    Status
                                                                                                </Label>
                                                                                                <Field
                                                                                                    name="status"
                                                                                                    as="select"
                                                                                                    className={
                                                                                                        "form-control" +
                                                                                                        (errors.status &&
                                                                                                            touched.status
                                                                                                            ? " is-invalid"
                                                                                                            : "")
                                                                                                    }
                                                                                                >
                                                                                                    <option>Active</option>
                                                                                                    <option>New</option>
                                                                                                    <option>Close</option>
                                                                                                </Field>
                                                                                            </div>
                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <Col>
                                                                                            <div className="text-end">
                                                                                                <button
                                                                                                    type="submit"
                                                                                                    className="btn btn-success save-user"
                                                                                                >
                                                                                                    Save
                                                                                                </button>
                                                                                            </div>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Form>
                                                                            )}
                                                                        </Formik>
                                                                    </ModalBody>
                                                                </Modal>
                                                            </div>
                                                            <div className="pagination pagination-rounded justify-content-end mb-2">
                                                                <PaginationListStandalone
                                                                    {...paginationProps}
                                                                />
                                                            </div>
                                                        </React.Fragment>
                                                    )}
                                                </ToolkitProvider>
                                            )}
                                        </PaginationProvider>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </React.Fragment>
        );
    }
}

JobList.propTypes = {
    jobs: PropTypes.array,
    className: PropTypes.any,
    onGetJobList: PropTypes.func,
    onAddNewJobList: PropTypes.func,
    onDeleteJobList: PropTypes.func,
    onUpdateJobList: PropTypes.func,
};

const mapStateToProps = ({ jobsLists }) => ({
    jobs: jobsLists.jobs,
});

const mapDispatchToProps = dispatch => ({
    onGetJobList: () => dispatch(getJobList()),
    onAddNewJobList: job => dispatch(addNewJobList(job)),
    onUpdateJobList: job => dispatch(updateJobList(job)),
    onDeleteJobList: job => dispatch(deleteJobList(job)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(JobList));
