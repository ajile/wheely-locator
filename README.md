# Тестовое задание для Wheely

ТЗ здесь: https://docs.google.com/document/d/1KIK4OkFjJ7i2lUGPwM-Yl8-NEJuIevm8NtkNz5xD6B8/edit

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

Если нужна документация:
```
grunt jsdoc
```

Запускаем сервер:
```
grunt connect
```

Одной командой:
```
npm install && bower install && grunt build && grunt connect
```


## Проблемы и способы их решения

1. Объект `App.ConnectionProxy` не может определить причину обрыва соединения, то ли пользователь не подошел, то ли сервер просто недоступен. HTTP статусы средствами WebSocket проверить нет возможности.


## Краткий todo

1. Закончить комментировать код (JSDoc)

2. Вытащить все из App в ApplicationController

3. Организовать код в соотв. с http://www.ember-cli.com/

4. Начать слушаться событий online и offline
