/*jshint -W030 */
import 'should';
import r from 'rethinkdb';
import * as utils from './utils';

describe('Reduce', function () {

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
  it('should get the total population for all countries (without using `sum`)', function (done) {
    r.table('test_driven_reql')
      .map(function (row) {
        return row('population');
      })
      .reduce(function (left, right) {
        return left.add(right);
      })
      .run(r.conn)
      .then(function (result) {
        result.should.be.a.Number;
        result.should.be.greaterThan(6000000000);
      })
      .nodeify(done);
  });

  // #2
  it('should get the number of countries (using `reduce` and not `count`)', function (done) {
    r.table('test_driven_reql')
      .map(function (row) {
        return 1;
      })
      .reduce(function (left, right) {
        return left.add(right);
      })
      .run(r.conn)
      .then(function (result) {
        return r.table('test_driven_reql').count().run(r.conn)
        .then(function (count) {
          result.should.be.a.Number;
          count.should.equal(result);
          return true;
        });
      })
      .nodeify(done);
  });

  // #3
  it('should find whether any country has the substring `ze` (using `reduce` and without using `count`)', function (done) {
    r.table('test_driven_reql')
      .map(function (row) {
        return row('name').match('ze').ne(null);
      })
      .reduce(function (left, right) {
        return r.branch(
          left.or(right),
          true,
          false
        );
      })
      .run(r.conn)
     .then(function (result) {
       result.should.be.a.Boolean;
       result.should.equal(true);
     })
     .nodeify(done);
  });

});
