import { combineReducers } from 'redux';
import session from "./session";
import common from "./common";
import lists from "./lists";
import Layout from "./layout";

export default combineReducers({
	session,
	common,
	lists,
	Layout
});