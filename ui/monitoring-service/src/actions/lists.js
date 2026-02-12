import { SAVE_LIST, UNSHIFT_LIST, INCREASE_COUNT } from './types';

export const saveList = (data) => ({
	type: SAVE_LIST,
	data
});

export const increaseCount = (data) => ({
	type: INCREASE_COUNT,
	data
});

export const unshiftList = (data, key) => ({
	type: UNSHIFT_LIST,
	data,
	key
});