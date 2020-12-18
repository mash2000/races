(function() {
    /******************************************* */
    //  Игра "Races"
    //  Автор: Ширшиков Максим
    //  Курсовая работа
    /******************************************* */
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
        btns_gameover = document.querySelector('.btns_gameover'),
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

        // Создание машины
        car = document.createElement('div');
    // Добавление мужного класса
    car.classList.add('car');

    // Рекорды игрока
    const records = JSON.parse(localStorage.getItem('records')) || {
        // Лучшие результаты
        bestRecord: {
            easy: 0,
            norm: 0,
            hard: 0
        },
        // Другие результаты
        otherRecords: {
            easy: [],
            norm: [],
            hard: []
        }
    };

    // Клавиши нажатия стрелок
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowRight: false,
        ArrowLeft: false
    };

    // Настройки игры
    const setting = {
        start: false,
        /* Запущена игра? */
        score: 0, // Очки
        engine: new Audio(), // Звук двигателя
        brake: new Audio(), // Звук тормоза
        crash: new Audio(), // Звук аварии
        acceleration: new Audio(), // Звук ускорение
        song: new Audio(), // Музыка в игре
        cars: ['enemy', 'enemy2'], // Вражеские машины
        sound: true, // Звук
        music: true, // Музыка
        traffic: 4, // Кол-во машин на дороге для спавна
        // Выбор автомобиля игрока
        vehicles: [
            { name: "Mersedes", maxSpeed: 28, vehicle: 'player', chose: true },
            { name: "Mitsubishi", maxSpeed: 24, vehicle: 'player2', chose: false },
        ],
        // Темы локации гонки
        themes: [
            { bg: "bg-1", name: "Лес", chose: true, color: "rgb(135, 206, 235)" },
            { bg: "bg-2", name: "Пустыня", chose: false, color: "rgb(0,0,0)" },
            { bg: "bg-3", name: "Киберпанк", chose: false, color: "rgb(34, 255, 0)" },
        ],
        smooth: 6, // Погрешность столкновения с другой машиной
        minSpeed: 2.5, // Минимальная скорость
        balance: 0, // Угол поворота авто игрока при повороте
        maxAngle: 5, // Максимальный угол поворота
        currentPunct: 0, // Текущий выбранный пункт меню
        currentBtn: 0, // Текущая выбранная кнопка уро
        margin: null, // Отступ между вражескими машинами
        speed: null // Начальная скорость
    };

    // Уровни сложности
    const levels = {
        // Легкий
        easy: {
            speed: 4,
            margin: 300
        },
        // Средний
        norm: {
            speed: 8,
            margin: 200
        },
        // Сложный
        hard: {
            speed: 12,
            margin: 100
        },
        traffic: 4, // Кол-во машин одновременно на дороге
        currentSpeed: null, // Текущая скорость
        maxSpeed: null // Максимальная скорость
    };

    // Сохранение результатов 
    const saveRecords = () => localStorage.setItem('records', JSON.stringify(records));

    // Определение кол-ва элементов на дороге
    function getQuantityElements(heightElement) {
        return document.documentElement.clientHeight / heightElement;
    }

    setting.song.src = './audio/main_theme.mp3'; // Подключение песни
    setting.song.loop = true; // Повтор музыки
    setting.song.autoplay = true; // Играть при загрузке страницы

    // Старт игры
    function startGame() {
        // Скрываем ненужные поля ->
        pause.classList.add('hide');
        gameArea.classList.remove('hide');
        gameover.classList.add('hide');
        start.classList.add('hide');
        intro.classList.add('hide');
        new_record.classList.add('hide');
        score.classList.remove('hide');
        // Скрываем ненудные поля <-
        gameArea.innerHTML = ''; // Очищаем игровое поле
        gameArea.style.opacity = '1'; // Появление игрового поля

        // Если игра окончена, скорость сбрасывается до начальной
        if (gameover.classList.contains('hide')) {
            levels.currentSpeed = setting.speed;
        }

        // Дорожная полоса
        for (let i = 0; i < getQuantityElements(100); i++) {
            // Создание белой полоски
            const line = document.createElement('div');
            line.classList.add('line');
            line.style.top = (i * 100) + 'px';
            line.style.left = (gameArea.offsetWidth / 2) - (line.offsetWidth / 2);
            line.y = i * 100;
            gameArea.appendChild(line);
        }

        // спавн автомобилей
        for (let i = 0; i < getQuantityElements(setting.margin / 2 * setting.traffic); i++) {
            // Создание вражеской машины
            const enemy = document.createElement('div');
            enemy.classList.add('enemy');
            enemy.y = -(Math.floor(setting.margin / 1.5 + Math.random() + car.offsetHeight * 1.5)) * setting.traffic * (i + 1) - (car.offsetHeight * 3);
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

        setting.engine.src = './audio/moving.mp3';
        setting.engine.loop = true;

        setting.brake.src = './audio/stop.mp3';
        setting.brake.loop = true;

        setting.crash.src = './audio/crash.mp3';

        setting.acceleration.src = './audio/acceleration.mp3';
        setting.acceleration.loop = true;

        setting.song.src = './audio/race_theme.mp3';

        if (setting.music) {
            setting.song.currentTime = 0;
            setting.song.play();
        } else {
            setting.song.pause();
        }

        requestAnimationFrame(playGame);
    }

    // Спидометр
    function speedMeter() {
        speedmetr.querySelector('.speedView').value = levels.currentSpeed.toFixed(1) * 10 + ' км/ч';
        speedmetr.querySelector('.moveSpeed').style.left = (levels.currentSpeed / levels.maxSpeed).toFixed(2) * 100 + '%';
    }

    // Задание начальной темы для гонок
    function theme() {
        let themes = setting.themes;
        themes.forEach(theme => {
            if (theme.chose) {
                game.style.backgroundImage = `url(./image/${theme.bg}.jpg)`;
            }
        })
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
            // Прокуртка фона для создания эффекта движения пространства
            game.style.backgroundPositionY = setting.score + 'px';
            // if (parseInt(game.style.backgroundPositionY) >= document.body.clientHeight) {
            //     game.style.backgroundPositionY = 0 + 'px'; // Заново, если фон прокрутился на максимум
            // }
            // Отслеживание левой стрелки
            if (keys.ArrowLeft && setting.x > 0) {
                // Поворот машины налево
                if (-setting.balance < setting.maxAngle) setting.balance -= 0.5;
                car.style.transform = `rotateZ(${setting.balance}deg)`;
                setting.x -= levels.currentSpeed / 2.5;
            }
            // Отслеживание правой стрелки
            if (keys.ArrowRight && setting.x < (gameArea.offsetWidth - car.offsetWidth)) {
                // Если достигнут максимальный угол - дальше не поворачиваем машину
                if (setting.maxAngle > setting.balance) setting.balance += 0.5;
                // Поворот направо
                car.style.transform = `rotateZ(${setting.balance}deg)`;
                setting.x += levels.currentSpeed / 2.5;
            }
            // Торможение машины
            if (keys.ArrowDown && setting.y < (gameArea.offsetHeight - car.offsetHeight)) {
                // Переменное уменьшение скорости, зависящее от текущей скорости авто
                if (levels.currentSpeed > setting.minSpeed) {
                    if (levels.currentSpeed > 10 && levels.currentSpeed <= 20) {
                        levels.currentSpeed -= 0.3;
                    } else if (levels.currentSpeed > 20) levels.currentSpeed -= 0.1;
                    else levels.currentSpeed -= 0.4;
                }
                // Начисляеться менье очков за торможение
                setting.score -= parseInt(levels.currentSpeed / 3);
                // Выключается звук мотора
                setting.engine.pause();
                // Включаются тормоза
                setting.brake.play();
            }
            // Если нажата стрелка вверх
            else if (keys.ArrowUp && setting.y > 0) {
                // Если не достигнута максимальная скорость
                if (levels.currentSpeed < levels.maxSpeed) {
                    // Постепенное увеличение скорости авто, зависящее от разгона машины
                    if (levels.currentSpeed > 10 && levels.currentSpeed <= 20) levels.currentSpeed += 0.05;
                    else if (levels.maxSpeed - levels.currentSpeed < 0.4) levels.currentSpeed += 0.001;
                    else if (levels.currentSpeed > 20) levels.currentSpeed += 0.01;
                    else {
                        levels.currentSpeed += 0.1;
                    }
                }
                // Начисление очков
                setting.score += parseInt(levels.currentSpeed);
                // Отключается звук мотора
                setting.engine.pause();
                // Включается звук разгона авто
                setting.acceleration.play();
            }
            // Если машина едет по инерции
            else if (!keys.ArrowUp && !keys.ArrowDown) {
                // Если скорость ниже нормальной
                if (levels.currentSpeed < setting.speed) levels.currentSpeed += 0.3;
                // Скорость выше нормальной
                else if (levels.currentSpeed > setting.speed) {
                    if (levels.currentSpeed > 10) levels.currentSpeed -= 0.02;
                    else if (levels.currentSpeed > 20) levels.currentSpeed -= 0.009;
                    else levels.currentSpeed -= 0.05;
                }
                setting.brake.pause(); // Выключение тормозов
                setting.acceleration.pause(); // Выключение ускорения
                setting.brake.currentTime = 0;
                setting.acceleration.currentTime = 0;
                setting.engine.play();
            }
            // Если машина не поворачивает, она возвращается в нормальное положение
            if (!keys.ArrowLeft && !keys.ArrowRight) {
                if (setting.balance < 0) {
                    setting.balance += 0.5;
                    car.style.transform = `rotateZ(${setting.balance}deg)`;
                } else if (setting.balance >= 0) {
                    setting.balance -= 0.5;
                    car.style.transform = `rotateZ(${setting.balance}deg)`;
                }
            }
            if (setting.score > setting.boost) {
                setting.boost *= 3;
                // setting.speed += 10;
            }
            car.style.left = setting.x + 'px';
            car.style.top = setting.y + 'px';
            requestAnimationFrame(playGame);
        } else {
            // Сброс всех ненужных звуков и сбрасывание времени аудиозаписей
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

    // Отслеживание отпускания стрелок
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

            // Если произошло ДТП
            if (carRect.top + sm <= enemyRect.bottom && carRect.right - sm >= enemyRect.left && carRect.left + sm <= enemyRect.right && carRect.bottom - sm >= enemyRect.top) {
                // Если уровень легкий
                if (setting.speed == levels.easy.speed) {
                    // Запись нового лучшего рекорда
                    if (setting.score > records.bestRecord.easy) {
                        new_record.classList.remove('hide');
                        records.otherRecords.easy.push(records.bestRecord.easy);
                        records.bestRecord.easy = setting.score;
                    } else {
                        records.otherRecords.easy.push(setting.score);
                    }
                }
                // Если уровень средний
                else if (setting.speed == levels.norm.speed) {
                    // Запись нового лучшего рекорда
                    if (setting.score > records.bestRecord.norm) {
                        new_record.classList.remove('hide');
                        records.otherRecords.norm.push(records.bestRecord.norm);
                        records.bestRecord.norm = setting.score;
                    } else {
                        records.otherRecords.norm.push(setting.score);
                    }
                }
                // Если уровень сложный
                else if (setting.speed == levels.hard.speed) {
                    // Запись нового лучшего рекорда
                    if (setting.score > records.bestRecord.hard) {
                        new_record.classList.remove('hide');
                        records.otherRecords.hard.push(records.bestRecord.hard);
                        records.bestRecord.hard = setting.score;
                    } else {
                        records.otherRecords.hard.push(setting.score);
                    }
                }
                saveRecords(); // Запись рекордов
                setting.crash.play(); // Звук аварии
                setting.start = false; // Игра окончена
                setting.song.src = './audio/main_theme.mp3';
                setting.song.pause(); // Выключение музыки
                mess.style.display = 'block'; // Повяление сообщение об сообщение
                score.classList.add('hide'); // Скрытие очков 
                start.classList.remove('hide'); // Скрытие игрового меню
                gameover.classList.remove('hide'); // Появление блока о проигрыше
                total_score.innerHTML = `Счёт: ${setting.score}`; // Вывод итого рещультата гонки
            }
            // Если тормозим, вражеские машины ускоряются
            if (keys.ArrowDown) {
                item.y -= setting.speed * 0.8;
            }
            // Если ускоряемся, догоняем вражеские авто
            else if (keys.ArrowUp) {
                item.y += Math.floor((setting.speed * 0.9));
            }
            // Едем с нормальной скоростью
            else {
                item.y += Math.floor((setting.speed * 0.3));
            }
            // Перемещения вражеской машины
            item.style.top = item.y + "px";

            // Если машина уезала за нижний край, то она спаунится наверху
            if (item.y >= document.documentElement.clientHeight) {
                item.y = -(Math.floor(100 + Math.random() + car.offsetHeight)) * setting.traffic;
                item.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - 50)) + 'px';
                item.style.background = `transparent url(./image/${setting.cars[Math.floor(Math.random()*setting.cars.length)]}.png) center / cover no-repeat`;
            }
        });
    }

    // Получение тем в меню
    function getBgs() {
        let bg = document.querySelector('.bgColor');
        bg.innerHTML = '';
        let themes = setting.themes;
        themes.forEach(theme => {
            let li = document.createElement('li');
            li.classList.add('color');
            let bxLi = document.createElement('div');
            bxLi.title = theme.name;
            bxLi.classList.add('boxColor');
            bxLi.style.backgroundImage = `url(../image/${theme.bg}.jpg)`;
            if (theme.chose) {
                bxLi.classList.add('choseColor');
                score.style.color = theme.color;
            }
            li.appendChild(bxLi);
            bg.appendChild(li);
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

    // Возвращение назад в меню
    function back(target) {
        if ((!target.parentNode.parentNode.classList.contains('intro') && setting.music) || (target.parentNode.classList.contains('levels') && setting.song.paused && setting.music)) {
            setting.song.src = './audio/main_theme.mp3';
            setting.song.play();
        }
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

    // Выход в главное меню
    function exit() {
        gameArea.classList.add('hide');
        pause.classList.add('hide');
        gameMenu.classList.remove('hide');
        start.classList.remove('hide');
        block_levels.classList.add('hide');
        intro.classList.remove('hide');
        if (setting.music) {
            setting.song.src = './audio/main_theme.mp3';
            setting.song.play();
        }
    }

    // Блок рекорды
    function record() {
        results.classList.remove('hide');
        gameMenu.classList.add('hide');
        let best = JSON.parse(localStorage.getItem('records')).bestRecord;
        let res = document.querySelectorAll('.result');
        // Вывод лучших результатов
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
                setting.margin = levels.easy.margin;
            } else if (target.classList.contains('norm')) {
                setting.speed = levels.norm.speed;
                setting.margin = levels.norm.margin;
            } else if (target.classList.contains('hard')) {
                setting.speed = levels.hard.speed;
                setting.margin = levels.hard.margin;
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
    });

    // Нажатие стрелок
    document.addEventListener('keydown', startRun);
    // Отпускание стрелок
    document.addEventListener('keyup', stopRun);

    // Рестарт игры
    btn_replay.addEventListener('click', startGame);
    // Выход в меню
    btn_exit.addEventListener('click', exit);
    // Выбор уровня в меню "Проигрыша"
    btn_choose.addEventListener('click', () => {
        gameover.classList.add('hide');
        start.classList.remove('hide');
        intro.classList.remove('hide');
        gameMenu.classList.remove('hide');
        block_levels.classList.remove('hide');
        gameMenu.classList.add('hide');
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
            getCars();
        }
    });

    // Отслеживание нажатий клавиш
    document.body.addEventListener('keydown', event => {
        event.preventDefault();
        const keyCode = event.keyCode;
        // Пауза
        if (keyCode === 27) {
            if (start.classList.contains('hide')) {
                pause.classList.toggle('hide');
                setting.start = !setting.start;
                setting.song.pause();
                if (setting.start) {
                    playGame();
                    if (setting.music) setting.song.play();
                }
            }
            // Возвращение назад из блока "проиграл"
            else if (!gameover.classList.contains('hide')) {
                back(gameover.querySelector('.back'));
                intro.classList.remove('hide');
            }
            // Выход из пункта авторы в главное меню
            else if (!authors.classList.contains('hide')) {
                authors.classList.add('hide');
                gameMenu.classList.remove('hide');
                sound.classList.remove('hide');
                music.classList.remove('hide');
            }
            // Возвращает назад, если в блоке имеется кнопка "назад"
            else {
                let backs = document.querySelectorAll('.back');
                backs.forEach(bck => {
                    if (!bck.parentNode.classList.contains('hide')) {
                        back(bck)
                    }
                })
            }
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
        // Если находимся в главном меню
        if (!gameMenu.classList.contains('hide')) {
            const puncts = document.querySelectorAll('.game-link');
            // Стрелка вниз (перемещаемся по меню вниз)
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
            }
            // Стрелка вверх (перемещаемся по меню вверх)
            else if (keyCode === 38) {
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
            }
            // Клавиша "Enter" (Выбор нужного пункта меню)
            else if (keyCode === 13) {
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
        }
        // Находимся в меню "Выбор уровня сложности"
        else if (!block_levels.classList.contains('hide')) {
            const levels_btns = document.querySelectorAll('.level');
            // Стрелка вправо (Выбор уровня сложности)
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
            }
            // Стрелка влево (Выбор уровня сложности)
            else if (keyCode === 37) {
                for (let i = 0; i < levels_btns.length; i++) {
                    if (setting.currentBtn === i && levels_btns[i].classList.contains('chose_btn')) {
                        if (setting.currentBtn > 0) {
                            setting.currentBtn--;
                            levels_btns[i].classList.remove('chose_btn');
                        }
                    }
                }
                levels_btns[setting.currentBtn].classList.add('chose_btn');
            }
            // Клавиша "Enter" (Выбор нужного уровня)
            else if (keyCode === 13 && gameMenu.classList.contains('hide')) {
                let btn = setting.currentBtn;
                if (btn === 0) {
                    setting.speed = levels.easy.speed;
                    setting.traffic = levels.traffic;
                    setting.margin = levels.easy.margin;
                } else if (btn === 1) {
                    setting.speed = levels.norm.speed;
                    setting.traffic = levels.traffic;
                    setting.margin = levels.norm.margin;
                } else if (btn === 2) {
                    setting.speed = levels.hard.speed;
                    setting.traffic = levels.traffic;
                    setting.margin = levels.hard.margin;
                }
                levels.currentSpeed = setting.speed;
                block_levels.classList.add('hide');
                startGame();
            }
        }
        // Находимся в блоке "Проиграл"
        if (!gameover.classList.contains('hide')) {
            const btns = btns_gameover.querySelectorAll('.btn');
            // Клавиша "Enter" (Выбор нужной кнопки)
            if (keyCode === 13) {
                btns.forEach(btn => {
                    if (btn.classList.contains('chose_btn')) {
                        if (btn.classList.contains('btn_replay')) {
                            startGame();
                        } else if (btn.classList.contains('btn_choose')) {
                            gameover.classList.add('hide');
                            block_levels.classList.remove('hide');
                            intro.classList.remove('hide');
                            gameMenu.classList.add('hide');
                        }
                    }
                });
            }
            // Влево
            else if (keyCode === 37) {
                btns.forEach(btn => {
                    btn.classList.remove('chose_btn');
                });
                btn_replay.classList.add('chose_btn');
            }
            // Вправо
            else if (keyCode === 39) {
                btns.forEach(btn => {
                    btn.classList.remove('chose_btn');
                });
                btn_choose.classList.add('chose_btn');
            }
        }
        // Если пауза в игре
        if (!pause.classList.contains('hide')) {
            // ВЫходим из игры
            if (keyCode === 13) exit();
        }
        // console.log(keyCode);
    });

    // Событие при наведении на кнопки/пункты меню
    document.body.addEventListener('mousemove', event => {
        const target = event.target;
        // Навелись на пункт меню
        if (target.classList.contains('game-link')) {
            let puncts = document.querySelectorAll('.game-link');
            // Сбрасываем фокус
            puncts.forEach(punct => {
                punct.classList.remove('focused')
            });
            // Добавляем фокус на нужный пункт
            target.classList.add('focused')
                // Обозначение текузего выбранного пункта
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
        }
        // Находимся в блоке "ВЫбор уровня"
        else if (target.classList.contains('level')) {
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
        } else if (target.classList.contains('btn')) {
            if (!gameover.classList.contains('hide')) {
                const btns = btns_gameover.querySelectorAll('.btn');
                // Влево
                if (target.classList.contains('btn_replay')) {
                    btns.forEach(btn => {
                        btn.classList.remove('chose_btn');
                    });
                    btn_replay.classList.add('chose_btn');
                }
                // Вправо
                else if (target.classList.contains('btn_choose')) {
                    btns.forEach(btn => {
                        btn.classList.remove('chose_btn');
                    });
                    btn_choose.classList.add('chose_btn');
                }
            }
        }
    });

})();