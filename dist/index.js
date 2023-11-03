"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
function httpsRequest(params, postData) {
    return new Promise(function (resolve, reject) {
        const req = https_1.default.request(params, function (res) {
            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                return reject(new Error('recaptcha statusCode = ' + res.statusCode));
            }
            const body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            res.on('end', function () {
                try {
                    resolve(JSON.parse(Buffer.concat(body).toString()));
                }
                catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', function (err) {
            reject(err);
        });
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}
async function fastify_recaptcha(fastify, options) {
    fastify.decorateRequest('recaptcha', null);
    if (typeof options.recaptcha_secret_key !== "string") {
        console.error("recaptcha_secret_key is not found");
        throw new Error("recaptcha_secret_key is not found");
    }
    fastify.addHook('preHandler', async (request, reply) => {
        if (request.body && request.body["g-recaptcha-response"]) {
            const params = {
                host: 'www.google.com',
                port: 443,
                method: 'POST',
                path: '/recaptcha/api/siteverify',
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            };
            const postData = `secret=${options.recaptcha_secret_key}&response=${request.body["g-recaptcha-response"]}&remoteip=${request.ip}`;
            try {
                const x = await httpsRequest(params, postData);
                if (options.reply) {
                    if (x.success === false || x.score < 0.5 || (options.hostname && options.hostname !== x.hostname)) {
                        reply.status(403).send({ message: "Recaptcha verification failed" });
                    }
                }
                else {
                    request.recaptcha = x;
                }
            }
            catch (err) {
                reply.status(403).send({ message: "Recaptcha verification error" });
            }
        }
    });
}
exports.default = (0, fastify_plugin_1.default)(fastify_recaptcha, { name: "fastify-recaptcha" });
