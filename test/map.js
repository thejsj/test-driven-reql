/*jshint -W030 */
import 'should';
import r from 'rethinkdb';
import * as utils from './utils';

describe('Map', function () {

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
      .catch(function (err) {
        console.log('ERROR@!@@@', err);
        throw err;
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
  it('should map all rows to the `population` property from each document', function (done) {
    r.table('countries')
      .map(function (row) {
        return row('population');
      })
      .coerceTo('array')
      .run(r.conn)
     .then(function (result) {
       Array.isArray(result).should.be.true;
       result[0].should.be.a.Number;
     })
     .nodeify(done);
  });

  // #2
  it('should map all rows to an array with `name` and `population` from each document', function (done) {
    r.table('countries')
      .map(function (row) {
        return [row('name'), row('population')];
      })
      .coerceTo('array')
      .run(r.conn)
     .then(function (result) {
       Array.isArray(result).should.be.true;
       Array.isArray(result[0]).should.be.true;
       result[0][0].should.be.a.Number;
       result[0][1].should.be.a.Number;
       result.sort((a, b) => b[1] - a[1])[0][1].should.be.greaterThan(1000000000);
     })
     .nodeify(done);
  });

  // #3
  it('should map the result of dividing `population` by `percentage_of_population`', function (done) {
    r.table('countries')
      .map(function (row) {
        return row('population').div(row('percentage_of_population').coerceTo('number'));
      })
      .coerceTo('array')
      .run(r.conn)
     .then(function (result) {
       Array.isArray(result).should.be.true;
       result[0].should.be.a.Number;
       result.every(function (row) {
         return row > (6000000000 / 100);
       }).should.be.True;
     })
     .nodeify(done);
  });

});
