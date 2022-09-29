import { Ctor, populate, pushPropertyMetadata } from '../metadata-utils';
import { InstanceMethodPointcut, MethodProperty } from './pointcut';

export class BeforePointcut<T extends {}> extends InstanceMethodPointcut<T> {}

export function Before<T extends {}>(cls : Ctor<T>, property : MethodProperty<T>): PropertyDecorator {
  return (target: Object, prop: string | symbol) => {
    pushPropertyMetadata(
      target.constructor,
      prop,
      populate(new BeforePointcut<T>(), {
        cls,
        property,
      })
    );
  };
} 