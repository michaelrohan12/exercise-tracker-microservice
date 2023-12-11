# Exercise Tracker

This is the boilerplate code for the Exercise Tracker Microservice project.

- POST to /api/users with form data username to create a new user and the returned response from POST /api/users with form data username will be an object with username and \_id properties.
- GET request to /api/users to get a list of all users and returns an array.
- Each element in the array returned from GET /api/users is an object literal containing a user's username and \_id.
- POST to /api/users/:\_id/exercises with form data description, duration, and optionally date.
- If no date is supplied, the current date will be used.
- The response returned from POST /api/users/:\_id/exercises will be the user object with the exercise fields added.
- GET request to /api/users/:\_id/logs to retrieve a full exercise log of any user.
- A request to a user's log GET /api/users/:\_id/logs returns a user object with a count property
  representing the number of exercises that belong to that user.
- A GET request to /api/users/:\_id/logs will return the user object with a log array of all the exercises added.
- Each item in the log array that is returned from GET /api/users/:\_id/logs is an object
  that has a description, duration, and date properties
- The description property of any object in the log array that is returned from GET /api/users/:\_id/logs is a string.
- The duration property of any object in the log array that is returned from GET /api/users/:\_id/logs is a number.
- The date property of any object in the log array that is returned from GET /api/users/:\_id/logs is a string.
- We can add from, to and limit parameters to a GET /api/users/:\_id/logs request to retrieve part of the log of any user,
  from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.

## API Reference

#### POST form data username to create a new user, response of object with username and \_id properties.

```http
  POST /api/users
```

| Parameter           | Type     | Description                                                               |
| :------------------ | :------- | :------------------------------------------------------------------------ |
| `req.body.username` | `string` | user name of new user and return object with username and \_id properties |

#### Get list of all users, response of object literal containing a user's username and \_id.

```http
  GET /api/users
```

| Parameter | Type | Description                                                                                                          |
| :-------- | :--- | :------------------------------------------------------------------------------------------------------------------- |
| -         | -    | Return an array where each element in the array returned is an object literal containing a user's username and \_id. |

#### POST exercise details to existing user's exercise list

```http
  POST /api/users/:_id/exercises
```

| Parameter                                                                | Type                            | Description                                             |
| :----------------------------------------------------------------------- | :------------------------------ | :------------------------------------------------------ |
| `form data description, duration, and optionally date and req.params.id` | String, Number, Date and String | Returns the user object with the exercise fields added. |

#### GET full exercise logs of any user in the database

```http
  GET  /api/users/:_id/logs
```

| Parameter                                                                       | Type                          | Description                                                                                                                                                                                                                                              |
| :------------------------------------------------------------------------------ | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `req.params.id, Optionally -> req.query.from, req.query.to and req.query.limit` | String, Date, Date and Number | Returns a user object with a count property representing the number of exercises that belong to that user and user object with a log array of all the exercises added. Optional Parameters can be used to get a particular time period and limit of logs |

## Response Structure

Exercise:

```javascript
{
  username: "fcc_test",
  description: "test",
  duration: 60,
  date: "Mon Jan 01 1990",
  _id: "5fb5853f734231456ccb3b05"
}
```

User:

```javascript
{
  username: "fcc_test",
  _id: "5fb5853f734231456ccb3b05"
}
```

Log:

```javascript
{
  username: "fcc_test",
  count: 1,
  _id: "5fb5853f734231456ccb3b05",
  log: [{
    description: "test",
    duration: 60,
    date: "Mon Jan 01 1990",
  }]
}
```
