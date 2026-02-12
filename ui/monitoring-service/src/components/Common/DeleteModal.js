import React, { Component } from "react";
import PropTypes from "prop-types";
import { Col, Modal, ModalBody, Row } from "reactstrap";

class DeleteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <React.Fragment>
        <Modal size="sm" isOpen={this.props.show} toggle={this.props.onCloseClick} centered={true}>
          <div className="modal-content">
            <ModalBody className="px-4 py-5 text-center">
              <button type="button" onClick={this.props.onDeleteClick} className="btn-close position-absolute end-0 top-0 m-3"></button>
              <div className="avatar-sm mb-4 mx-auto">
                <div className="avatar-title bg-primary text-primary bg-opacity-10 font-size-20 rounded-3">
                  <i className="mdi mdi-trash-can-outline"></i>
                </div>
              </div>
              <p className="text-muted font-size-16 mb-4">Are you sure you want to permanently erase the job.</p>

              <div className="hstack gap-2 justify-content-center mb-0">
                <button type="button" className="btn btn-danger" onClick={this.props.onDeleteClick}>Delete Now</button>
                <button type="button" className="btn btn-secondary" onClick={this.props.onCloseClick}>Close</button>
              </div>
            </ModalBody>
          </div>
        </Modal>

      </React.Fragment>
    );
  }
}

DeleteModal.propTypes = {
  onCloseClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  show: PropTypes.any,
};

export default DeleteModal;
