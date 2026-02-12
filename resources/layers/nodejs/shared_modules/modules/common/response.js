'use strict';

const CORSHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "*",
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	"Access-Control-Expose-Headers": "token",
};

exports.sendSuccessResponse = (body={}) => {
	return {
		statusCode: 200,
        headers: {
            ...CORSHeaders
		},
		body: JSON.stringify(body)
	};
}
exports.sendSuccessResponseWithHeaders = (body={}, headers={}) => {
	return {
		statusCode: 200,
        headers: {
            ...CORSHeaders,
			...headers
		},
		body: JSON.stringify(body)
	};
}

exports.sendBadReqResponse = (body={}) => {
	return {
		statusCode: 400,
        headers: {
            ...CORSHeaders
		},
		body: JSON.stringify(body)
	};
}

exports.sendBadReqResponseWithHeaders = (body={}, headers={}) => {
	return {
		statusCode: 400,
        headers: {
            ...CORSHeaders,
			...headers
		},
		body: JSON.stringify(body)
	};
}

exports.sendUnauthorizedResponse = (body={}) => {
	return {
		statusCode: 401,
        headers: {
            ...CORSHeaders
		},
		body: JSON.stringify(body)
	};
}

exports.sendForbiddenResponse = (body={}) => {
	return {
		statusCode: 403,
        headers: {
            ...CORSHeaders
		},
		body: JSON.stringify(body)
	};
}

exports.sendServerErrorResponse = (body={}) => {
	return {
		statusCode: 500,
        headers: {
            ...CORSHeaders
		},
		body: JSON.stringify(body)
	};
}
exports.sendServerErrorResponseWithHeaders = (body={}, headers={}) => {
	return {
		statusCode: 500,
        headers: {
            ...CORSHeaders,
			...headers
		},
		body: JSON.stringify(body)
	};
}

exports.sendCodedErrorResponse = (statusCode, body={}) => {
	return {
		statusCode,
        headers: {
            ...CORSHeaders
		},
		body: JSON.stringify(body)
	};
}