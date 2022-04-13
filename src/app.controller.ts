import { Controller, Get, Render } from '@nestjs/common';
import { join } from 'path';
const { DB } = require(join(__dirname, '..', 'database', 'db.js'));
const database = new DB(join(__dirname, '..', 'database', 'packages.db'));

// uncomment for database generation
// database.format();
// database.finalize();

@Controller()
export class AppController {
  @Get()
  @Render('index.hbs')
  root() {
    database.read();
    return { modules: Object.keys(database.jsonify()) };
  }
}
