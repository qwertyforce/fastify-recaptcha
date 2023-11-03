import request from "supertest";
import fastify from 'fastify'
import formBodyPlugin from '@fastify/formbody'
import fastifyRecaptcha from "./../dist/index"
describe('plugin test', () => {
    test('throw error if recaptcha sercret key is not provided', () => {
        try {
            const server = fastify()
            server.register(fastifyRecaptcha)
        } catch (err: any) {
            expect(err.message).toBe("recaptcha_secret_key is not found");
        }
    })
    test('request.recaptcha contains recaptcha info if reply option is false/undefined', async () => {
        const server = fastify()
        server.register(formBodyPlugin)
        server.register(fastifyRecaptcha, { recaptcha_secret_key: "TEST_TEST_TEST" })
        server.post('/test', (req: any, reply) => {
            reply.send(req.recaptcha)
        })
        await server.ready()
        const result = await request(server.server)
            .post('/test')
            .send({ "g-recaptcha-response": 'test_test_test' })
            .set('Accept', 'application/json')
            .expect(200)
        expect(result.body).toEqual({ "success": false, "error-codes": ["invalid-input-secret"] })
    })

    test('request is rejected before reaching /test handler if reply option is true', async () => {
        const server = fastify()
        server.register(formBodyPlugin)
        server.register(fastifyRecaptcha, { recaptcha_secret_key: "TEST_TEST_TEST", reply: true })
        server.post('/test', (req: any, reply) => {
            reply.send("test")
        })
        await server.ready()
        const result = await request(server.server)
            .post('/test')
            .send({ "g-recaptcha-response": 'test_test_test' })
            .set('Accept', 'application/json')
            .expect(403)
        expect(result.body).toEqual({ message: "Recaptcha verification failed" })
    })
})