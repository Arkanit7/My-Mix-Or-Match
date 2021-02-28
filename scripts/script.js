"use strict";
const overlays = [
  document.querySelector("[data-overlay='start']"),
  document.querySelector("[data-overlay='end']"),
  document.querySelector("[data-overlay='victory']"),
];
const cards = document.querySelectorAll(".game .card");

class AudioController {
  constructor() {
    this.bgMusic = new Audio("./assets/audio/creepy.mp3");
    this.bgMusic.volume = 0.1;
    this.bgMusic.loop = true;
    this.flipSound = new Audio("./assets/audio/flip.wav");
    this.matchSound = new Audio("./assets/audio/match.wav");
    this.victorySound = new Audio("./assets/audio/victory.wav");
    this.victorySound.volume = 0.3;
    this.gameOverSound = new Audio("./assets/audio/gameover.wav");
  }
  startMusic() {
    this.bgMusic.play();
  }
  stopMusic() {
    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
  }
  flip() {
    this.flipSound.play();
  }
  match() {
    this.matchSound.play();
  }
  victory() {
    this.stopMusic();
    this.victorySound.play();
  }
  gameOver() {
    this.stopMusic();
    this.gameOverSound.play();
  }
}

class MixOrMatch {
  constructor(cards, totalTime) {
    this.cardsArray = cards;
    this.totalTime = totalTime;
    this.timerNode = document.getElementById("time-remaining");
    this.flipsNode = document.getElementById("flips");
    this.audio = new AudioController();
  }
  startGame() {
    this.busy = false;

    this.hideCards();
    this.shuffleCards();
    this.cardToCheck = null;
    this.matchedCards = [];

    this.flips = 0;
    this.flipsNode.innerText = this.flips;

    this.timeRemaining = this.totalTime;
    this.timerNode.innerText = this.totalTime;
    this.startTimer();

    this.audio.startMusic();
  }
  flipCard(card) {
    if (this.canFlipCard(card)) {
      this.audio.flip();
      this.flips++;
      this.flipsNode.innerText = this.flips;
      card.classList.add("_flipped");
      this.checkForMatch(card);
    }
  }

  checkForMatch(card) {
    if (!this.cardToCheck) {
      this.cardToCheck = card;
    } else if (this.cardToCheck.dataset.gameValue === card.dataset.gameValue) {
      this.cardsMatch(card);
    } else {
      this.cardMismatch(card);
    }
  }
  cardsMatch(card) {
    this.audio.match();
    card.classList.add("_matched");
    this.cardToCheck.classList.add("_matched");
    this.matchedCards.push(this.cardToCheck, card);
    this.cardToCheck = null;

    this.checkForVictory();
  }
  cardMismatch(card) {
    this.busy = true;
    setTimeout(() => {
      card.classList.remove("_flipped");
      this.cardToCheck.classList.remove("_flipped");
      this.cardToCheck = null;

      this.busy = false;
    }, 1000);
  }
  hideCards() {
    this.cardsArray.forEach((card) => {
      card.classList.remove("_matched");
      card.classList.remove("_flipped");
    });
  }

  canFlipCard(card) {
    if (
      !this.busy &&
      card != this.cardToCheck &&
      !this.matchedCards.includes(card)
    )
      return true;
  }

  shuffleCards() {
    // Fisher-Yates Shuffle Algorithm.
    for (let i = this.cardsArray.length - 1; i > 0; i--) {
      let randIndex = Math.floor(Math.random() * (i + 1));
      this.cardsArray[randIndex].style.order = i;
      this.cardsArray[i].style.order = randIndex;
    }
  }

  startTimer() {
    const startTime = new Date();
    this.interval = setInterval(() => {
      let currentTime = new Date();
      let spentTime = Math.floor((currentTime - startTime) / 1000);
      this.timeRemaining = this.totalTime - spentTime;
      this.timerNode.innerText = this.timeRemaining;
      if (this.timeRemaining <= 0) this.gameOver();
    }, 1000);
  }
  checkForVictory() {
    if (this.matchedCards.length === this.cardsArray.length) this.gameVictory();
  }
  gameVictory() {
    clearInterval(this.interval);
    this.audio.stopMusic();
    this.audio.victory();
    overlays[2].classList.remove("_hidden");
    this.cardsArray.forEach((card) => {
      card.classList.add("_flipped");
    });
  }
  gameOver() {
    clearInterval(this.interval);
    this.audio.stopMusic();
    this.audio.gameOver();
    overlays[1].classList.remove("_hidden");
    this.cardsArray.forEach((card) => {
      card.classList.add("_flipped");
    });
  }
}

/**********************************/
const game = new MixOrMatch(cards, 100);

overlays.forEach((overlay) => {
  overlay.addEventListener("click", () => {
    overlay.classList.add("_hidden");
    game.startGame();
  });
});

cards.forEach((card) => {
  card.addEventListener("click", () => {
    game.flipCard(card);
  });
});
