import { toast, Slide } from 'react-toastify';
// Slide, Zoom, Flip, Bounce
import 'react-toastify/dist/ReactToastify.min.css';
// import 'react-toastify/dist/ReactToastify.css';

const options = {
	autoClose: 2000,
	position: "top-right",
	pauseOnFocusLoss: false,
	closeButton: false,
	// closeButton: null,
	transition: Slide,
	draggable: true,
	draggablePercent: 20,
	pauseOnHover: false,
	newestOnTop: true,
	hideProgressBar: true,
	// onClose: (customAttributes) => {}
}

var activeToasts = [];

export const alertSuccess = (message) => {
	if(activeToasts.length > 2) {
		toast.dismiss(activeToasts[0]);
		activeToasts.shift();
	}
	activeToasts.push(toast.success(message, options));
}

export const alertError = (message) => {
	if(activeToasts.length > 2) {
		toast.dismiss(activeToasts[0]);
		activeToasts.shift();
	}
	activeToasts.push(toast.error(message, options));
}

export const alertWarn = (message) => {
	if(activeToasts.length > 2) {
		toast.dismiss(activeToasts[0]);
		activeToasts.shift();
	}
	activeToasts.push(toast.warn(message, options));
}

export const alertInfo = (message) => {
	if(activeToasts.length > 2) {
		toast.dismiss(activeToasts[0]);
		activeToasts.shift();
	}
	activeToasts.push(toast.info(message, options));
}

// toast.onChange((numberOfToastsDisplayed) => {
// 	console.log(numberOfToastsDisplayed);
// });

// toast.useLazyContainer(false);