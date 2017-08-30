// Подключаемые модули
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Настройка Монгуза

mongoose.connect('mongodb://127.0.0.1:27017/tasklist', { useMongoClient: true });

mongoose.connection.on('error', () => {
  console.log('Ошибка подключения Монгуза')
  });
mongoose.connection.on('open', () => {
  console.log('Подключение к монго произошло успешно!');
});
mongoose.connection.on('disconnected', () => {
  console.log('Монгуз отключен');
});

const Schema = mongoose.Schema;

// схема для Пользователей
const userSchema = new Schema({
  name : { type: String, index: { unique: true }}
});

const  User = mongoose.model('User', userSchema);

// схема для задач
const taskSchema = new Schema(
  //название, описание, открыта/закрыта, пользователь
  {
  name : String,
  description: String,
  open: {type: Boolean, "default": true},
  user: String
});

const  Task = mongoose.model('Task', taskSchema);

app.use(bodyParser.urlencoded({ extended: true }));

// API пользователей ====================================================

//список, добавление, редактирование, удаление
//список всех пользователей
app.get('/v1/user', function(req, res) {
  User.find({}, (err, result) => {
    if (err) {
      console.log(err);
    } else if (result.length) {
      console.log('Исходная коллекция: ', result);
      res.json(result);
    } else {
      res.json('Нет документов с данным условием поиска');
      console.log('Нет документов с данным условием поиска');
    }
  });
});

//добавление пользователя
app.post('/v1/user', function(req, res) {
  if (!req.body.name) {
    res.status(400);
    res.send({ error: 'Имя не указано' });
  }

  User.create({name : req.body.name}, (err, result) => {
    if (err) {
      console.log('Ошибка добавления', err)
    } else{
      console.log('Пользователь добавлен', result);
      res.json(result);
    }
  });
});

//Редактирование пользователя
app.put('/v1/user', function(req, res) {
  if (!req.body.name && !req.body.newName) {
    res.status(404);
    res.send({ error: 'Нечего менять' });
  };

  User.update(
    {name : req.body.name},
    {$set: {name : req.body.newName}},
    (err, doc) => {
      if (err) {
        console.log('Ошибка редактирования', err)
      } else{
        console.log('Имя пользователя изменено', doc);
        res.json('Имя пользователя изменено');
      }
    }
  )
});

//Удаление пользователя
app.delete('/v1/user', function(req, res) {
  if (!req.body.name) {
    res.status(404);
    res.send({ error: 'Не задано имя или номер' });
  }

  User.remove({name : req.body.name}, (err, doc) => {
    if (err) {
      console.log('Ошибка удаления', err)
    } else{
      console.log('Пользователь удален');
      res.json('Пользователь ' + req.body.name +  ' удален');
    }
  });
});

// API Задач ====================================================

//список, добавление, редактирование, удаление
// список всех задач
app.get('/v1/tasks', function(req, res) {
  Task.find({}, (err, result) => {
    if (err) {
      console.log(err);
    } else if (result.length) {
      console.log('Исходная коллекция: ', result);
      res.json(result);
    } else {
      res.json('Нет задач с данным условием поиска');
      console.log('Нет задач с данным условием поиска');
    }
  });
});

// добавление новой задачи
app.post('/v1/task', function(req, res) {
  if (!req.body.name && !req.body.description && !req.body.user) {
    res.status(400);
    res.send({ error: 'Данные указаны не полностью' });
  }

  Task.create({
    name : req.body.name,
    description: req.body.description,
    user: req.body.user
  }, (err, result) => {
    if (err) {
      console.log('Ошибка добавления', err)
    } else{
      //console.log('Задача добавлена', result);
      res.json(result);
    }
  });
});

// редактирование задачи.
app.put('/v1/task', function(req, res) {

  if (!req.body.name && !req.body.newName &&
      !req.body.description && !req.body.newDescription &&
      !req.body.user && !req.body.newUser &&
      !req.body.open) {
    res.status(404);
    res.send({ error: 'Нечего менять' });
  } else {
    console.log('Данные для изменения задачи получены');
  }

  let responseMessage = {
    body: 'Имя задачи изменено',
    description: 'Описание задачи изменено',
    user: 'Пользователь задачи изменен',
    open: 'Статус задачи изменен'
  };

  if (req.body.name && req.body.newName) {
    Task.update(
      {name: req.body.name},
      {'$set': {name: req.body.newName}},
      (err, result) => {
        if (err) {
          console.log('Ошибка изменения имени задачи', err)
        } else{
          res.json(responseMessage.body);
          console.log('Имя задачи изменено', result);
        }
      }
    );
  }

  if (req.body.description && req.body.newDescription) {
    Task.update(
      {description: req.body.description},
      {'$set': {description: req.body.newDescription}},
      (err, result) => {
        if (err) {
          console.log('Ошибка изменения описания задачи', err)
        } else{
          res.json(responseMessage.description);
          console.log('Описание задачи изменено', result);
        }
      }
    );
  }

  if (req.body.user && req.body.newUser) {
    Task.update(
      {user: req.body.user},
      {'$set': {user: req.body.newUser}},
      (err, result) => {
        if (err) {
          console.log('Ошибка изменения пользователя задачи', err)
        } else{
          res.json(responseMessage.user);
          console.log('Пользователь задачи изменен', result);
        }
      }
    );
  }

  if (req.body.name && req.body.description && req.body.open) {
    Task.update(
      {name: req.body.name, description: req.body.description},
      {'$set': {open: req.body.open}},
      (err, result) => {
        if (err) {
          console.log('Ошибка изменения статуса пользователя задачи', err)
        } else {
          res.json(responseMessage.open);
          console.log('Статус задачи изменен', result);
        }
      }
    );
  }


});

// удаление задачи
app.delete('/v1/task', function(req, res) {
  Task.remove({
    name: req.body.name,
    description: req.body.description,
    user: req.body.user},
    (err, result) => {
      if (err) {
        console.log('Ошибка удаления задачи', err)
      } else {
        console.log('Задача '+ req.body.name + ' удалена');
        res.send('Задача \"'+ req.body.name + '\" удалена');
    }
  });
});

// Поиск по задаче
app.post('/v1/tasksearch', function(req, res) {
  if (!req.body.name && !req.body.description) {
    res.status(400);
    res.send({ error: 'Данные указаны не полностью' });
  }

  Task.find(
    {$or:
      [
        {name: req.body.name},
        {description: req.body.description}
      ]
    },
    (err, result) => {
      if (err) {
        console.log(err);
      } else if (result.length) {
        console.log('Исходная коллекция: ', result);
        res.json(result);
      } else {
        res.json('Нет задач с данным условием поиска');
        console.log('Нет задач с данным условием поиска');
      }
  });
});
// Статистика выполненных задач ====================================================

app.get('/v1/stat', function(req, res) {
  Task.aggregate(
    [
      {
        $match: { "open" : false }
      },
       {
         $project: { _id: 0, user: 1, open: 1, count: {$add: [1]} }
       },
       {
         $group: {_id: "$user", doneTaskCounter: {$sum: "$count"}}
        },
      {
        $sort: {doneTaskCounter: -1}
      }
    ], (err, result) => {
      if (err) {
        console.log(err);
      } else if (result.length) {
        console.log('Исходная коллекция: ', result);
        res.json(result);
      } else {
        res.json('Нет задач с данным условием поиска');
        console.log('Нет задач с данным условием поиска');
      }
    });
});


// Перехват ошибок ====================================================
app.use(function(req, res, next){
  res.status(404);
  res.send({ error: 'Not found' });
});
app.use(function(err, req, res, next){
  res.status(err.status || 500);
});

// Запускаем сервер ====================================================
app.listen(3000, function () {
  console.log('Сервер запущен и слушает порт 3000!');
});
