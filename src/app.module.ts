import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PackagesController } from './packages/packages.controller';
import { PackagesService } from './packages/packages.service';

@Module({
  imports: [],
  controllers: [AppController, PackagesController],
  providers: [PackagesService],
})
export class AppModule {}
