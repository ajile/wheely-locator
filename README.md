# Приложение для Wheely

Описание тестового задания находится по [ссылке](https://docs.google.com/document/d/1KIK4OkFjJ7i2lUGPwM-Yl8-NEJuIevm8NtkNz5xD6B8/edit).

![Screenshot](http://dl1.joxi.net/drive/0005/0189/340157/141016/e433781e49.jpg)

## Установка

Клонируем себе: `git clone git@github.com:ajile/wheely-locator.git`. 
Переходим в созданную директорию `cd wheely-locator`.

Подтягиваем зависимости ноды:
```
npm install
```

Подтягиваем зависимости боуера:
```
bower install
```

Собираем клиентскую часть:
```
grunt build
```

Запускаем сервер:
```
grunt connect
```

Одной командой:
```
npm install && bower install && grunt build && grunt connect
```

Сервис станет доступен по адресу: `127.0.0.1:3000`.


## Проблемы и способы их решения

1. Объект `App.ConnectionProxy` не может определить причину обрыва соединения, то ли пользователь не подошел, то ли сервер просто недоступен. HTTP статусы средствами WebSocket проверить нет возможности.


## Краткий todo

1. Вытащить все из App в ApplicationController

2. Закончить комментировать код (JSDoc)

3. Организовать код в соотв. с http://www.ember-cli.com/

4. Начать слушаться событий online и offline
