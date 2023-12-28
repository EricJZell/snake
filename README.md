# Snake Game
+ By: Eric Zell
+ Production URL: <http://snake.ericjzell.com>

## Outside resources
- [CSS Grid Layout](https://www.w3schools.com/css/css_grid.asp)
- [Color Palette From coolors.co](https://coolors.co/palettes/trending)
- [Index attribute in v-for](https://forum.vuejs.org/t/index-attribute-in-v-for/4039)

## Serverless Architecture
This uses AWS Lambda, API Gateway, and DynamoDB as a serverless architecture.
To test the API Gateway/ Lambda, run:
`curl -X "POST" -H "Content-Type: application/json" -d "{\"score\": 13, \"player_name\": \"ezell\"}" https://1k3lc77m4g.execute-api.us-east-1.amazonaws.com/scores`

You can then visit https://1k3lc77m4g.execute-api.us-east-1.amazonaws.com/scores in your browser to check the score has been created.
