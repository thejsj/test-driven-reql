/*jshint -W030 */
import 'should';
import r from 'rethinkdb';
import * as utils from './utils';

var closeCursorAndConn = function (cursor, conn) {
  return cursor.close()
   .then(function () {
    return conn.close();
   });
};

describe('Changefeeds', function () {

  before(function (done) {
    this.timeout(5000);
    return utils.createDatabase()
      .then(utils.insertSampleData)
      .then(() => {
        // Connect to the database
        return r.connect().then((conn) => {
          r.conn = conn;
          return;
        });
      })
      .nodeify(done);
  });

  after((done) => {
    return utils.dropDatabase()
     .then(() => {
       return r.conn.close();
     })
     .nodeify(done);
  });

   // #1
  it('should listen for changes in the `countries` table', function (done) {
    var count = 0, results = [];
    // HINT: You'll need to use `changes` and understand cursors
    // http://rethinkdb.com/api/javascript/changes/
    // http://rethinkdb.com/api/javascript/each/ (Already written)
    r.table('countries')
      // Your code here...
      .run(r.conn)
      .then(function (cursor) {
        cursor.each(function (err, row) {
          count++;
          results.push(row);
        });
      })
      .then(function () {
        return Promise.all([
          r.table('countries').insert({ name: 'nono', pop: 1 }).run(r.conn),
          r.table('countries').insert({ name: 'yesyes', pop: 200 }).run(r.conn)
        ])
        .then(function () {
          setTimeout(function () {
            count.should.equal(2);
            results.should.be.instanceOf(Array);
            results = results.sort((a, b) => a.new_val.pop - b.new_val.pop);
            results[0].new_val.name.should.equal('nono');
            results[1].new_val.name.should.equal('yesyes');
            done();
          }, 50); // Hopefully, this is enough
        });
      });
  });

  // #2
  it('should listen for changes in the `countries` table, but only return the `new_val`', function (done) {
    var count = 0, results = [], cursor;
    // HINT: You'll need to write the query after `.changes`
    r.connect().then((conn) => {
    return r.table('countries')
      // Your code here...
      .then(function (_cursor) {
        cursor = _cursor;
        cursor.each(function (err, row) {
          count++;
          results.push(row);
        });
      })
      .then(function () {
        return Promise.all([
          r.table('countries').insert({ name: 'nonono', pop: 1 }).run(conn),
          r.table('countries').insert({ name: 'yesyesyes', pop: 200 }).run(conn),
      ]);
    })
      .then(function () {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            count.should.equal(2);
            results.should.be.instanceOf(Array);
            results = results.sort((a, b) => a.pop - b.pop);
            results[0].name.should.equal('nonono');
            results[1].name.should.equal('yesyesyes');
            resolve();
          }, 50); // Hopefully, this is enough
        });
      })
      .then(function () {
        return closeCursorAndConn(cursor, conn);
      })
      .nodeify(done);
    });
  });

  // #3
  it('should listen for changes in the `countries` table, but only listen for countries named `Cascadia`', function (done) {
    var count = 0, results = [], cursor;
    // HINT: You'll need to write the query before `.changes`
    r.connect().then((conn) => {
    return r.table('countries')
      // Your code here...
      .then(function (_cursor) {
        cursor = _cursor;
        cursor.each(function (err, row) {
          count++;
          results.push(row);
        });
      })
      .then(function () {
        return Promise.all([
          r.table('countries').insert({ name: 'California', pop: 1 }).run(conn),
          r.table('countries').insert({ name: 'Cascadia', pop: 200 }).run(conn),
      ]);
    })
      .then(function () {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            count.should.equal(1);
            results.should.be.instanceOf(Array);
            results[0].new_val.name.should.equal('Cascadia');
            resolve();
          }, 50); // Hopefully, this is enough
        });
      })
      .then(function () {
        return closeCursorAndConn(cursor, conn);
      })
      .nodeify(done);
    });
  });

  // #4 (Optional)
  xit('should listen for changes in the `countries` table, but only listen for countries with a population over 1000 and only get its population', function (done) {
    var count = 0, results = [], cursor;
    // HINT: You'll need to pass an anonymous function to `filter`
    r.connect().then((conn) => {
    return r.table('countries')
       // Your code here...
      .then(function (_cursor) {
        cursor = _cursor;
        cursor.each(function (err, row) {
          // Your code here..
        });
      })
      .then(function () {
        return Promise.all([
          r.table('countries').insert({ name: 'SomeCountryName', population: 1 }).run(conn),
          r.table('countries').insert({ name: 'Transylvania', population: 2000 }).run(conn),
          r.table('countries').insert({ name: 'Hong Kong', population: 1500 }).run(conn),
          r.table('countries').insert({ name: 'Bavaira', population: 98 }).run(conn),
      ]);
    })
      .then(function () {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            count.should.equal(2);
            results.should.be.instanceOf(Array);
            results = results.sort((a, b) => a.new_val.population - b.new_val.population);
            results[0].new_val.population.should.equal(1500);
            results[1].new_val.population.should.equal(2000);
            results[0].new_val.should.not.have.property('name');
            results[1].new_val.should.not.have.property('name');
            resolve();
          }, 50); // Hopefully, this is enough
        });
      })
      .then(function () {
        return closeCursorAndConn(cursor, conn);
      })
      .nodeify(done);
    });
  });



});
