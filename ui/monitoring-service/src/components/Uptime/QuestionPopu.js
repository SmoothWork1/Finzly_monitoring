import React, { Component } from "react";

class QuestionPopup extends Component {
    render() {
        const { name, description } = this.props;

        return (
            <div className="question-popup-container">
                <div className="question-popup-content">
                    <span className="question-popup-name">{name}</span>
                    <span>{description}</span>
                </div>
                <div className="question-popup-arrow"></div>
            </div>
        );
    }
}

export default QuestionPopup;