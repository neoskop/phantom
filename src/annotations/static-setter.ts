import { populate, pushPropertyMetadata } from '../metadata-utils';
import { StaticPropertyPointcut, Property } from './pointcut';

export class StaticSetterPointcut<T extends {}> extends StaticPropertyPointcut<T> {}

export function StaticSetter<T extends {}>(cls : T, property : Property<T>): PropertyDecorator {
  return (target: Object, prop: string | symbol) => {
    pushPropertyMetadata(
      target.constructor,
      prop,
      populate(new StaticSetterPointcut<T>(), {
        cls,
        property,
      })
    );
  };
} 