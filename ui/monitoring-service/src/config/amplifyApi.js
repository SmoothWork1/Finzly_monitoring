import { API, Auth } from "aws-amplify";

async function post(base, path, body = null) {
    let reqBody = {};

    if (body != null) {
        reqBody['body'] = body;
	}

    const session = await Auth.currentSession().catch(() => {});
    if(session) {
        reqBody['headers'] = { Authorization: session.idToken.jwtToken };
    }
        
    return await API.post(base, path, reqBody);
}

async function put(base, path, body = null) {
    let reqBody = {};

    if (body != null) {
        reqBody['body'] = body;
	}

    const session = await Auth.currentSession().catch(() => {});
    if(session) {
        reqBody['headers'] = { Authorization: session.idToken.jwtToken };
    }

    return await API.put(base, path, reqBody);
}

async function del(base, path, body = null) {
    let reqBody = {};

    if (body != null) {
        reqBody['body'] = body;
	}

    const session = await Auth.currentSession().catch(() => {});
    if(session) {
        reqBody['headers'] = { Authorization: session.idToken.jwtToken };
    }

    return await API.del(base, path, reqBody);
}

async function get(base, path, params = null) {
    let init = {};

    if(params != null) {
        init['queryStringParameters'] = params;
	}

    const session = await Auth.currentSession().catch((e) => {console.log(e)});
    if(session) {
        init['headers'] = { Authorization: session.idToken.jwtToken };
    }

    return await API.get(base, path, init);
}

const http = { get, put, post, del };

export default http;