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
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';

import { Link } from "react-router-dom";

import {
    Card,
    CardBody,
    Col,
    Container,
    Row,
    UncontrolledTooltip
} from "reactstrap";

import {
    getApplyJob,
    deleteApplyJob,
} from "store/jobs/actions";

//Import Breadcrumb
import Breadcrumbs from "components/Common/Breadcrumb";

import DeleteModal from "../../../components/Common/DeleteModal";

class ApplyJobs extends Component {
    constructor(props) {
        super(props);
        this.node = React.createRef();
        this.state = {
            viewmodal: false,
            modal: false,
            jobApply: [],
            deleteModal: false,
            ApplyJobsColumns: [
                {
                    text: "No",
                    dataField: "no",
                    sort: true,
                    formatter: (cellContent, row) => (
                        <Link to="#" className="text-body fw-bold">
                            {row.no}
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
                    dataField: "type",
                    text: "Type",
                    sort: true,
                    formatter: (cellContent, row) => (
                        <span className={"badge badge-soft-" + row.typeBadgeColor}>
                            {row.type}
                        </span>
                    ),
                },
                {
                    dataField: "applyDate",
                    text: "Apply Date",
                    sort: true,
                },
                {
                    dataField: "status",
                    text: "Status",
                    sort: true,
                    formatter: (cellContent, row) => (
                        <span className={"badge bg-" + row.statusBadgeColor}>
                            {row.status}
                        </span>
                    ),
                },
                {
                    dataField: "action",
                    isDummyField: true,
                    text: "Action",
                    formatter: (cellContent, jobApply) => (
                        <>
                            <div className="list-unstyled hstack gap-1 mb-0">
                                <li>
                                    <Link
                                        to="/job-details"
                                        className="btn btn-sm btn-soft-primary"
                                    >
                                        <i className="mdi mdi-eye-outline" id="viewtooltip" />
                                        <UncontrolledTooltip placement="top" target="viewtooltip">
                                            View
                                        </UncontrolledTooltip>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="#"
                                        className="btn btn-sm btn-soft-danger"
                                        onClick={() => this.onClickDelete(jobApply)}
                                    >
                                        <i className="mdi mdi-delete-outline" id="deletetooltip" />
                                        <UncontrolledTooltip placement="top" target="deletetooltip">
                                            Delete
                                        </UncontrolledTooltip>
                                    </Link>
                                </li>
                            </div>
                        </>
                    ),
                },
            ],
        };
        this.onClickDelete = this.onClickDelete.bind(this);
    }

    componentDidMount() {
        const { jobApply, OnGetApplyJob } = this.props;
        if (jobApply && !jobApply.length) {
            OnGetApplyJob();
        }
        this.setState({ jobApply });
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal,
        }));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { jobApply } = this.props;
        if (!isEmpty(jobApply) && size(prevProps.jobApply) !== size(jobApply)) {
            this.setState({ jobApply: {}, isEdit: false });
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


    toggleDeleteModal = () => {
        this.setState(prevState => ({
            deleteModal: !prevState.deleteModal,
        }));
    };

    onClickDelete = jobApply => {
        this.setState({ jobApply: jobApply });
        this.setState({ deleteModal: true });
    };

    handleDeleteApplyJob = () => {
        const { OnDeleteApplyJob } = this.props;
        const { jobApply } = this.state;
        if (jobApply.id !== undefined) {
            OnDeleteApplyJob(jobApply);
            this.setState({ deleteModal: false });
        }
    };


    render() {

        //meta title
        document.title = "Job Apply | Skote - React Admin & Dashboard Template";

        const { jobApply } = this.props;
        const { deleteModal } = this.state;

        //pagination customization
        const pageOptions = {
            sizePerPage: 10,
            totalSize: jobApply.length, // replace later with size(Apply Job),
            custom: true,
        };
        const defaultSorted = [
            {
                dataField: "id", // if dataField is not match to any column you defined, it will be ignored.
                order: "desc", // desc or asc
            },
        ];
        return (
            <React.Fragment>
                <DeleteModal
                    show={deleteModal}
                    onDeleteClick={this.handleDeleteApplyJob}
                    onCloseClick={() => this.setState({ deleteModal: false })}
                />
                <div className="page-content">
                    <Container fluid>
                        <Breadcrumbs title="Jobs" breadcrumbItem="Job Apply" />
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <div className="card-body border-bottom">
                                            <div className="d-flex align-items-center">
                                                <h5 className="mb-0 card-title flex-grow-1">Applied Jobs</h5>
                                                <div className="flex-shrink-0">
                                                    <select className="form-select" aria-label="Default select example">
                                                        <option value="Today" defaultValue>Today</option>
                                                        <option value="1 Monthly" >1 Month</option>
                                                        <option value="6 Month">6 Month</option>
                                                        <option value="1 Years">1 Year</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <PaginationProvider
                                            pagination={paginationFactory(pageOptions || [])}
                                            keyField="id"
                                            columns={this.state.ApplyJobsColumns || []}
                                            data={jobApply || []}
                                        >
                                            {({ paginationProps, paginationTableProps }) => (
                                                <ToolkitProvider
                                                    keyField="id"
                                                    data={jobApply}
                                                    columns={this.state.ApplyJobsColumns || []}

                                                >
                                                    {toolkitProps => (
                                                        <React.Fragment>
                                                            <div className="table-responsive">
                                                                <BootstrapTable
                                                                    {...toolkitProps.baseProps}
                                                                    {...paginationTableProps}
                                                                    responsive
                                                                    defaultSorted={defaultSorted}
                                                                    bordered={true}
                                                                    classes={
                                                                        "table align-middle table-nowrap table-check"
                                                                    }
                                                                    headerWrapperClasses={"table-light"}
                                                                    ref={this.node}
                                                                />
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

ApplyJobs.propTypes = {
    jobApply: PropTypes.array,
    OnGetApplyJob: PropTypes.func,
    OnDeleteApplyJob: PropTypes.func,
    className: PropTypes.any,
};

const mapStateToProps = state => ({
    jobApply: state.jobsLists.jobApply,
});

const mapDispatchToProps = dispatch => ({
    OnGetApplyJob: () => dispatch(getApplyJob()),
    OnDeleteApplyJob: order => dispatch(deleteApplyJob(order)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(ApplyJobs));
