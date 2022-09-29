import { Ctor, populate, pushPropertyMetadata } from '../metadata-utils';
import { InstanceMethodPointcut, MethodProperty } from './pointcut';

export class AfterPointcut<T extends {}> extends InstanceMethodPointcut<T> {}

export function After<T extends {}>(cls : Ctor<T>, property : MethodProperty<T>): PropertyDecorator {
  return (target: Object, prop: string | symbol) => {
    pushPropertyMetadata(
      target.constructor,
      prop,
      populate(new AfterPointcut<T>(), {
        cls,
        property,
      })
    );
  };
} 