(function() {
    const score = document.querySelector('.score'),
        sound = document.querySelector('.soundBox'),
        pause = document.querySelector('.pause'),
        intro = document.querySelector('.intro'),
        start = document.querySelector('.start'),
        gameMenu = document.querySelector('.game-menu'),
        gameArea = document.querySelector('.gameArea'),
        total_score = document.querySelector('.total_score'),
        mess = document.querySelector('.mess'),
        gameover = document.querySelector('.gameover'),
        btn_choose = document.querySelector('.btn_choose'),
        btn_replay = document.querySelector('.btn_replay'),
        btn_exit = document.querySelector('.btn_exit'),
        block_levels = document.querySelector('.levels'),
        sets = document.querySelector('.settings'),
        reference = document.querySelector('.reference'),
        results = document.querySelector('.results'),
        authors = document.querySelector('.authors'),
        game = document.querySelector('.game'),
        new_record = document.querySelector('.new_record'),
        speedmetr = document.querySelector('.speedmetr'),

        car = document.createElement('div');

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
        signal: new Audio(),
        cars: ['enemy', 'enemy2'],
        sound: true,
        spareCar: null,
        vehicles: [
            { name: "Mersedes", maxSpeed: 22, vehicle: 'player', chose: true },
            { name: "Mitsubishi", maxSpeed: 20, vehicle: 'player2', chose: false },
        ],
        themes: [
            { bg: "bg-1", chose: false, color: "rgb(0,0,0)" },
            { bg: "bg-2", chose: false, color: "rgb(0,0,0)" },
            { bg: "bg-3", chose: true, color: "rgb(0,0,0)" },
        ],
        smooth: 6,
        t: null,
        minSpeed: 2.5,
        balance: 0,
        maxAngle: 5,
    };

    const levels = {
        easy: {
            speed: 3,
            traffic: 3
        },
        norm: {
            speed: 5,
            traffic: 5
        },
        hard: {
            speed: 7,
            traffic: 7
        },
        currentSpeed: null,
        maxSpeed: null
    };

    const saveRecords = () => localStorage.setItem('records', JSON.stringify(records));

    function getQuantityElements(heightElement) {
        return document.documentElement.clientHeight / heightElement + 1;
    }

    function startGame() {
        pause.classList.add('hide');
        gameArea.classList.remove('hide');
        gameover.classList.add('hide');
        start.classList.add('hide');
        intro.classList.add('hide');
        new_record.classList.add('hide');
        score.classList.remove('hide');
        gameArea.innerHTML = '';
        gameArea.style.opacity = '1';

        if (gameover.classList.contains('hide')) {
            setting.currentBoost = setting.startBoost;
            levels.currentSpeed = setting.speed;
        }

        for (let i = 0; i < getQuantityElements(50); i++) {
            const line = document.createElement('div');
            line.classList.add('line');
            line.style.top = (i * 100) + 'px';
            line.style.left = (gameArea.offsetWidth / 2) - (line.offsetWidth / 2);
            line.y = i * 100;
            gameArea.appendChild(line);
        }

        // спавн автомобилей
        for (let i = 0; i < getQuantityElements(1000 * setting.traffic); i++) {
            const enemy = document.createElement('div');
            enemy.classList.add('enemy');
            enemy.y = -100 * setting.traffic * (i + 1);
            enemy.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + 'px';
            enemy.style.top = enemy.y + 'px';
            enemy.style.background = `transparent url(./image/${setting.cars[Math.floor(Math.random()*setting.cars.length)]}.png) center / cover no-repeat`;
            gameArea.appendChild(enemy);
        }
        setting.score = 0;
        setting.balance = 0;
        setting.start = true;
        gameArea.appendChild(car);
        car.style.left = gameArea.offsetWidth / 2 - car.offsetWidth / 2;
        car.style.top = "auto";
        car.style.bottom = "250px";
        setting.x = car.offsetLeft;
        setting.y = car.offsetTop;
        setting.vehicles.forEach(vhc => {
            if (vhc.chose == true) {
                car.style.background = `transparent url(./image/${vhc.vehicle}.png) center / cover no-repeat`;
                levels.maxSpeed = vhc.maxSpeed;
            }
        })

        if (setting.sound) {
            setting.engine.src = './audio/moving.mp3';
            setting.engine.loop = true;

            setting.brake.src = './audio/stop.mp3';
            setting.brake.loop = true;

            setting.crash.src = './audio/crash.mp3';

            setting.acceleration.src = './audio/acceleration.mp3';
            setting.acceleration.loop = true;

            setting.signal.src = './audio/signal.mp3';
            setting.signal.loop = true;
        }

        requestAnimationFrame(playGame);
    }

    function theme() {
        let back = setting.themes;
        back.forEach(bg => {
            if (bg.chose == true) {
                gameMenu.querySelectorAll('.game-link').forEach(link => {
                    link.style.color = bg.color;
                })
                game.querySelectorAll('.back').forEach(close => {
                    close.style.color = bg.color;
                })
                game.style.color = bg.color;
                game.style.backgroundImage = `url(../image/${bg.bg}.jpg)`;
            }
        })
    }

    function speedMeter() {
        speedmetr.querySelector('.speedView').value = levels.currentSpeed.toFixed(1) * 10 + ' км/ч';
        speedmetr.querySelector('.moveSpeed').style.left = (levels.currentSpeed / levels.maxSpeed).toFixed(2) * 100 + '%';
    }

    function render() {
        toggleSound();
        theme();
    }

    function toggleSound() {
        if (setting.sound) {
            sound.innerHTML = `<svg>
               <use class="sound" xlink:href="./image/icons.svg#Sound-on"></use>
            </svg>`
            setting.engine.volume = 0.3;
            setting.brake.volume = 0.3;
            setting.crash.volume = 0.3;
            setting.acceleration.volume = 0.3;
        } else {
            sound.innerHTML = `<svg>
               <use class="sound" xlink:href="./image/icons.svg#Sound-off"></use>
            </svg>`
            setting.engine.volume = 0;
            setting.brake.volume = 0;
            setting.crash.volume = 0;
            setting.acceleration.volume = 0;
        }
    }

    function playGame() {
        if (setting.start) {
            setting.score += parseInt(levels.currentSpeed);
            score.innerHTML = `Score: <br> <span class='count'>${setting.score}</span>`;
            speedMeter();
            moveRoad();
            moveEnemy();
            if (keys.ArrowLeft && setting.x > 0) {
                if (-setting.balance < setting.maxAngle) setting.balance -= 0.5;
                car.style.transform = `rotateZ(${setting.balance}deg)`;
                console.log(setting.balance);
                setting.x -= levels.currentSpeed / 2.5;
            }
            if (keys.ArrowRight && setting.x < (gameArea.offsetWidth - car.offsetWidth)) {
                if (setting.maxAngle > setting.balance) setting.balance += 0.5;
                car.style.transform = `rotateZ(${setting.balance}deg)`;
                console.log(setting.balance);
                setting.x += levels.currentSpeed / 2.5;
            }

            if (keys.ArrowDown && setting.y < (gameArea.offsetHeight - car.offsetHeight)) {
                if (levels.currentSpeed > setting.minSpeed) {
                    if (levels.currentSpeed > 10 && levels.currentSpeed <= 20) {
                        levels.currentSpeed -= 0.3;
                    } else if (levels.currentSpeed > 20) levels.currentSpeed -= 0.1;
                    else levels.currentSpeed -= 0.4;
                }
                setting.score -= parseInt(levels.currentSpeed);
                setting.engine.pause();
                setting.brake.play();
            } else if (keys.ArrowUp && setting.y > 0) {
                if (levels.currentSpeed < levels.maxSpeed) {
                    if (levels.currentSpeed > 10 && levels.currentSpeed <= 20) levels.currentSpeed += 0.05;
                    else if (levels.maxSpeed - levels.currentSpeed < 0.4) levels.currentSpeed += 0.001;
                    else if (levels.currentSpeed > 20) levels.currentSpeed += 0.01;
                    else {
                        levels.currentSpeed += 0.1;
                    }
                }
                setting.score += parseInt(levels.currentSpeed);
                setting.engine.pause();
                setting.acceleration.play();
            } else if (!keys.ArrowUp && !setting.ArrowDown) {
                if (levels.currentSpeed < setting.speed) levels.currentSpeed += 0.3;
                else if (levels.currentSpeed > setting.speed) {
                    if (levels.currentSpeed > 10) levels.currentSpeed -= 0.02;
                    else if (levels.currentSpeed > 20) levels.currentSpeed -= 0.009;
                    else levels.currentSpeed -= 0.05;
                }
                setting.brake.pause();
                setting.acceleration.pause();
                setting.brake.currentTime = 0;
                setting.acceleration.currentTime = 0;
                setting.engine.play();
            }
            if (!keys.ArrowLeft && !keys.ArrowRight) {
                if (setting.balance < 0) {
                    setting.balance += 0.5;
                    car.style.transform = `rotateZ(${setting.balance}deg)`;
                } else if (setting.balance >= 0) {
                    setting.balance -= 0.5;
                    car.style.transform = `rotateZ(${setting.balance}deg)`;
                }
                console.log(setting.balance);
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
            line.y += parseInt(levels.currentSpeed);
            line.style.top = line.y + 'px';

            if (line.y >= document.documentElement.clientHeight) {
                line.y = -100;
            }
        });
    }

    function moveEnemy() {
        let enemy = document.querySelectorAll('.enemy');
        enemy.forEach(item => {
            let carRect = car.getBoundingClientRect();
            let enemyRect = item.getBoundingClientRect();
            let sm = setting.smooth;

            if (carRect.top + sm <= enemyRect.bottom && carRect.right - sm >= enemyRect.left && carRect.left + sm <= enemyRect.right && carRect.bottom - sm >= enemyRect.top) {
                if (setting.speed == levels.easy.speed && setting.traffic == levels.easy.traffic) {
                    if (setting.score > records.bestRecord.easy) {
                        console.log('New Record! Level: easy');
                        new_record.classList.remove('hide');
                        records.otherRecords.easy.push(records.bestRecord.easy);
                        records.bestRecord.easy = setting.score;
                    } else {
                        records.otherRecords.easy.push(setting.score);
                    }
                } else if (setting.speed == levels.norm.speed && setting.traffic == levels.norm.traffic) {
                    if (setting.score > records.bestRecord.norm) {
                        console.log('New Record! Level: norm');
                        new_record.classList.remove('hide');
                        records.otherRecords.norm.push(records.bestRecord.norm);
                        records.bestRecord.norm = setting.score;
                    } else {
                        records.otherRecords.norm.push(setting.score);
                    }
                } else if (setting.speed == levels.hard.speed && setting.traffic == levels.hard.traffic) {
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
                mess.style.display = 'block';
                score.classList.add('hide');
                start.classList.remove('hide');
                gameover.classList.remove('hide');
                total_score.innerHTML = `Счёт: ${setting.score}`;
            }

            item.y += levels.currentSpeed / 2;
            item.style.top = item.y + "px";

            if (item.y >= document.documentElement.clientHeight) {
                item.y = -100 * setting.traffic;
                item.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - car.offsetWidth)) + "px";
            }
        });
    }

    function getBgs() {
        let bg = document.querySelector('.bgColor');
        bg.innerHTML = '';
        let bgs = setting.themes;
        bgs.forEach(bcolor => {
            let clr = document.createElement('li');
            clr.classList.add('color');
            let bxColor = document.createElement('div');
            bxColor.classList.add('boxColor');
            bxColor.style.backgroundImage = `url(../image/${bcolor.bg}.jpg)`;
            if (bcolor.chose) bxColor.classList.add('choseColor');
            clr.appendChild(bxColor);
            bg.appendChild(clr);
        });
    }

    function getCars() {
        let cars = document.querySelector('.changeCar');
        cars.innerHTML = '';
        let vehicles = setting.vehicles;
        vehicles.forEach(vehicle => {
            let vhc = document.createElement('li');
            let vhcLook = document.createElement('img');
            let radioCar = document.createElement('input');
            radioCar.type = 'radio';
            radioCar.id = vehicle.vehicle;
            radioCar.name = 'car';
            radioCar.checked = vehicle.chose;
            vhcLook.classList.add('vehicle');
            vhcLook.src = './image/' + vehicle.vehicle + '.png';
            vhcLook.classList.add(vehicle.vehicle);
            let labelCar = document.createElement('label');
            labelCar.classList.add('lbl_car');
            labelCar.setAttribute("for", radioCar.id);
            labelCar.appendChild(vhcLook)
            vhc.appendChild(labelCar);
            vhc.appendChild(radioCar);
            cars.appendChild(vhc);
        });
    }

    render();

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
            levels.currentSpeed = setting.speed;
            startGame();
        }
    });
    document.addEventListener('keydown', startRun);
    document.addEventListener('keyup', stopRun);

    btn_replay.addEventListener('click', startGame);
    btn_exit.addEventListener('click', e => {
        gameArea.classList.add('hide');
        pause.classList.add('hide');
        gameMenu.classList.remove('hide');
        start.classList.remove('hide');
        block_levels.classList.add('hide');
        intro.classList.remove('hide');
    });
    btn_choose.addEventListener('click', () => {
        gameover.classList.add('hide');
        start.classList.remove('hide');
        intro.classList.remove('hide');
    });

    sound.addEventListener('click', event => {
        const target = event.target;
        if (target.classList.contains('sound')) {
            setting.sound = !setting.sound;
            toggleSound()
        }
    });

    start.addEventListener('click', event => {
        const target = event.target;
        if (target.classList.contains('play')) {
            block_levels.classList.remove('hide');
            gameMenu.classList.add('hide');
        }
        if (target.classList.contains('sets')) {
            getBgs();
            getCars();
            sets.classList.remove('hide');
            gameMenu.classList.add('hide');
        }
        if (target.classList.contains('refer')) {
            reference.classList.remove('hide');
            gameMenu.classList.add('hide');
        }
        if (target.classList.contains('record')) {
            results.classList.remove('hide');
            gameMenu.classList.add('hide');
            let best = JSON.parse(localStorage.getItem('records')).bestRecord;
            let res = document.querySelectorAll('.result');
            res.forEach(r => {
                r.innerHTML = '';
                let title = document.createElement('h3');
                title.classList.add('record-title');
                let rec = document.createElement('span');
                rec.classList.add('res-value')
                if (r.classList.contains('result-easy')) {
                    title.textContent = "Легкий";
                    rec.innerHTML = best.easy;
                } else if (r.classList.contains('result-norm')) {
                    title.textContent = "Средний";
                    rec.textContent = best.norm;
                } else if (r.classList.contains('result-hard')) {
                    title.textContent = "Сложный";
                    rec.textContent = best.hard;
                }
                r.appendChild(title);
                r.appendChild(rec);
            })
        }
        if (target.classList.contains('author')) {
            authors.classList.remove('hide');
            gameMenu.classList.add('hide');
            sound.classList.add('hide');
        }
        if (target.classList.contains('back')) {
            gameArea.classList.add('hide');
            target.parentNode.classList.add('hide');
            gameMenu.classList.remove('hide');
        }
        if (target.classList.contains('close')) {
            target.parentNode.classList.add('hide');
            gameMenu.classList.remove('hide');
            sound.classList.remove('hide');
        }
        if (target.classList.contains('boxColor')) {
            let color = target.style.backgroundImage;
            let clrs = document.querySelectorAll('.boxColor');
            clrs.forEach(clr => {
                clr.classList.remove('choseColor')
            })
            clrs = setting.themes;
            clrs.forEach(clr => {
                clr.chose = false;
                let trueBG = color.substring(color.lastIndexOf('/') + 1, color.lastIndexOf('.'));
                if (clr.bg == trueBG) {
                    clr.chose = true;
                }
            })
            game.style.backgroundImage = color;
            getBgs();
        }
        if (target.classList.contains('vehicle')) {
            let car = target.classList[1];
            setting.vehicles.forEach(vehicle => {
                vehicle.chose = false;
                if (vehicle.vehicle == car) {
                    vehicle.chose = true;
                    levels.maxSpeed = vehicle.maxSpeed;
                }
            })
            console.log(setting.vehicles);
            getCars();
        }
    });

    document.body.addEventListener('click', e => {
        const target = e.target;
        if (target.classList.contains('speedmetr')) {
            speedmetr.querySelector('.speedStatus').classList.toggle('moveSpeed');
        }
    });

    document.body.addEventListener('keydown', event => {
        const keyCode = event.keyCode;
        if (keyCode === 27 && start.classList.contains('hide')) {
            pause.classList.toggle('hide');
            setting.start = !setting.start;
            if (setting.start) playGame();
        }
        if (keyCode === 27 && !authors.classList.contains('hide')) {
            authors.classList.add('hide');
            gameMenu.classList.remove('hide');
            sound.classList.remove('hide');
        }
        if (keyCode === 16 && start.classList.contains('hide')) {
            setting.signal.play();
        }
        if (keyCode === 88) {
            setting.sound = !setting.sound;
            toggleSound();
        }
    });

    document.body.addEventListener('keyup', event => {
        const keyCode = event.keyCode;
        if (keyCode === 16) {
            setting.signal.pause();
            setting.signal.currentTime = 0;
        }
    });

    // console.log('../../sdsd.jpg'.substring('../../sdsd.jpg'.lastIndexOf('/') + 1, '../../sdsd.jpg'.lastIndexOf('.')));

})();