import { Controller, Get, Render } from '@nestjs/common';
import { DB } from 'database/VersatileDB';
import { join } from 'path';

const database = new DB(join(__dirname, '..', 'database', 'packages.db'), {
  schema: join(__dirname, '..', 'database', 'schema.json'),
});

// uncomment for database generation
database.format();

@Controller()
export class AppController {
  @Get()
  @Render('index.hbs')
  root() {
    return { modules: Object.keys(database.read_and_jsonify()) };
  }
}
