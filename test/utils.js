import r from 'rethinkdb';
import Promise from 'bluebird';

export function makeCreateDatabase (dbName) {
  return function (done) {
    return r.connect().then((conn) => {
      return Promise.resolve()
        .then(() => {
          return r.dbCreate(dbName).run(conn)
            .catch((err) => { });
        })
        .then(() => {
          return Promise.all([
            r.db(dbName).tableCreate('cities').run(conn),
            r.db(dbName).tableCreate('countries', { primaryKey: 'name' }).run(conn)
          ])
            .catch((err) => { });
        });
    });
  };
}

export function makeInsertSampleData (dbName) {
  return function (done) {
    return r.connect().then(function (conn) {
      return new Promise.resolve()
        .then(function () {
          return Promise.all([
            r.db(dbName).table('countries')
              .insert(r.json(r.http(
                'https://raw.githubusercontent.com/thejsj/sample-data/master/data/countries.json'
              ))).run(conn),
            r.db(dbName).table('cities')
              .insert(r.json(r.http(
                'https://raw.githubusercontent.com/thejsj/sample-data/master/data/urban-areas.json'
              ))).run(conn)
          ]);
        })
        .finally(function () { conn.close(); });
    });
  };
}

export function makeDropDatabase (dbName, tableName) {
  return function () {
    return r.connect().then(function (conn) {
      return new Promise.resolve()
        .then(function () {
          return r.db(dbName).tableDrop('countries').run(conn);
        })
        .then(function () {
          return r.db(dbName).tableDrop('cities').run(conn);
        })
        .finally(() => conn.close());
    });
  };
}

export const dbName = 'test';
export const createDatabase = makeCreateDatabase(dbName);
export const insertSampleData = makeInsertSampleData(dbName);
export const dropDatabase = makeDropDatabase(dbName);
