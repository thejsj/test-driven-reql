/*jshint -W030 */
import 'should';
import r from 'rethinkdb';
import * as utils from './utils';

describe('Subqueries', function () {

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
  it('should join each city to its respective country through a `country` property (without `eqJoin`)', function (done) {
    // HINT: You'll need to use `merge`
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
          if (row.country) {
            row.country.should.have.property('population');
            row.country.should.have.property('percentage_of_population');
          }
        });
       })
       .nodeify(done);
  });

  // #2
  it('should join each country to its respective city through a `cities` property (without `eqJoin`)', function (done) {
    // HINT: You'll need to use `filter`, `coerceTo`, and `default`
    // http://rethinkdb.com/api/javascript/default/
    r.table('countries')
      // Your code here...
      .coerceTo('array')
      .run(r.conn)
      .then(function (result) {
        Array.isArray(result).should.be.True;
        result.every(function (row) {
          row.should.have.property('population');
          row.should.have.property('percentage_of_population');
          row.should.have.property('name');
          row.cities.should.be.an.instanceOf(Array);
          if (row.cities.length > 0) {
            row.cities[0].should.have.property('name');
            row.cities[0].should.have.property('rank');
            row.cities[0].should.have.property('population');
            row.cities[0].should.have.property('density');
            row.cities[0].should.have.property('country');
          }
        });
       })
       .nodeify(done);
  });

  // #3 (Optional)
  xit('should get all countries with a population smaller than New York City', function (done) {
    // HINT: You'll need to use `match` and `do`
    // http://rethinkdb.com/api/javascript/match/
    // http://rethinkdb.com/api/javascript/do/
    r.table('cities')
      // Your code here...
      .do(function (population) {
        // Your code here...
      })
      .coerceTo('array')
      .run(r.conn)
      .then(function (result) {
        Array.isArray(result).should.be.True;
        result.every(function (row) {
          row.name.should.be.a.String;
          row.population.should.be.a.Number;
          row.population.should.be.below(20630000);
        });
       })
       .nodeify(done);
  });


});
