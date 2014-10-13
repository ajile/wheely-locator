# Тестовое задание для Wheely

ТЗ здесь: https://docs.google.com/document/d/1KIK4OkFjJ7i2lUGPwM-Yl8-NEJuIevm8NtkNz5xD6B8/edit

Команды для запуска:

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


# Пытаюсь разобраться

http://emberjs.com/guides/routing/defining-your-routes/#toc_initial-routes
1. Нужно создать базовый класс Контроллера, который будет содержать информацию о пользователе


2. Нужно создать простенький ACL

http://emberjs.com/guides/routing/defining-your-routes/#toc_initial-routes
3. Нужно создать Роутер, который будет смотреть в ACL и перебразывать пользователя на экран авторизации если он не залогинен

4. Создать адаптер и стратегию отвечающие за получение данных по HTTP или прямо из Storage (http://www.html5rocks.com/en/tutorials/offline/storage/?redirect_from_locale=ru или http://diveintohtml5.info/storage.html). Проверить поддержку браузеров. Согласовать поддержку браузеров для WebSocket, Location, Storage. Свести в таблицу требований к браузерам.

5. Декомпозировать библиотеку на публичные репы - влияет на карму :)

6. Привести комментарии к модулям, неймспейсам, классам, функциям, переменным, методам и т.п. в соотв. с DocComment

7. Реализовать коллекцию точек координат по принципу FIFO (First In, First Out)
