import { populate, pushPropertyMetadata } from '../metadata-utils';
import { MethodProperty, StaticMethodPointcut } from './pointcut';

export class AfterStaticPointcut<T extends {}> extends StaticMethodPointcut<T> {}

export function AfterStatic<T extends {}>(cls : T, property : MethodProperty<T>): PropertyDecorator {
  return (target: Object, prop: string | symbol) => {
    pushPropertyMetadata(
      target.constructor,
      prop,
      populate(new AfterStaticPointcut<T>(), {
        cls,
        property,
      })
    );
  };
} 