# Snake Game
+ By: Eric Zell
+ Production URL: <https://snake.ericjzell.com>

## Outside resources
- [Hero Patterns](https://heropatterns.com/)

## Serverless Architecture
This app uses AWS Lambda, API Gateway, S3, and DynamoDB as a serverless architecture.
Cloudfront is used for SSL termination, but also as a CDN. A CNAME record in my DNS points to
the Cloudfront distribution, which has the S3 bucket set as the origin.

To run this app locally, run `npm run dev`
To deploy, run `nmp run build` locally, then upload the contents of the resulting
`dist` directory to S3. *You will need to invalidate the CDN cache in Cloudfront before
you will see changes live in prouction*

# TODO
- Add CI/CD to deploy on push to main branch



