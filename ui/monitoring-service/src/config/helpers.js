import { msPerDay, msPerHour, msPerMinute } from "./globals";
import moment from "moment";

export const getDurationTimeString = (ts) => {
	const dt = new Date(ts);
	let hours = dt.getHours();
	hours = hours < 10 ? `0${hours}` : hours;
	let minutes = dt.getMinutes();
	minutes = minutes < 10 ? `0${minutes}` : minutes;
	return `${hours} hours ${minutes} minutes`;
};

export const get24hTimeString = (ts) => {
	const dt = new Date(ts);
	let hours = dt.getHours();
	hours = hours < 10 ? `0${hours}` : hours;
	let minutes = dt.getMinutes();
	minutes = minutes < 10 ? `0${minutes}` : minutes;
	return `${hours}:${minutes}`;
};

export const getFormattedDate = (dt) => {
	if(!dt) {return '';}
	if(!(dt instanceof Date)) {
		dt = new Date(dt);
		if(!dt || isNaN(dt)) {
			return;
		}
	}
	let day = dt.getDate();
	day = day < 10 ? '0'+day : day;
	let month = dt.getMonth()+1;
	month = month < 10 ? '0'+month : month;
	const year = dt.getFullYear();
	return day+'/'+month+'/'+year;
};

export const getFieldFormattedDate = (dt) => {
	if(!dt) {return '';}
	if(!(dt instanceof Date)) {
		dt = new Date(dt);
		if(!dt || isNaN(dt)) {
			return;
		}
	}
	let day = dt.getDate();
	day = day < 10 ? '0'+day : day;
	let month = dt.getMonth()+1;
	month = month < 10 ? '0'+month : month;
	const year = dt.getFullYear();
	return year+'-'+month+'-'+day;
};

export const getCleanedDateTime = (iso) => {
	if(!iso) {return '';}
	if(typeof iso !== 'string') {
		return '';
	}
	const [date, time] = iso.split('T');
	const [year, month, day] = date.split('-');
	const [hours, minutes, seconds, millis] = time.split(':');
	const EDT = new Date(year, month-1, day, hours, minutes);
	// EDT.setHours(EDT.getHours()-5);
	
	let day2 = EDT.getDate();
	day2 = day2 < 10 ? '0'+day2 : day2;
	let month2 = EDT.getMonth()+1;
	month2 = month2 < 10 ? '0'+month2 : month2;
	let hours2 = EDT.getHours();
	hours2 = hours2 < 10 ? '0'+hours2 : hours2;
	let minutes2 = EDT.getMinutes();
	minutes2 = minutes2 < 10 ? '0'+minutes2 : minutes2;
	
	return `${month2}/${day2}/${EDT.getFullYear()}, ${hours2}:${minutes2}`;
	// return `${month}/${day}/${year}, ${hours}:${minutes}`;
};

const convertDateToUTC = (dtStr) => {
	const date = new Date(dtStr);
	const userTimezoneOffset = date.getTimezoneOffset() * 60000;
	return (new Date(date. getTime() - userTimezoneOffset));
};

export const getTimeDifferenceFromNow = (dt) => {
	if(!dt) {return '';}
	if(!(dt instanceof Date)) {
		return '';
	}
	const now = new Date();
	const nowUTC = convertDateToUTC(now.toUTCString());
	const dtUTC = convertDateToUTC(dt.toUTCString());
	const days = Math.floor((nowUTC - dtUTC) / msPerDay);
	if(days) {
		return `${days} days ago`;
	}
	const hours = Math.floor((nowUTC - dtUTC) / msPerHour);
	if(hours) {
		return `${hours} hours ago`;
	}
	const minutes = Math.floor((nowUTC - dtUTC) / msPerMinute);
	return `${minutes} min ago`;
};

export const compareDateWithoutTime = (dt, td) => {
	if(!(dt instanceof Date) || !(td instanceof Date)) {
		return '';
	}
	const tdDay = Math.floor(td.getTime() / msPerDay);
	const dtDay = Math.floor(dt.getTime() / msPerDay);
	return tdDay === dtDay;
};

export const convertDateToFieldString = (dt) => {
	if(!(dt instanceof Date)) {
		return '';
	}
	let month = dt.getMonth()+1;
	month = month < 10 ? `0${month}` : month;
	let date = dt.getDate();
	date = date < 10 ? `0${date}` : date;
	return `${dt.getFullYear()}-${month}-${date}`;
};

export const generalize = (str) => {
	return str.replace(/\W/g, "1");
};

export const shortenString = (str, MAX_LENGTH) => {
	// const MAX_LENGTH = 25;
	if(str?.toString) {
		str = str.toString();
	}
	if(typeof str === 'string') {
		const extension = str.length > MAX_LENGTH ? "..." : "";
		str = str.replace(/\<\/?\w*\>/g, "");
		return `${str.slice(0, MAX_LENGTH)}${extension}`;
	}
	return ""; // str may not be an acceptable value for UI
};

export const limitNumVal = (num, MAX_VAL) => {
	if(typeof num === 'string') {
		num = parseInt(num);
	}
	if(num > MAX_VAL) {
		return `${MAX_VAL}+`;
	}
	return num;
};

export const safelyParseJSONObj = (str) => {
	try {
		return JSON.parse(str);
	} catch(e) {
		return {};
	}
};

export const convertJSONtoQParams = (obj) => {
	const u = new URLSearchParams(obj).toString();
	return u;
};

export const getPagesArray = (page, pages) => {
	if(pages <= 5) {
		let arr = [];
		for(let i = 1; i <= pages+1; ++i) {
			if(i === pages+1) {
				return arr;
			} else {
				arr.push(i);
			}
		}
	} else if(pages > 5) {
		if(page < 4) {
			return [1,2,3,4,5];
		}
		if(pages - page === 1) {
			return [page-3, page-2, page-1, page, page+1];
		}
		if(pages - page === 0) {
			return [page-4, page-3, page-2, page-1, page];
		}
		return [page-2, page-1, page, page+1, page+2];
	}
}

export function getStartingDateOfMonth(date) {
	// Create a new Date object for the given date
	const startingDate = new Date(date);
  
	// Set the day of the month to 1
	startingDate.setDate(1);
  
	// Return the starting date of the month
	return moment(startingDate).format();
}

export function getLastDateOfMonth(date) {
	// Create a new Date object for the given date
	const lastDate = new Date(date);
  
	// Set the date to the next month and set the day to 0 (which means the last day of the previous month)
	lastDate.setMonth(lastDate.getMonth() + 1);
	lastDate.setDate(0);
  
	// Return the last date of the month
	return moment(lastDate).format();
}

export function getStartingDayOfMonth(date) {
	// Create a new Date object for the given date
	const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  
	// Get the day of the week (0 is Sunday, 1 is Monday, ..., 6 is Saturday)
	const startingDay = firstDayOfMonth.getDay();
  
	return startingDay;
  }

export function getMonthNameFromDate(date) {
	return date.toLocaleString("default", { month: "long", year: "numeric" });
}