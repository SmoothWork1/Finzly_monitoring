export const nameRE = /^\w[\w\s]{1,}$/;
export const emailRE = /^\w.+@\w+\.\w{2,5}$/;
export const mobileRE = /^\d{11,12}$/;
export const usernameRE = /^\w{3,}$/;
export const passwordRE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&/,><\’:;|_~`])\S{8,99}$/;
export const commaRE = /\B(?=(\d{3})+(?!\d))/g;
export const htmlRE = /<([a-z]+)(?![^>]*\/>)[^>]*>/;