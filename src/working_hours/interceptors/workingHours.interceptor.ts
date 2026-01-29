import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { timestampToReadableTime } from '../working_hours.service';

@Injectable()
export class TimestampToReadableInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformTimestamps(data)));
  }

  private transformTimestamps(data: any): any {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.transformTimestamps(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const newObj: any = { ...data };

      for (const key of Object.keys(newObj)) {
        const value = newObj[key];

        // Transform start_time and end_time
        if (
          ['start_time', 'end_time'].includes(key) &&
          (typeof value === 'number' || typeof value === 'string')
        ) {
          newObj[key] = timestampToReadableTime(value, 'en-US', 'UTC');
        }
        // Only transform Date objects to ISO string
        else if (value instanceof Date) {
          newObj[key] = value.toISOString();
        }
        // Recursively handle nested objects
        else if (typeof value === 'object' && value !== null) {
          newObj[key] = this.transformTimestamps(value);
        }
      }

      return newObj;
    }

    return data;
  }
}
