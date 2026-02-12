const log4js = require('log4js');
const log = log4js.getLogger();
const rh = require('/opt/modules/common/response');
const utils = require('/opt/modules/common/utils');
const Extension = require('joi-date-extensions');
const BaseJoi = require('joi');
const Joi = BaseJoi.extend(Extension);

module.exports = class BaseHandler {
    //functionName - name of the subclass function
    constructor(enum_required_fields = null) {
        log.level = process.env.LOG_LEVEL;
        this.log = log;
        // this.enum_required_fields = enum_required_fields;
    }
    // function to be overriden in subclass
    async process(event, context, callback) {
        // this.log.debug('base class function');
    };

    async validate(json, schema) {
        return new Promise((resolve, reject) => {
            Joi.validate(json, schema, {
                abortEarly: false
            }, function (err, value) {
                if (err) {
                    reject({ statusCode: 400, message: JSON.stringify({ message: err.details }) });
                }
                else {
                    resolve(value);
                }
            });
        });
    };

    //instantiating base with subclass tag
    async handler(event, context, callback) {
        //this.log.info('Inside BaseHandler', JSON.stringify(event));
        context.callbackWaitsForEmptyEventLoop = false;
        try {
            if ('headers' in event && event.headers && 'Authorization' in event.headers && event.headers.Authorization) {
                this.credToken = event.headers.Authorization;
                this.user_attr = await utils.getUserPayload(event.headers.Authorization);

                this.user_id = this.user_attr["custom:userid"];
				this.user_type = this.user_attr["custom:role"];
				this.tenant_name = this.user_attr["custom:tenant_name"];
            }

            //calling process function of class instantiated
            let response = await this.process(event, context, callback);
            if (response) {
                this.log.info('Process complete!:', response);
            }
            return response;
        } catch (e) {
            this.log.info("Inside base handler error", e);
            if (e.statusCode) {
                if(e.code) {
                    return rh.sendCodedErrorResponse(e.statusCode, e);
                } else {
                    return e;
                }
            } else {
                return rh.sendServerErrorResponse({message: e.message});
            }
        }
    }
};