(function() {
   const score        = document.querySelector('.score'),
         sound        = document.querySelector('.sound'),
         intro        = document.querySelector('.intro'),
         start        = document.querySelector('.start'),
         gameArea     = document.querySelector('.gameArea'),
         total_score  = document.querySelector('.total_score'),
         mess         = document.querySelector('.mess'),
         gameover     = document.querySelector('.gameover'),
         btn_choose   = document.querySelector('.btn_choose'),
         btn_replay   = document.querySelector('.btn_replay'),
         block_levels = document.querySelector('.levels'),
         new_record   = document.querySelector('.new_record'),
         car          = document.createElement('div');

   car.classList.add('car');

   const records = JSON.parse(localStorage.getItem('records')) || {
      bestRecord: {
         easy: 0,
         norm: 0,
         hard: 0
      },
      otherRecords: {
         easy: [],
         norm: [],
         hard: []
      }
   };

   const keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowRight: false,
      ArrowLeft: false
   };

   const setting = {
      start: false,
      score: 0,
      engine: new Audio(),
      brake: new Audio(),
      crash: new Audio(),
      acceleration: new Audio(),
      cars: ['enemy', 'enemy2'],
      sound: true,
   };

   const levels = {
      easy: {
         speed: 3,
         traffic: 3
      },
      norm: {
         speed: 5,
         traffic: 4
      },
      hard: {
         speed: 7,
         traffic: 5
      }
   };

   const saveRecords = () => localStorage.setItem('records', JSON.stringify(records));

   function getQuantityElements(heightElement){
      return document.documentElement.clientHeight / heightElement + 1;
   }

   function startGame() {
      gameover.classList.add('hide');
      start.classList.add('hide');
      intro.classList.add('hide');
      new_record.classList.add('hide');
      score.classList.remove('hide');
      gameArea.innerHTML = '';
      gameArea.style.opacity = '1';

      for (let i = 0; i < getQuantityElements(100); i++){
         const line = document.createElement('div');
         line.classList.add('line');
         line.style.top = (i * 100) + 'px';
         line.style.left = (gameArea.offsetWidth/2) - (line.offsetWidth/2);
         line.y = i * 100;
         gameArea.appendChild(line);
      }

      for (let i = 0; i < getQuantityElements(100 * setting.traffic); i++){
         const enemy = document.createElement('div');
         enemy.classList.add('enemy');
         enemy.y = -100 * setting.traffic * (i + 1);
         enemy.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + 'px';
         enemy.style.top = enemy.y + 'px';
         enemy.style.background = `transparent url(./image/${setting.cars[Math.floor(Math.random()*setting.cars.length)]}.png) center / cover no-repeat`;
         gameArea.appendChild(enemy);
      }
      setting.score = 0;
      setting.sound ? sound.innerHTML = "sound-on" : sound.innerHTML = "sound-offs";
      setting.start = true;
      gameArea.appendChild(car);
      car.style.left = gameArea.offsetWidth/2 - car.offsetWidth/2;
      car.style.top = "auto";
      car.style.bottom = "10px";
      setting.x = car.offsetLeft;
      setting.y = car.offsetTop;

      setting.engine.src = './audio/moving.mp3';
      setting.engine.loop = true;

      setting.brake.src = './audio/stop.mp3';
      setting.brake.loop = true;

      setting.crash.src = './audio/crash.mp3';

      setting.acceleration.src = './audio/acceleration.mp3';
      setting.acceleration.loop = true;

      requestAnimationFrame(playGame);
   }

   function playGame(){
      if (setting.start){
         setting.score += setting.speed;
         score.innerHTML = `Score: <br> <span class='count'>${setting.score}</span>`;
         moveRoad();
         moveEnemy();
         if (keys.ArrowLeft && setting.x > 0){
            setting.x -= setting.speed;
         }
         if (keys.ArrowRight && setting.x < (gameArea.offsetWidth - car.offsetWidth)){
            setting.x += setting.speed;
         }

         if (keys.ArrowDown && setting.y < (gameArea.offsetHeight - car.offsetHeight)){
            setting.y += setting.speed;
            setting.score -= setting.speed;
            setting.engine.pause();
            setting.brake.play();
         } 
         else if (keys.ArrowUp && setting.y > 0) {
            setting.y -= setting.speed;
            setting.score += setting.speed;
            setting.engine.pause();
            setting.acceleration.play();
         } 
         else if (!keys.ArrowUp && !setting.ArrowDown){
            setting.brake.pause();
            setting.acceleration.pause();
            setting.brake.currentTime = 0;
            setting.acceleration.currentTime = 0;
            setting.engine.play();
         }
         car.style.left = setting.x + 'px';
         car.style.top = setting.y + 'px';
         requestAnimationFrame(playGame);
      } else {
         setting.engine.pause();
         setting.engine.currentTime = 0;
         setting.acceleration.pause();
         setting.acceleration.currentTime = 0;
         setting.brake.pause();
         setting.brake.currentTime = 0;
      }
   }

   function startRun(event) {
      event.preventDefault();
      keys[event.key] = true;
   }

   function stopRun(event) {
      event.preventDefault();
      keys[event.key] = false;
   }

   function moveRoad() {
      let lines = document.querySelectorAll('.line');
      lines.forEach(line => {
         line.y += setting.speed;
         line.style.top = line.y + 'px';

         if (line.y >= document.documentElement.clientHeight){
            line.y = -100;
         }
      });
   }

   function moveEnemy(){
      let enemy = document.querySelectorAll('.enemy');
      enemy.forEach(item => {
         let carRect = car.getBoundingClientRect();
         let enemyRect = item.getBoundingClientRect();

         if (carRect.top <= enemyRect.bottom && carRect.right >= enemyRect.left && carRect.left <= enemyRect.right && carRect.bottom >= enemyRect.top){
            if (setting.speed == levels.easy.speed && setting.traffic == levels.easy.traffic){
               if (setting.score > records.bestRecord.easy) {
                  console.log('New Record! Level: easy');
                  new_record.classList.remove('hide');
                  records.otherRecords.easy.push(records.bestRecord.easy);
                  records.bestRecord.easy = setting.score;
               } else {
                  records.otherRecords.easy.push(setting.score);
               }
            }
            else if (setting.speed == levels.norm.speed && setting.traffic == levels.norm.traffic) {
               if (setting.score > records.bestRecord.norm) {
                  console.log('New Record! Level: norm');
                  new_record.classList.remove('hide');
                  records.otherRecords.norm.push(records.bestRecord.norm);
                  records.bestRecord.norm = setting.score;
               } else {
                  records.otherRecords.norm.push(setting.score);
               }
            }
            else if (setting.speed == levels.hard.speed && setting.traffic == levels.hard.traffic) {
               if (setting.score > records.bestRecord.hard) {
                  console.log('New Record! Level: hard');
                  new_record.classList.remove('hide');
                  records.otherRecords.hard.push(records.bestRecord.hard);
                  records.bestRecord.hard = setting.score;
               } else {
                  records.otherRecords.hard.push(setting.score);
               }
            }
            saveRecords();
            setting.crash.play();
            setting.start = false;
            console.log('ДТП');
            mess.style.display = 'block';
            score.classList.add('hide');
            gameover.classList.remove('hide');
            total_score.innerHTML = `Счёт: ${setting.score}`;
            start.classList.remove('hide');
            gameArea.style.opacity = '0.3';
         }

         item.y += setting.speed / 2;
         item.style.top = item.y + "px";
         
         if (item.y >= document.documentElement.clientHeight) {
         item.y = -100 * setting.traffic;
         item.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - car.offsetWidth)) + "px";
         }
      });
   }


   block_levels.addEventListener('click', event => {
      const target = event.target;
      if (target.closest('.level') || target.classList.contains('.level')) {
         if (target.classList.contains('easy')) {
            setting.speed = levels.easy.speed;
            setting.traffic = levels.easy.traffic;
         } else if (target.classList.contains('norm')) {
            setting.speed = levels.norm.speed;
            setting.traffic = levels.norm.traffic;
         } else if (target.classList.contains('hard')) {
            setting.speed = levels.hard.speed;
            setting.traffic = levels.hard.traffic;
         }
         startGame();
      }
   });
   document.addEventListener('keydown', startRun);
   document.addEventListener('keyup', stopRun);

   btn_replay.addEventListener('click', startGame);
   btn_choose.addEventListener('click', () => {
      gameover.classList.add('hide');
      start.classList.remove('hide');
      intro.classList.remove('hide');
   });
})();