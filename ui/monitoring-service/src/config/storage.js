export const saveToken = (token) => {
	localStorage.setItem('^4L$eX3#', token);
}

export const getToken = () => {
	return localStorage.getItem('^4L$eX3#');
}

export const removeToken = () => {
	localStorage.removeItem('^4L$eX3#');
}

export const isLoggedIn = () => {
	return Boolean(localStorage.getItem('^4L$eX3#'));
}

export const saveId = (token) => {
	localStorage.setItem('uid', token);
}

export const getId = () => {
	return localStorage.getItem('uid');
}

export const removeId = () => {
	localStorage.removeItem('uid');
}