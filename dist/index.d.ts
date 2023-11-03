import { FastifyInstance } from "fastify";
interface Options {
    recaptcha_secret_key: string;
    reply?: boolean;
    hostname?: string;
}
interface RecaptchaData {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    score?: number;
    action?: string;
    "error-codes"?: string[];
}
declare module 'fastify' {
    interface FastifyRequest {
        recaptcha: RecaptchaData | undefined;
    }
}
declare function fastify_recaptcha(fastify: FastifyInstance, options: Options): Promise<void>;
declare const _default: typeof fastify_recaptcha;
export default _default;
