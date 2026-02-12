import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

//import Images
import avatar2 from "../../../assets/images/users/avatar-2.jpg";
import avatar4 from "../../../assets/images/users/avatar-4.jpg";
import avatar5 from "../../../assets/images/users/avatar-5.jpg";

class Reviews extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <React.Fragment>
        <div className="mt-5">
          <h5>Reviews :</h5>

          <div className="d-flex py-3 border-bottom">
            <div className="flex-shrink-0 me-3">
              <img src={avatar2} className="avatar-xs rounded-circle" alt="img" />
            </div>

            <div className="flex-grow-1">
              <h5 className="mb-1 font-size-15">Brian</h5>
              <p className="text-muted">If several languages coalesce, the grammar of the resulting language.</p>
              <ul className="list-inline float-sm-end mb-sm-0">
                <li className="list-inline-item">
                  <Link to="#"><i className="far fa-thumbs-up me-1"></i> Like</Link>
                </li>
                <li className="list-inline-item">
                  <Link to="#"><i className="far fa-comment-dots me-1"></i> Comment</Link>
                </li>
              </ul>
              <div className="text-muted font-size-12"><i className="far fa-calendar-alt text-primary me-1"></i> 5 hrs ago</div>
            </div>
          </div>
          <div className="d-flex py-3 border-bottom">
            <div className="flex-shrink-0 me-3">
              <img src={avatar4} className="avatar-xs rounded-circle" alt="img" />
            </div>

            <div className="flex-grow-1">
              <h5 className="font-size-15 mb-1">Denver</h5>
              <p className="text-muted">To an English person, it will seem like simplified English, as a skeptical Cambridge</p>
              <ul className="list-inline float-sm-end mb-sm-0">
                <li className="list-inline-item">
                  <Link to="#"><i className="far fa-thumbs-up me-1"></i> Like</Link>
                </li>
                <li className="list-inline-item">
                  <Link to="#"><i className="far fa-comment-dots me-1"></i> Comment</Link>
                </li>
              </ul>
              <div className="text-muted font-size-12"><i className="far fa-calendar-alt text-primary me-1"></i> 07 Oct, 2019</div>
              <div className="d-flex mt-4">
                <div className="flex-shrink-0 me-2">
                  <img src={avatar5} className="avatar-xs me-3 rounded-circle" alt="img" />
                </div>

                <div className="flex-grow-1">
                  <h5 className="mb-1 font-size-15">Henry</h5>
                  <p className="text-muted">Their separate existence is a myth. For science, music, sport, etc.</p>
                  <ul className="list-inline float-sm-end mb-sm-0">
                    <li className="list-inline-item">
                      <Link to="#"><i className="far fa-thumbs-up me-1"></i> Like</Link>
                    </li>
                    <li className="list-inline-item">
                      <Link to="#"><i className="far fa-comment-dots me-1"></i> Comment</Link>
                    </li>
                  </ul>
                  <div className="text-muted font-size-12"><i className="far fa-calendar-alt text-primary me-1"></i> 08 Oct, 2019</div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex py-3 border-bottom">
            <div className="flex-shrink-0 me-3">
              <div className="avatar-xs">
                <span className="avatar-title bg-primary bg-soft text-primary rounded-circle font-size-16">
                  N
                </span>
              </div>
            </div>

            <div className="flex-grow-1">
              <h5 className="mb-1 font-size-15">Neal</h5>
              <p className="text-muted">Everyone realizes why a new common language would be desirable.</p>
              <ul className="list-inline float-sm-end mb-sm-0">
                <li className="list-inline-item">
                  <Link to="#"><i className="far fa-thumbs-up me-1"></i> Like</Link>
                </li>
                <li className="list-inline-item">
                  <Link to="#"><i className="far fa-comment-dots me-1"></i> Comment</Link>
                </li>
              </ul>
              <div className="text-muted font-size-12"><i className="far fa-calendar-alt text-primary me-1"></i> 05 Oct, 2019</div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Reviews.propTypes = {
  comments: PropTypes.array,
};

export default Reviews;
