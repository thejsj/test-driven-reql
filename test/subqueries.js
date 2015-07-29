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
    r.table('cities')
      .merge(function (row) {
        return {
          'country': r.table('countries').get(row('country'))
        };
      })
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
    r.table('countries')
      .merge(function (row) {
        return {
          'cities': r.table('cities').filter({ country: row('country') }).coerceTo('array').default([])
        };
      })
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

});
