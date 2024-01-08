<template>
  <div @click="switchFocus">
    <h3>
      Welcome to Classic Snake Game, created with Vue.js!
      <button
        @click="start"
        ref="button"
        v-on:keydown='processUserInput($event)'
      >Set Board for a New Game</button>
    </h3>

    <div class="scores">
      <h3>Instructions:</h3>
      <ul>
        <li>You are the Green dot. Control it with the arrow keys on your keyboard.</li>
        <li>The teal dot is the goal. Navigate to it.</li>
        <li>The red dots are obstacles. Avoid them.</li>
      </ul>
      <h1>Current score: {{ score  }}</h1>
      <h3 v-if="scores.length">Your Recent Scores:</h3>
      <ul>
        <li v-for="s in scores">{{ s }}</li>
      </ul>
      <h3 v-if="highScores.length">All Time High Scores:</h3>
      <ol>
        <li v-for="s in highScores">
          <strong>{{ s.player_name }}</strong>: <span>{{ s.score }}</span>
        </li>
      </ol>
    </div>
    <div v-show="gameOver" class="modal">
      <div class="modal-content">
        <h1>Game Over</h1>
        <h2>Your score: {{ score }}</h2>
        <div v-if="newHighScore">
          <h3>You got a high score!</h3>
          <h5>Add your name to the leaderboard:</h5>
          <form @submit.prevent="submitHighScore">
            <input v-model="playerName" type="text" minlength="2" maxlength="20" required />
            <button type="submit">Submit</button>
          </form>
        </div>
        <button v-else @click="start">Play Again</button>
      </div>
    </div>
    <div class="grid-container">
      <div v-for="(box, index) in boardArea" :class="classAt(index)" class="grid-item"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      gameOver: false,
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
      playerName: '',
      apiURL: 'https://1k3lc77m4g.execute-api.us-east-1.amazonaws.com/scores'
    };
  },
  computed: {
    newHighScore() {
      if (this.highScores.length < 10) { return true; }
      let [lowestHighScore] = this.highScores.slice(-1);
      return this.score > lowestHighScore.score;
    }
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
        this.highScores = JSON.parse(data).sort((a, b) => b.score - a.score).slice(0, 10);
      })
      .catch(error => {
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
      this.gameOver = false;
      this.score = 0;
      this.snake = { direction: null, body: [this.startingCoordinate] };
      this.obstacles = [];
      for (var i = 0; i < this.obstacleCount; i++) {
        var obstacle = Math.floor(Math.random() * this.boardArea);
        this.obstacles.push(obstacle);
      }
      this.setGoal();
    },
    switchFocus() {
      if (this.gameOver) { return; }
      this.$refs.button.focus();
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
      if (this.gameOver) { return; }
      if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes($event.key)) {
        $event.preventDefault();
      }
      var newDirection = $event.key;
      if (["ArrowRight", "ArrowLeft"].includes(newDirection) && ["ArrowRight", "ArrowLeft"].includes(this.snake.direction)) {
        return;
      } else if (["ArrowUp", "ArrowDown"].includes(newDirection) && ["ArrowUp", "ArrowDown"].includes(this.snake.direction)) {
        return;
      } else {
        this.snake.direction = newDirection;
        this.updateSnake();
        clearInterval(this.interval);
        this.interval = setInterval(() => {
          this.updateSnake();
        }, 100);
      }
    },
    submitHighScore() {
      let data = { player_name: this.playerName, score: this.score, timestamp: Date.now(), game_version: '0.0.1' };
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
        this.start();
        return true;
      })
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
        this.gameOver = true;
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
};
</script>
