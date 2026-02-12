import React, { Component } from "react";
import { FaAngleDown } from "react-icons/fa";

class Dropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
        };
    }

    toggleDropdown = () => {
        this.setState(prevState => ({
            isOpen: !prevState.isOpen,
        }));
    };

    handleSelect = option => {
        const { onSelect, setSelectedOption } = this.props;
        setSelectedOption(option);
        onSelect(option);
        this.setState({ isOpen: false }); // Close the dropdown after selecting an option
    };

    render() {
        const { options, selectedOption } = this.props;
        const { isOpen } = this.state;

        return (
            <div className="uptime-dropdown">
                <div
                    className="uptime-dropdown-toggle"
                    onClick={this.toggleDropdown}
                >
                    {selectedOption}
                    <FaAngleDown />
                </div>
                {isOpen && (
                    <div className="uptime-dropdown-menu">
                        {options.map((option, index) => (
                            <div
                                key={index}
                                className="uptime-dropdown-item"
                                onClick={() => this.handleSelect(option?.resource)}
                            >
                                {option?.resource}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

export default Dropdown;
