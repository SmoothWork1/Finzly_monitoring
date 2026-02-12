import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";

import rootReducer from "./reducers";
import rootSaga from "./sagas";

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const persistedState = localStorage.getItem('Z0~_`s(A:ls#$^!&2;.c') ? JSON.parse(localStorage.getItem('Z0~_`s(A:ls#$^!&2;.c')) : {};
const store = createStore(
  rootReducer,
  persistedState,
  composeEnhancers(applyMiddleware(sagaMiddleware)),
);
store.subscribe(() => {
	localStorage.setItem('Z0~_`s(A:ls#$^!&2;.c', JSON.stringify(store.getState()));
});
sagaMiddleware.run(rootSaga);

export default store;
