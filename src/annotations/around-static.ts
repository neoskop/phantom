import { populate, pushPropertyMetadata } from '../metadata-utils';
import { MethodProperty, StaticMethodPointcut } from './pointcut';

export class AroundStaticPointcut<T extends {}> extends StaticMethodPointcut<T> {}

export function AroundStatic<T extends {}>(cls : T, property : MethodProperty<T>): PropertyDecorator {
  return (target: Object, prop: string | symbol) => {
    pushPropertyMetadata(
      target.constructor,
      prop,
      populate(new AroundStaticPointcut<T>(), {
        cls,
        property,
      })
    );
  };
} 