import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TimestampToReadableInterceptor } from './working_hours/interceptors/workingHours.interceptor';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 7000;
  app.useGlobalInterceptors(new TimestampToReadableInterceptor());
  await app.listen(port);

}
bootstrap();


