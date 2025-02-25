"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function formatMessage(objectOrMessage) {
    if (typeof objectOrMessage === "string") {
        return objectOrMessage;
    }
    if (typeof objectOrMessage === "object" && objectOrMessage.message) {
        return objectOrMessage.message;
    }
    return "";
}
function createResponse(objectOrMessage, data = null, success = null) {
    return {
        success: success === null ? true : success,
        message: formatMessage(objectOrMessage),
        data,
    };
}
exports.default = createResponse;
