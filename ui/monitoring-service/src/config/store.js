import { createStore } from 'redux';
import rootReducer from '../reducers';

const persistedState = localStorage.getItem('Z0~_`s(A:ls#$^!&2;.c') ? JSON.parse(localStorage.getItem('Z0~_`s(A:ls#$^!&2;.c')) : {};

const store = createStore(rootReducer, persistedState);
store.subscribe(() => {
	localStorage.setItem('Z0~_`s(A:ls#$^!&2;.c', JSON.stringify(store.getState()));
});

export default store;