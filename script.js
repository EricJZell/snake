const app = new Vue({
    el: '#app',
    data: {
      boardWidth: 30,
      boardArea: null,
      snake: null,
      goal: null,
      score: 0,
      obstacleCount: 5,
      obstacles: [],
      interval: null,
      scores: [],
      startingCoordinate: 0,
      highScores: [],
      apiURL: 'https://1k3lc77m4g.execute-api.us-east-1.amazonaws.com/scores'
    },
    mounted: function() {
      this.boardArea = this.boardWidth ** 2;
      this.start();
      fetch(this.apiURL)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(data => {
          // The request was successful, and the response is available in the 'data' variable
          this.highScores = JSON.parse(data).sort((a, b) => b.score - a.score).slice(0, 10);
        })
        .catch(error => {
          // Handle errors
          console.error('Error:', error);
        });
    },
    methods: {
      classAt(index) {
        if (this.snake.body.includes(index)) {
          return 'snake';
        } else if (this.obstacles.includes(index)){
          return 'obstacle';
        } else if (this.goal == index) {
          return 'goal'
        }
        return null;
      },
      reset() {
        this.score = 0;
        this.snake = { direction: null, body: [this.startingCoordinate] };
        this.obstacles = [];
        for (var i = 0; i < this.obstacleCount; i++) {
          var obstacle = Math.floor(Math.random() * this.boardArea);
          this.obstacles.push(obstacle);
        }
        this.setGoal();
      },
      start() {
        this.reset();

        clearInterval(this.interval);
        this.interval = setInterval(() =>{
          this.updateSnake();
        }, 100);
        this.$refs.button.focus();
      },
      stop() {
        this.snake.direction = null;
        clearInterval(this.interval);
      },
      setGoal() {
        do {
          this.goal = Math.floor(Math.random() * this.boardArea);
        } while (this.snake.body.includes(this.goal) || this.obstacles.includes(this.goal));
      },
      processUserInput($event) {
        var newDirection = $event.key;
        if (["ArrowRight", "ArrowLeft"].includes(newDirection) && ["ArrowRight", "ArrowLeft"].includes(this.snake.direction)) {
          return;
        } else if (["ArrowUp", "ArrowDown"].includes(newDirection) && ["ArrowUp", "ArrowDown"].includes(this.snake.direction)) {
          return;
        } else {
          this.snake.direction = newDirection;
          this.updateSnake();
          clearInterval(this.interval);
          this.interval = setInterval(function() {
            app.updateSnake();
          }, 100);
        }
      },
      updateSnake() {
        var delta;
        if (this.snake.direction == 'ArrowRight') { delta = 1; }
        else if (this.snake.direction == 'ArrowLeft') { delta = -1; }
        else if (this.snake.direction == 'ArrowUp') { delta = -this.boardWidth; }
        else if (this.snake.direction == 'ArrowDown') { delta = this.boardWidth; }
        else { return; }
        var newHeadCoordinate = this.snake.body.slice(-1)[0] + delta;
        if (this.obstacles.includes(newHeadCoordinate) || this.snake.body.includes(newHeadCoordinate)) {
          this.stop();
          this.scores.push(this.score);
          let [lowestHighScore] = this.highScores.slice(-1);
          if (this.score > lowestHighScore.score) {
            let name = prompt('You got a high score! Enter your name:');
            let data = { player_name: name, score: this.score, timestamp: Date.now(), game_version: '0.0.1' };
            fetch(this.apiURL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            }).then(response => {
              if (!response.ok) {
                console.log(response);
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              this.highScores.push(data);
              this.highScores.sort((a, b) => b.score - a.score);
              return true;
            })
            this.reset()
          } else {
            this.reset();
            alert('game over');
          }
        }
        else {
          if (newHeadCoordinate === this.goal) {
            this.score++;
            this.setGoal();
          } else {
            this.snake.body.shift();
          }
          this.snake.body.push(newHeadCoordinate);;
        }
      }
    }
});
