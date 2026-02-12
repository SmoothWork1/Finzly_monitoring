import React from "react";
import PropTypes from 'prop-types';
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

const AppRoute = ({
	component: Component,
	layout: Layout,
	isAuthProtected,
	...rest
}) => {
	const userid = useSelector((state) => state.session.userid);
	return (
		<Route
			{...rest}
			render={props => {
				if(isAuthProtected && !userid) {
					return (
						<Redirect to={{ pathname: "/login", state: { from: props.location } }} />
					)
				}
				if(userid && !isAuthProtected) {
					return (
						<Redirect to={{ pathname: "/dashboard", state: { from: props.location } }} />
					)
				}

				return (
					<Layout>
						<Component {...props} />
					</Layout>
				)
			}}
		/>
	);
}

AppRoute.propTypes = {
	isAuthProtected: PropTypes.bool,
	component: PropTypes.any,
	location: PropTypes.object,
	layout: PropTypes.any
}
export default AppRoute;