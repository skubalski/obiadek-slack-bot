'use strict';

const Promise = require('bluebird');

const pgp = require('pg-promise')({ 
  promiseLib: Promise
});

pgp.pg.defaults.ssl = true; // force ssl for postgres connection


const db = pgp(process.env.DATABASE_URL);

module.exports = db;