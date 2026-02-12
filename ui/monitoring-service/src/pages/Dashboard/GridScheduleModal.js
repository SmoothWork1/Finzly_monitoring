import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Col,
  Label
} from "reactstrap";
import { Field, Form, Formik } from "formik";
import { updFunctionScheduleReq } from "config/httpRoutes";
import { alertError, alertSuccess } from "config/toast";

class GridScheduleModal extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	
	getInitSched = () => {
		const { schedule } = this.props;
		if(!Array.isArray(schedule)) {
			return;
		}
		let sched = {};
		for(let i = 0; i <= schedule.length; ++i) {
			if(i === schedule.length) {
				return sched;
			} else {
				sched[schedule[i].function] = schedule[i].schedule;
			}
		}
	}
	
	getSubmitSched = (values) => {
		const { schedule } = this.props;
		let sched = [];
		for(let i = 0; i <= schedule.length; ++i) {
			if(i === schedule.length) {
				return sched;
			} else {
				sched.push({
					schedulerName: schedule[i].schedName,
					functionName: schedule[i].function,
					expression: values[schedule[i].function]
				});
			}
		}
	}
	updateSchedule = (values) => {
		// values === { functionName: expressino }
		const final = this.getSubmitSched(values);
		for(let i = 0; i < final.length; ++i) {
			const { schedulerName, expression, functionName } = final[i];
			// console.log({ schedulerName, expression, functionName });
			updFunctionScheduleReq({schedulerName, expression})
			.then( (res) => {
				this.props.toggle && this.props.toggle();
				alertSuccess(`${functionName} schedule updated`);
			}).catch( (err) => {
				alertError(err.response?.data?.message || `Could not update ${functionName} schedule`);
			});
		}
	}

  render() {
	const { schedule } = this.props;
	const { getInitSched, updateSchedule } = this;
    return (
      <React.Fragment>
        <Modal
			isOpen={this.props.isOpen}
			role="dialog"
			autoFocus={true}
			centered={true}
			className="exampleModal w-50"
			tabIndex="-1"
			toggle={() => {this.props.toggle()}}
		>
			<ModalHeader toggle={() => {this.props.toggle()}} tag="h4">
				Function Schedules
			</ModalHeader>
			<ModalBody>
			<Formik
				enableReinitialize={true}
				initialValues={getInitSched()}
				onSubmit={values => {
					// this.props.toggle(values);
					updateSchedule(values);
				}}
			>
				{({ errors, status, touched }) => (
				<Form>
					<Row>
					{Array.isArray(schedule) && schedule.length > 0 ?
						schedule.map( (sched, i) =>
							<Col key={`sched${i}`} className="col-12">
								<div className="mb-3">
									<Label for={sched.function} className="form-label">
										{sched.function} Schedule
									</Label>
									<Field
										name={sched.function}
										placeholder="Enter Function Schedule"
										type="text"
										className="form-control"
									/>
								</div>
							</Col>
						)
					:
						<></>
					}
					</Row>
					<Row>
					<Col>
						<div className="text-end">
						<button
							type="submit"
							className="btn btn-primary save-user"
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
      </React.Fragment>
    );
  }
}

GridScheduleModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  schedule: PropTypes.any
};

export default GridScheduleModal;
