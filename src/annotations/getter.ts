import { Ctor, populate, pushPropertyMetadata } from '../metadata-utils';
import { InstancePropertyPointcut, Property } from './pointcut';

export class GetterPointcut<T extends {}> extends InstancePropertyPointcut<T> {}

export function Getter<T extends {}>(cls : Ctor<T>, property : Property<T>): PropertyDecorator {
  return (target: Object, prop: string | symbol) => {
    pushPropertyMetadata(
      target.constructor,
      prop,
      populate(new GetterPointcut<T>(), {
        cls,
        property,
      })
    );
  };
} 