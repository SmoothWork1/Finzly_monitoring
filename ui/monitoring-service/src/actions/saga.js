import { takeEvery, put } from "redux-saga/effects";

import { LOGIN_SAGA, LOGOUT_SAGA } from "./types";
import { login, logout } from "./session";

function* loginSaga(user) {
	yield put(login(user));
}

function* logoutSaga() {
	yield put(logout());
}

function* authSaga() {
  yield takeEvery(LOGIN_SAGA, loginSaga)
  yield takeEvery(LOGOUT_SAGA, logoutSaga)
}

export default authSaga
