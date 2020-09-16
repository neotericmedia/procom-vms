import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
export class AppHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'press' : {
      'time': 700
    }
  };
}