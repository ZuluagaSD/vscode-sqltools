import MSSQL from './mssql';
import MySQL from './mysql';
import OracleDB from './oracle';
import PostgreSQL from './pgsql';
import SQLite from './sqlite';
import SAPHana from './saphana';
const dialects = {
  MSSQL,
  MySQL,
  PostgreSQL,
  OracleDB,
  SQLite,
  SAPHana
};

export default dialects;
