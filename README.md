
# Discord Webhook Queue

A simple, yet effecitive queue system, to prevent your ips/webhooks from being rate limited on high output systems.

DXN-DWHQ (Devoplx Discord WebHook Queue) system, uses a simple method to prevent webhooks/ips from being rate limited. 

By only allowing webhooks being sent every 3s, it ensures it fits within discord rate limits.

All you have to do, is replace your normal webhooks with the url that follows the api refernce down below.

If you want to host it, we recommand and use [heztner](https://hetzner.cloud/?ref=acnFXBn6kbPC)
If you wish, we can setup and host it for you, for a small fee of 5$ a month, contact us at our discord: [discord](https://devoplx.com/discord)

it will work with 99% pre existing systems that use discord webhoo, all you got to do is put your url, example: 

url = "http://discord.com/api/webhook/xxxxx/yyyyy"

x = id
y = token

with = "yoursite.com/webhook/addqueue/:license/:id/:token

NOTICE: We understand that discord ratelimits are 30 Msg / per Channel / Per 1 Min, then 50 Messages / per 1 Sec per IP. However with this simple system design, we do not track each channel. (We are open to any pull requests, adding this system, but at this time, we will not be adding it)



[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)



## API Reference

#### Get all items

```http
  POST /webhook/addqueue/:license/:id/:token
```
URL PARAMS:
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `license` | `string` | **Required**. The license Key |
| `id` | `string` | **Required**. The Discord Webhook ID |
| `token` | `string` | **Required**. The Discord Webhook Token |

BODY:
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `discord webhook schema` | `string` | **Required**. [Discord docs](https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params) |
## Authors

- [@RjManhas](https://github.com/RjManhas)
- [@JoeV2](https://github.com/Joe-Development)

Backed By [@Devoplx](https://github.com/devoplx) Company


## Deployment

To deploy this project run

the Dockerfile provided in the root of the project. Once started you can go to localhost:4011

If you want to manually do it, then you can do:

1.
```bash
npm i
```

2.
```bash
npm run build
```

3.
```bash
npm run start
```

then you can go to localhost:4011
## FAQ

#### Why is the rate limit set to 3s

We understand, discord rate limit per channel is 30Msg/60 which would only require a 2s deley, we want to prevent your systems from being rate limited.



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`LICENSE`

`MOGNODB_URL`


## Roadmap

- Work on making it multi noded (allow you to scale it up)



## Used By

This project is used by the following companies:

- Devoplx


## Support

For support, join our [discord](https://devoplx.com/discord)


![Logo](https://devoplx.com/assets/images/logos/devoplx-logo.png)

