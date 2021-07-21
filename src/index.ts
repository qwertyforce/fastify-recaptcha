import https from 'https'
import fp from "fastify-plugin"
import { FastifyInstance } from "fastify"

interface Options {
    recaptcha_secret_key: string,
    reply?: boolean,
    hostname?: string
}

interface RecaptchaData {
    success: boolean,
    challenge_ts: string,
    hostname: string,
    score: number,
    action: string
}

declare module 'fastify' {
    interface FastifyRequest {
        recaptcha: RecaptchaData | undefined
    }
}

function httpsRequest(params: https.RequestOptions, postData?: any) {  //https://stackoverflow.com/a/38543075
    return new Promise(function (resolve, reject) {
        const req = https.request(params, function (res) {
            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                return reject(new Error('recaptcha statusCode = ' + res.statusCode));
            }
            let body: Uint8Array[] = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            res.on('end', function () {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch (e) {
                    reject(e);
                }
                resolve(body);
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

async function fastify_recaptcha(fastify: FastifyInstance, options: Options) {
    fastify.decorateRequest('recaptcha', undefined)
    if (typeof options.recaptcha_secret_key !== "string") {
        throw new Error("recaptcha_secret_key is not found")
    }
    fastify.addHook('preHandler', async (request, reply) => {
        if (request.body && (request as any).body["g-recaptcha-response"]) {
            const params = {
                host: 'www.google.com',
                port: 443,
                method: 'POST',
                path: '/recaptcha/api/siteverify',
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            };
            const postData = `secret=${options.recaptcha_secret_key}&response=${(request as any).body["g-recaptcha-response"]}&remoteip=${request.ip}`
            try {
                const x: any = await httpsRequest(params, postData)
                if (options.reply) {
                    if (x.success === false || x.score < 0.5 || (options.hostname && options.hostname !== x.hostname)) {
                        return reply.send({ message: "Recaptcha verification failed" })
                    }
                } else {
                    request.recaptcha = {
                        success: x.success,
                        challenge_ts: x.challenge_ts,
                        hostname: x.hostname,
                        score: x.score,
                        action: x.action
                    }
                }
            } catch (err) {
                throw new Error("Recaptcha verification error")
            }

        }
    })
}

export default fp(fastify_recaptcha, { name: "fastify-recaptcha" })