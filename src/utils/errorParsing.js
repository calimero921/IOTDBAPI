/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2020 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

module.exports = function (context, error) {
    let result = {};
    if (error) {
        // get status code from provided error
        if (error.status_code) {
            result.status_code = error.status_code;
        } else {
            result.status_code = 500;
        }

        // format status message from provided error
        if (typeof error === 'string') {
            result.status_message = error;
        } else {
            Object.keys(error).forEach(attribute => {
                switch (attribute) {
                    case 'status_code':
                        // already formated code
                        result.status_code = error[attribute];
                        break;
                    case 'status_message':
                        // already formated message
                        result.status_message = error[attribute];
                        break;
                    case 'stack':
                        // exception message
                        result.status_message = error[attribute];
                        break;
                    case 'message':
                        // validation message
                        result.status_code = 400;
                        result.status_message = error[attribute];
                        break;
                    default:
                        // unmanaged attribute
                        if (!result.status_message) result.status_message = error[attribute];
                        break;
                }
            });
        }
    } else {
        result.status_code = 500;
    }
    if (!result.status_message) result.status_message = getGeneriqueMessage(result.status_code);
    return result;
};

function getGeneriqueMessage(status_code) {
    let message;
    if (status_code) {
        switch (status_code) {
            case 200:
                message = 'Ok';
                break;
            case 201:
                message = 'Created';
                break;
            case 204:
                message = 'No content';
                break;
            case 400:
                message = 'Bad Request';
                break;
            case 401:
                message = 'Unauthorized';
                break;
            case 403:
                message = 'Forbidden';
                break;
            case 404:
                message = 'Not Found';
                break;
            case 405:
                message = 'Method Not Allowed';
                break;
            case 408:
                message = 'Request Timeout';
                break;
            case 409:
                message = 'Conflict';
                break;
            case 500:
                message = 'Internal Server Error';
                break;
            default:
                message = 'Unknown error';
                break;
        }
    } else {
        message = 'Unknown error';
    }
    return message;
}