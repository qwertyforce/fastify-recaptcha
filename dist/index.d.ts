/// <reference types="node" />
interface Options {
    recaptcha_secret_key: string;
    reply?: boolean;
    hostname?: string;
}
interface RecaptchaData {
    success: boolean;
    challenge_ts: string;
    hostname: string;
    score: number;
    action: string;
}
declare module 'fastify' {
    interface FastifyRequest {
        recaptcha: RecaptchaData | undefined;
    }
}
declare const _default: import("fastify").FastifyPluginAsync<Options, import("http").Server>;
export default _default;
