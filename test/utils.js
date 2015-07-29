import r from 'rethinkdb';

export function makeCreateDatabase (dbName, tableName) {
  return function (done) {
    return r.connect().then((conn) => {
      return Promise.resolve()
        .then(() => {
          return r.dbCreate(dbName).run(conn)
            .catch((err) => { });
        })
        .then(() => {
          return r.db(dbName).tableCreate(tableName).run(conn)
            .catch((err) => { });
        });
    });
  };
}

export function makeInsertSampleData (dbName, tableName) {
  return function (done) {
    return r.connect().then((conn) => {
      return r.db(dbName).table(tableName)
        .insert(r.json(r.http(
          'https://raw.githubusercontent.com/thejsj/sample-data/master/data/countries.json'
        ))).run(conn);
    });
  };
}

export function makeDropDatabase (dbName, tableName) {
  return function () {
    return r.connect().then((conn) => {
      return r.db(dbName).tableDrop(tableName).run(conn)
        .finally(() => conn.close());
    });
  };
}

export const dbName = 'test';
export const tableName = 'test_driven_reql';
export const createDatabase = makeCreateDatabase(dbName, tableName);
export const insertSampleData = makeInsertSampleData(dbName, tableName);
export const dropDatabase = makeDropDatabase(dbName, tableName);
