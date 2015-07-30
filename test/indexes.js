/*jshint -W030 */
import 'should';
import r from 'rethinkdb';
import * as utils from './utils';

describe('Indexes', function () {

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
  it('should create a secondary index for the `population` property', function (done) {
    // HINT: You'll need to use `indexCreate`
    // http://rethinkdb.com/api/javascript/index_create/
    r.table('countries').indexCreate('population').run(r.conn)
     .then(function () {
       return r.table('countries').indexWait().run(r.conn);
     })
     .then(function () {
       return r.table('countries').orderBy({ index: r.desc('population') }).coerceTo('array').run(r.conn);
     })
     .then(function (res) {
       res.should.be.instanceOf(Array);
       res[0].population.should.be.greaterThan(1000000000);
       res[1].population.should.be.greaterThan(1000000000);
     })
     .nodeify(done);
  });

  // #2
  it('should create a compound index for the `area` and `population` properties', function (done) {
    // HINT: You'll need to use a compound index
    // http://rethinkdb.com/docs/secondary-indexes/javascript/#compound-indexes
    r.table('cities')
     .indexCreate('area_population', [r.row('area'), r.row('population')])
     .run(r.conn)
     .then(function () {
       return r.table('cities').indexWait().run(r.conn);
     })
     .then(function () {
       return r.table('cities').between([0, r.minval], [50, r.maxval], { index: 'area_population' })
        .coerceTo('array').run(r.conn);
     })
     .then(function (res) {
       res.should.be.instanceOf(Array);
       res.length.should.equal(1);
     })
     .nodeify(done);
  });

  // #3
  it('should create an index using an arbitrary expression for cities with a `rank` in the top 100', function (done) {
    // HINT: You'll need to use an index function
    // http://rethinkdb.com/docs/secondary-indexes/javascript/#indexes-on-arbitrary-reql-expressions
    r.table('cities')
     .indexCreate('top_100', function (row) {
       return row('rank').le(100);
     })
     .run(r.conn)
     .then(function () {
       return r.table('cities').indexWait().run(r.conn);
     })
     .then(function () {
       return r.table('cities').getAll(true, { index: 'top_100' })
        .coerceTo('array').run(r.conn);
     })
     .then(function (res) {
       res.should.be.instanceOf(Array);
       res.length.should.equal(100);
     })
     .nodeify(done);
  });

  // #4 (Optional)
  it('should create an index for all the letters in a city\'s name using an index function and a multi index', function (done) {
    // HINT: You'll need to use index functions, multi-indexes, and `split`
    // http://rethinkdb.com/docs/secondary-indexes/javascript/#multi-indexes
    // http://rethinkdb.com/api/javascript/split/
    r.table('countries')
     .indexCreate('letters', function (row) {
       return row('name').split('');
     }, { multi: true })
     .run(r.conn)
     .then(function () {
       return r.table('countries').indexWait().run(r.conn);
     })
     .then(function () {
       return r.table('countries').getAll('z', { index: 'letters' })
        .coerceTo('array').run(r.conn);
     })
     .then(function (res) {
       res.should.be.instanceOf(Array);
       res.every(function (row) {
         return row.name.split('').includes('z');
       }).should.equal(true);
     })
     .nodeify(done);
  });

 });
