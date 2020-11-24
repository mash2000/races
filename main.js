(function() {
    const score = document.querySelector('.score'),
        soundBox = document.querySelector('.soundBox'),
        sound = document.querySelector('.box-sound'),
        music = document.querySelector('.box-music'),
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
        song: new Audio(),
        cars: ['enemy', 'enemy2'],
        sound: false,
        music: false,
        spareCar: null,
        vehicles: [
            { name: "Mersedes", maxSpeed: 22, vehicle: 'player', chose: true },
            { name: "Mitsubishi", maxSpeed: 20, vehicle: 'player2', chose: false },
        ],
        themes: [
            { bg: "bg-1", chose: true, color: "rgb(0,0,0)" },
            { bg: "bg-2", chose: false, color: "rgb(0,0,0)" },
            { bg: "bg-3", chose: false, color: "rgb(0,0,0)" },
        ],
        smooth: 6,
        t: null,
        minSpeed: 2.5,
        balance: 0,
        maxAngle: 5,
        boost: 3000,
        currentPunct: 0,
        currentBtn: 0,
    };

    const levels = {
        easy: {
            speed: 4,
            traffic: 7
        },
        norm: {
            speed: 7,
            traffic: 5
        },
        hard: {
            speed: 10,
            traffic: 4
        },
        currentSpeed: null,
        maxSpeed: null
    };

    const saveRecords = () => localStorage.setItem('records', JSON.stringify(records));

    function getQuantityElements(heightElement) {
        return document.documentElement.clientHeight / heightElement + 1;
    }

    setting.song.src = './audio/song.mp3';
    setting.song.loop = true;

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

        for (let i = 0; i < getQuantityElements(100); i++) {
            const line = document.createElement('div');
            line.classList.add('line');
            line.style.top = (i * 100) + 'px';
            line.style.left = (gameArea.offsetWidth / 2) - (line.offsetWidth / 2);
            line.y = i * 100;
            gameArea.appendChild(line);
        }

        // спавн автомобилей
        for (let i = 0; i < getQuantityElements(100 * setting.traffic); i++) {
            const enemy = document.createElement('div');
            enemy.classList.add('enemy');
            enemy.y = -(Math.floor(25 + Math.random() + 125)) * setting.traffic * (i + 1);
            enemy.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + 'px';
            enemy.style.top = enemy.y + 'px';
            enemy.style.background = `transparent url(./image/${setting.cars[Math.floor(Math.random()*setting.cars.length)]}.png) center / cover no-repeat`;
            gameArea.appendChild(enemy);
        }
        document.querySelectorAll('.enemy').forEach(enemy => {
            document.querySelectorAll('.enemy').forEach(enm => {
                if (Math.abs(enemy.offsetTop - enm.offsetTop) <= enemy.offsetHeight) {
                    enemy.style.top -= enemy.offsetHeight + 'px';
                    console.log('top');
                }
            })
        });
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

        setting.engine.src = './audio/moving.mp3';
        setting.engine.loop = true;

        setting.brake.src = './audio/stop.mp3';
        setting.brake.loop = true;

        setting.crash.src = './audio/crash.mp3';

        setting.acceleration.src = './audio/acceleration.mp3';
        setting.acceleration.loop = true;

        setting.signal.src = './audio/signal.mp3';
        setting.signal.loop = false;

        if (setting.music) {
            setting.song.currentTime = 0;
            setting.song.play();
        }

        requestAnimationFrame(playGame);
    }

    // выбора местности для гонки
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

    // Спидометр
    function speedMeter() {
        speedmetr.querySelector('.speedView').value = levels.currentSpeed.toFixed(1) * 10 + ' км/ч';
        speedmetr.querySelector('.moveSpeed').style.left = (levels.currentSpeed / levels.maxSpeed).toFixed(2) * 100 + '%';
    }

    // Отображение темы, иконок звука, музыки
    function render() {
        toggleSound();
        toggleMusic();
        theme();
    }

    // Включение/выключение звука
    function toggleSound() {
        if (setting.sound) {
            sound.innerHTML = `<use class="sound" xlink:href="./image/icons.svg#Sound-on"></use>`
            setting.engine.volume = 0.3;
            setting.brake.volume = 0.3;
            setting.crash.volume = 0.3;
            setting.acceleration.volume = 0.3;
        } else {
            sound.innerHTML = `<use class="sound" xlink:href="./image/icons.svg#Sound-off"></use>`
            setting.engine.volume = 0;
            setting.brake.volume = 0;
            setting.crash.volume = 0;
            setting.acceleration.volume = 0;
        }
    }

    // Включение/выключение музыки
    function toggleMusic() {
        if (setting.music) {
            music.innerHTML = `<use class="music" xlink:href="./image/icons.svg#Music-on"></use>`
            setting.song.currentTime = 0;
            setting.song.volume = 0.3;
            if (pause.classList.contains('hide')) setting.song.play();
        } else {
            music.innerHTML = `<use class="music" xlink:href="./image/icons.svg#Music-off"></use>`
            setting.song.pause();
        }
    }

    // Игра
    function playGame() {
        if (setting.start) {
            setting.score += parseInt(levels.currentSpeed);
            score.innerHTML = `Score: <br> <span class='count'>${setting.score}</span>`;
            speedMeter();
            moveRoad();
            moveEnemy();
            game.style.backgroundPositionY = setting.score + 'px';
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
                setting.score -= parseInt(levels.currentSpeed / 3);
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
                // console.log(setting.balance);
            }
            if (setting.score > setting.boost) {
                setting.boost *= 3;
                setting.traffic++;
                console.log(setting.traffic + 'cars');
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

    // Отслеживание нажатия стрелок
    function startRun(event) {
        event.preventDefault();
        keys[event.key] = true;
    }

    function stopRun(event) {
        event.preventDefault();
        keys[event.key] = false;
    }

    // Движение полосок на дороге
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

    // Движение машин
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
                setting.song.pause();
                mess.style.display = 'block';
                score.classList.add('hide');
                start.classList.remove('hide');
                gameover.classList.remove('hide');
                total_score.innerHTML = `Счёт: ${setting.score}`;
            }

            item.y += Math.floor(1 + Math.random() + (levels.currentSpeed / 3));
            item.style.top = item.y + "px";

            if (item.y >= document.documentElement.clientHeight) {
                item.y = -100 * setting.traffic;
                item.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - car.offsetWidth)) + "px";
            }

            // if ((!setting.signal.paused && setting.signal.currentTime < 1 && (car.offsetTop - (item.offsetTop + item.offsetHeight) < 100 && car.offsetTop - (item.offsetTop + item.offsetHeight) > 0)) && (Math.abs(item.offsetLeft - car.offsetLeft) < car.offsetWidth)) {
            //     if (item.offsetLeft - item.offsetWidth < 0) {
            //         item.style.left = item.offsetLeft + item.offsetWidth + 'px';
            //     } else {
            //         item.style.left = item.offsetLeft - item.offsetWidth + 'px';
            //     }
            //     console.log('another');
            // }
        });
    }

    // Получение тем в меню
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

    // Выбор машины
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

    function back(target) {
        gameArea.classList.add('hide');
        target.parentNode.classList.add('hide');
        gameMenu.classList.remove('hide');
    }

    // Блок настроек
    function sets_func() {
        getBgs();
        getCars();
        sets.classList.remove('hide');
        gameMenu.classList.add('hide');
    }

    // Блок рекорды
    function record() {
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

    // Блок авторы
    function author() {
        authors.classList.remove('hide');
        gameMenu.classList.add('hide');
        sound.classList.add('hide');
        music.classList.add('hide');
    }

    // Отображение иконок
    render();

    // Выбор уровня сложности
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
            block_levels.classList.add('hide');
            startGame();
        }
    });
    // Проводим мышкой по кнопкам
    block_levels.addEventListener('mousemove', event => {
        const target = event.target;
        if (target.closest('.level') || target.classList.contains('.level')) {
            document.querySelectorAll('.level').forEach(lvl => { lvl.classList.remove('chose_btn') });
            target.classList.add('chose_btn');
        }
    })

    // Нажатие стрелок
    document.addEventListener('keydown', startRun);
    // Отпускание стрелок
    document.addEventListener('keyup', stopRun);

    // Рестарт игры
    btn_replay.addEventListener('click', startGame);
    // Выход в меню
    btn_exit.addEventListener('click', e => {
        gameArea.classList.add('hide');
        pause.classList.add('hide');
        gameMenu.classList.remove('hide');
        start.classList.remove('hide');
        block_levels.classList.add('hide');
        intro.classList.remove('hide');
    });
    // Выбор 
    btn_choose.addEventListener('click', () => {
        gameover.classList.add('hide');
        start.classList.remove('hide');
        intro.classList.remove('hide');
        gameMenu.classList.remove('hide');
    });

    // Иконки музыки и звука
    soundBox.addEventListener('click', event => {
        const target = event.target;
        // Звук
        if (target.classList.contains('sound')) {
            setting.sound = !setting.sound;
            toggleSound()
        }
        // Музыка
        if (target.classList.contains('music')) {
            setting.music = !setting.music;
            toggleMusic()
        }
    });

    // Разные манипуляции в главном меню игры
    start.addEventListener('click', event => {
        const target = event.target;
        // Кнопка играть
        if (target.classList.contains('play')) {
            block_levels.classList.remove('hide');
            gameMenu.classList.add('hide');
        }
        // Кнопка настройки
        if (target.classList.contains('sets')) {
            sets_func();
        }
        // Кнопка справка
        if (target.classList.contains('refer')) {
            reference.classList.remove('hide');
            gameMenu.classList.add('hide');
        }
        // Кнопка рекорды
        if (target.classList.contains('record')) {
            record();
        }
        // Кнопка авторы
        if (target.classList.contains('author')) {
            author();
        }
        // Кнопка назад (одинакова практически на всех пунктах)
        if (target.classList.contains('back')) {
            back(target);
            intro.classList.remove('hide');
        }
        // Кнопка закрыть (в пункте авторы)
        if (target.classList.contains('close')) {
            target.parentNode.classList.add('hide');
            gameMenu.classList.remove('hide');
            sound.classList.remove('hide');
            music.classList.remove('hide');
        }
        // Выбор темы
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
        // Выбор машины
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

    // 
    document.body.addEventListener('click', e => {
        const target = e.target;
        if (target.classList.contains('speedmetr')) {
            speedmetr.querySelector('.speedStatus').classList.toggle('moveSpeed');
        }
    });

    // Отслеживание нажатий клавиш
    document.body.addEventListener('keydown', event => {
        event.preventDefault();
        const keyCode = event.keyCode;
        if (keyCode === 27) {
            if (start.classList.contains('hide')) {
                pause.classList.toggle('hide');
                setting.start = !setting.start;
                setting.song.pause();
                if (setting.start) {
                    playGame();
                    if (setting.music) setting.song.play();
                }
            } else if (!gameover.classList.contains('hide')) {
                back(gameover.querySelector('.back'));
                intro.classList.remove('hide');
            } else if (!authors.classList.contains('hide')) {
                authors.classList.add('hide');
                gameMenu.classList.remove('hide');
                sound.classList.remove('hide');
                music.classList.remove('hide');
            } else {
                let backs = document.querySelectorAll('.back');
                backs.forEach(bck => {
                    if (!bck.parentNode.classList.contains('hide')) {
                        back(bck)
                    }
                })
            }
        }
        if (keyCode === 90 && start.classList.contains('hide')) {
            setting.signal.play();
        }
        // Sound
        if (keyCode === 88 && authors.classList.contains('hide')) {
            setting.sound = !setting.sound;
            toggleSound();
        }
        // Music
        if (keyCode === 83 && authors.classList.contains('hide')) {
            setting.music = !setting.music;
            toggleMusic();
        }
        if (!gameMenu.classList.contains('hide')) {
            const puncts = document.querySelectorAll('.game-link');
            if (keyCode === 40) {
                for (let i = 0; i < puncts.length; i++) {
                    if (setting.currentPunct === i && puncts[i].classList.contains('focused')) {
                        if (setting.currentPunct < puncts.length - 1) {
                            setting.currentPunct++;
                            puncts[i].classList.remove('focused');
                        }
                    }
                }
                puncts[setting.currentPunct].classList.add('focused');
                console.log('down');
            } else if (keyCode === 38) {
                for (let i = 0; i < puncts.length; i++) {
                    if (setting.currentPunct === i && puncts[i].classList.contains('focused')) {
                        if (setting.currentPunct > 0) {
                            setting.currentPunct--;
                            puncts[i].classList.remove('focused');
                        }
                    }
                }
                puncts[setting.currentPunct].classList.add('focused');
                console.log('up')
            } else if (keyCode === 13) {
                if (!gameMenu.classList.contains('hide') && block_levels.classList.contains('hide')) {
                    if (puncts[setting.currentPunct].classList.contains('sets')) {
                        sets_func()
                    } else if (puncts[setting.currentPunct].classList.contains('play')) {
                        block_levels.classList.remove('hide');
                        gameMenu.classList.add('hide');
                    } else if (puncts[setting.currentPunct].classList.contains('refer')) {
                        reference.classList.remove('hide');
                        gameMenu.classList.add('hide');
                    } else if (puncts[setting.currentPunct].classList.contains('record')) {
                        record();
                    } else if (puncts[setting.currentPunct].classList.contains('author')) {
                        author();
                    }
                }
            }
        } else if (!block_levels.classList.contains('hide')) {
            const levels_btns = document.querySelectorAll('.level');
            if (keyCode === 39) {
                for (let i = 0; i < levels_btns.length; i++) {
                    if (setting.currentBtn === i && levels_btns[i].classList.contains('chose_btn')) {
                        if (setting.currentBtn < levels_btns.length - 1) {
                            setting.currentBtn++;
                            levels_btns[i].classList.remove('chose_btn');
                        }
                    }
                }
                levels_btns[setting.currentBtn].classList.add('chose_btn');
                console.log('right');
            } else if (keyCode === 37) {
                for (let i = 0; i < levels_btns.length; i++) {
                    if (setting.currentBtn === i && levels_btns[i].classList.contains('chose_btn')) {
                        if (setting.currentBtn > 0) {
                            setting.currentBtn--;
                            levels_btns[i].classList.remove('chose_btn');
                        }
                    }
                }
                levels_btns[setting.currentBtn].classList.add('chose_btn');
                console.log('left')
            } else if (keyCode === 13 && gameMenu.classList.contains('hide')) {
                let btn = setting.currentBtn;
                if (btn === 0) {
                    setting.speed = levels.easy.speed;
                    setting.traffic = levels.easy.traffic;
                } else if (btn === 1) {
                    setting.speed = levels.norm.speed;
                    setting.traffic = levels.norm.traffic;
                } else if (btn === 2) {
                    setting.speed = levels.hard.speed;
                    setting.traffic = levels.hard.traffic;
                }
                levels.currentSpeed = setting.speed;
                block_levels.classList.add('hide');
                startGame();
            }
        }
        // console.log(keyCode);
    });

    document.body.addEventListener('mousemove', event => {
        const target = event.target;
        if (target.classList.contains('game-link')) {
            let puncts = document.querySelectorAll('.game-link');
            puncts.forEach(punct => {
                punct.classList.remove('focused')
            });
            target.classList.add('focused')
            switch (target.classList[1]) {
                case 'play':
                    setting.currentPunct = 0;
                    break;
                case 'sets':
                    setting.currentPunct = 1;
                    break;
                case 'refer':
                    setting.currentPunct = 2;
                    break;
                case 'record':
                    setting.currentPunct = 3;
                    break;
                case 'author':
                    setting.currentPunct = 4;
                    break;
                default:
                    break;
            }
        } else if (target.classList.contains('level')) {
            let levels = document.querySelectorAll('.level');
            levels.forEach(lvl => {
                lvl.classList.remove('chose_btn')
            });
            target.classList.add('chose_btn')
            switch (target.classList[1]) {
                case 'easy':
                    setting.currentBtn = 0;
                    break;
                case 'norm':
                    setting.currentBtn = 1;
                    break;
                case 'hard':
                    setting.currentBtn = 2;
                    break;
                default:
                    break;
            }
        }
    });

    document.body.addEventListener('keyup', event => {
        const keyCode = event.keyCode;
        // if (keyCode === 90) {
        //     setting.signal.pause();
        //     setting.signal.currentTime = 0;
        // }
    });

    // console.log('../../sdsd.jpg'.substring('../../sdsd.jpg'.lastIndexOf('/') + 1, '../../sdsd.jpg'.lastIndexOf('.')));

})();