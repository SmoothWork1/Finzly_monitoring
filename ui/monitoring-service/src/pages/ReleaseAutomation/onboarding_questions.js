import React from 'react';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { /* getApplicationsReq, */ getOnboardingQuestionsReq, rmOnboardingQuestionReq } from 'config/httpRARoutes';
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import OnboardingQuestionsModal from './onboardingQuestionsModal.js';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import { generalize, shortenString } from 'config/helpers.js';
import { unpaginatedTableSize } from 'config/globals.js';
import { alertError } from 'config/toast.js';
import OnboardingQuestionsFilterModal from './onboardingQuestionsFilterModal.js';

const getOnboardingQuestionsColumns = (page) => [
	{
		dataField: "ques_key",
		text: "Question Key",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.ques_key)}QuestionKey`}>{shortenString(row.ques_key, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.ques_key)}QuestionKey`}>
				{row.ques_key}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "question",
		text: "Question",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.ques_key)}Question`}>{shortenString(row.question, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.ques_key)}Question`}>
				{row.question}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "value",
		text: "Value",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.ques_key)}Value`}>{shortenString(row.value, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.ques_key)}Value`}>
				{row.value}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "value_type",
		text: "Value Type",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.ques_key)}ValueType`}>{shortenString(row.value_type, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.ques_key)}ValueType`}>
				{row.value_type}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "product",
		text: "Product",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.ques_key)}Product`}>{shortenString(row.product, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.ques_key)}Product`}>
				{row.product}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "application",
		text: "Application",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.ques_key)}Application`}>{shortenString(row.application, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.ques_key)}Application`}>
				{row.application}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "status",
		text: "Status",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.ques_key)}OnboardingQuestionStatus`}>{shortenString(row.status, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.ques_key)}OnboardingQuestionStatus`}>
				{row.status}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "view",
		isDummyField: true,
		text: "Actions",
		sort: false,
		formatter: (cellContent, row, i) => {
			return (
				<Row className="mb-2" style={{marginTop: '0rem', marginRight: '0rem'}}>
					<Col sm="12">
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleOnboardingQuestionModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeOnboardingQuestion(row.ques_key)}} />
					</Col>
				</Row>
			);
		},
	}
]

class RAOnboardingQuestions extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			onboarding_questions: [],
			onboarding_question: {},
			onboarding_question_modal: false,
			onboardingQuestionsColumns: getOnboardingQuestionsColumns(this),

			ques_key: '',
			question: '',
			product: '',
			application: '',
			status: '',
			filtermodal: false,

			applications: null
		}
	}

	componentDidMount() { 
		this.getOnboardingQuestions();
		// this.getPreReqs();
	}

	// getPreReqs = async () => {
	// 	try {
	// 		const applications = (await getApplicationsReq()).applications;
	// 		this.setState({applications});
	// 	} catch(err) {
	// 		alertError("Could not fetch required data");
	// 	}
	// }

	getOnboardingQuestions = (filter) => {
		this.props.changePreloader(true);
		const { ques_key, question, product, application, status } = this.state;
		getOnboardingQuestionsReq(
			filter || {
				ques_key, question, product, application, status
			}
		)
		.then( (res) => {
			this.setState({onboarding_questions: [...res.onboarding_questions], applications: [...res.applications]});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch onboarding questions");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	toggleOnboardingQuestionModal = (onboarding_question) => {
		if(onboarding_question?.refresh) {this.getOnboardingQuestions();}
		this.setState(prevState => ({
			onboarding_question_modal: !prevState.onboarding_question_modal, onboarding_question
		}));
	}

	removeOnboardingQuestion = (ques_key) => {
		rmOnboardingQuestionReq(ques_key)
		.then( (res) => {
			this.getOnboardingQuestions();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove onboarding question");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	toggleFilterModal = (values) => {
		if(!values) {
		  this.setState(prevState => ({
			filtermodal: !prevState.filtermodal
		  }));
		  return;
		}
		const { ques_key, question, product, application, status } = values;
		this.getOnboardingQuestions({ ques_key, question, product, application, status });
		this.setState({ques_key, question, product, application, status, filtermodal: false});
	}

	render() {
		document.title = "Release Automation Onboarding Questions";
		const {
			onboarding_questions, onboarding_question, onboarding_question_modal, onboardingQuestionsColumns, applications,
			ques_key, question, product, application, status, filtermodal
		} = this.state;
		return (
			<React.Fragment>
				<OnboardingQuestionsModal
					close={this.toggleOnboardingQuestionModal}
					isOpen={onboarding_question_modal}
					onboarding_question={onboarding_question}
					applications={applications}
				/>
				<OnboardingQuestionsFilterModal
					isOpen={filtermodal}
					toggle={this.toggleFilterModal}
					filter={{ques_key, question, product, application, status}}
					applications={applications}
				/>
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								Onboarding Questions
							</CardTitle>
							<div>
								<i className="mdi mdi-filter cursor-pointer mr-2" style={{fontSize: 20}} onClick={() => {this.toggleFilterModal()}} />
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleOnboardingQuestionModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getOnboardingQuestions()}} />
							</div>
						</div>
						{Array.isArray(onboarding_questions) && onboarding_questions.length > 0 && onboarding_questions[0].ques_key &&
							<PaginationProvider
								pagination={paginationFactory({
									// sizePerPage: onboarding_questions.length,
									sizePerPage: unpaginatedTableSize,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={onboardingQuestionsColumns}
								data={onboarding_questions}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="id"
									data={onboarding_questions}
									columns={onboardingQuestionsColumns}
									bootstrap4
									search
								>
									{toolkitProps => (
									<React.Fragment>
										<div className="table-responsive">
										<BootstrapTable
											{...toolkitProps.baseProps}
											{...paginationTableProps}
											responsive
											defaultSorted={[{ dataField: 'datetime', order: 'desc' }]}
											bordered={false}
											striped={false}
											classes={
												"table align-middle table-nowrap table-check"
											}
											headerWrapperClasses={"table-light"}
										/>
										</div>
										<div className="pagination pagination-rounded justify-content-end"></div>
									</React.Fragment>
									)}
								</ToolkitProvider>
								)}
							</PaginationProvider>
						}
					</CardBody>
				</Card>
			</React.Fragment>
		);
	}
}

RAOnboardingQuestions.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RAOnboardingQuestions));