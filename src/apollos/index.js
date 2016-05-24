"use strict";
var lodash_1 = require("lodash");
var users_1 = require("./users");
exports.schema = users_1.schema.slice();
exports.resolvers = lodash_1.merge({
    Query: {
        currentUser: function (_, args, _a) {
            var user = _a.user;
            return user;
        },
    },
}, users_1.resolver);
exports.models = lodash_1.merge(users_1.model);
exports.queries = [
    "currentUser: User",
];
exports.mocks = lodash_1.merge({
    Query: function () { return ({
        currentUser: function () { return {}; },
    }); },
}, users_1.mocks);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    models: exports.models,
    resolvers: exports.resolvers,
    mocks: exports.mocks,
    schema: exports.schema,
};
