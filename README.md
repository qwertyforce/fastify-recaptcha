# fastify-recaptcha
zero dependency (except fastify-plugin) fastify recaptcha plugin <br>
options:
```ts
/* 
https://developers.google.com/recaptcha/docs/verify
Verification is failed if: score < 0.5 || success === false || options.hostaname && options.hostname !== hostname received from the google request
*/
interface Options {
    recaptcha_secret_key: string,
    reply?: boolean, // if true, will reply with 403 and error message on recaptca verification error. If false/undefined, will decorate request with recaptcha field. This field contains all the information received from the google request
    hostname?: string // if exists, a hostname check will be performed
}
```
example: <br>
```ts
import fastifyRecaptcha from 'fastify-recaptcha'
//or const fastifyRecaptcha = require('fastify-recaptcha')
fastify.register(fastifyRecaptcha,{
    recaptcha_secret_key:"your_recaptcha_sercret_key"
})
```
```ts
import fastifyRecaptcha from 'fastify-recaptcha'
//or const fastifyRecaptcha = require('fastify-recaptcha')
fastify.register(fastifyRecaptcha,{
    recaptcha_secret_key:"your_recaptcha_sercret_key",
    reply:true,
    hostname:"subdomain.domain.com"
})
```
Don't forget to require g-recaptcha-response in protected routes.
```js
const body_schema_route = {
    type: 'object',
    properties: {
        "g-recaptcha-response": { type: 'string' },
    },
    required: ['g-recaptcha-response'],
}
```
