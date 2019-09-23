const path = require('path');
const sqlite = require('sqlite');

class SQLStatement {
  constructor(strings, values) {
    // Remove all newlines and all double spaces with space
    // Sort of like a trim but respects single spaces
    this.strings = strings.map(str => str.replace(/\n/g, ' ').replace(/  +/g, ' '));
    this.values = values;
  }

  // Gets SQL string
  get sql() {
    return this.strings.join('?').trim();
  }

  // Appends another SQLStatement
  append(other) {
    if (other instanceof SQLStatement) {
      this.strings = this.strings.concat(other.strings);
      this.values = this.values.concat(other.values);
      return this;
    }

    throw new ValueError('Can only append SQLStatements on a SQLStatement.');
  }
}

/**
 * Creates an SQL statement string from a template literal
 */
exports.sql = function sql(strings, ...values) {
  return new SQLStatement(strings, values);
};

exports.connect = function connect() {
  return sqlite.open(path.join(__dirname, '../db/texts.sqlite')).catch(console.error);
};
