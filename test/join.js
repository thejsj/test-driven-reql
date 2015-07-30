/*jshint -W030 */
import 'should';
import r from 'rethinkdb';
import * as utils from './utils';

describe('Join', function () {

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
  it('should join each city to its respective country using `zip`', function (done) {
    // HINT: You'll need to use the `eqJoin` and `zip` terms
    // http://rethinkdb.com/api/javascript/eq_join/
    // http://rethinkdb.com/api/javascript/zip/
    r.table('cities')
       // Your code here...
      .coerceTo('array')
      .run(r.conn)
      .then(function (result) {
        Array.isArray(result).should.be.True;
        result.every(function (row) {
          row.should.have.property('country');
          row.should.have.property('name');
          row.should.have.property('area');
          row.should.have.property('rank');
          row.should.have.property('population');
          row.should.have.property('percentage_of_population');
        });
       })
       .nodeify(done);
  });

  // #2
  it('should join each city to its respective country through a `country` property', function (done) {
    // HINT: You'll need to use `map` and `merge`
    // http://rethinkdb.com/api/javascript/merge/
    r.table('cities')
       // Your code here...
      .coerceTo('array')
      .run(r.conn)
      .then(function (result) {
        Array.isArray(result).should.be.True;
        result.every(function (row) {
          row.should.have.property('country');
          row.should.have.property('name');
          row.should.have.property('area');
          row.should.have.property('rank');
          row.country.should.have.property('population');
          row.country.should.have.property('percentage_of_population');
        });
       })
       .nodeify(done);
  });

});
