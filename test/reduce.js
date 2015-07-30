/*jshint -W030 */
import 'should';
import r from 'rethinkdb';
import * as utils from './utils';

describe('Reduce', function () {

  before(function (done) {
    this.timeout(7500);
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
  it('should get the total population for all countries (without using `sum`)', function (done) {
    // HINT: You'll need to use the `map` term
    r.table('countries')
       // Your code here...
      .run(r.conn)
      .then(function (result) {
        result.should.be.a.Number;
        result.should.be.greaterThan(6000000000);
        return true;
      })
      .nodeify(function (err, res) {
        console.log(err, res);
        done(err, res);
      });
  });

  // #2
  it('should get the number of countries (using `reduce` and not `count`)', function (done) {
    // HINT: You'll need to use the `map` term
    // HINT: It's easier than you think
    r.table('countries')
      // Your code here...
     .run(r.conn)
      .then(function (result) {
        return r.table('countries').count().run(r.conn)
        .then(function (count) {
          result.should.be.a.Number;
          count.should.equal(result);
          return true;
        });
      })
      .nodeify(function (err, res) {
        console.log(err, res);
        done(err, res);
      });
  });

  // #3 (Optional)
  xit('should find whether any country has the substring `ze` (using `reduce` and without using `count`)', function (done) {
    // HINT: You'll need to use the `match` term
    // http://rethinkdb.com/api/javascript/match/
    // HINT: The `map` function should return a boolean
    // HINT: You'll need to use the `branch` term
    // http://rethinkdb.com/api/javascript/branch/
    r.table('countries')
      // Your code here..
      .run(r.conn)
      .then(function (result) {
        result.should.be.a.Boolean;
        result.should.equal(true);
      })
      .nodeify(function (err, res) {
        console.log(err, res);
        done(err, res);
      });
  });

});
