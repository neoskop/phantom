import { populate, pushPropertyMetadata } from '../metadata-utils';
import { MethodProperty, StaticMethodPointcut } from './pointcut';

export class BeforeStaticPointcut<T extends {}> extends StaticMethodPointcut<T> {}

export function BeforeStatic<T extends {}>(cls : T, property : MethodProperty<T>): PropertyDecorator {
  return (target: Object, prop: string | symbol) => {
    pushPropertyMetadata(
      target.constructor,
      prop,
      populate(new BeforeStaticPointcut<T>(), {
        cls,
        property,
      })
    );
  };
} 