import { populate, pushPropertyMetadata } from '../metadata-utils';
import { StaticPropertyPointcut, Property } from './pointcut';

export class StaticGetterPointcut<T extends {}> extends StaticPropertyPointcut<T> {}

export function StaticGetter<T extends {}>(cls : T, property : Property<T>): PropertyDecorator {
  return (target: Object, prop: string | symbol) => {
    pushPropertyMetadata(
      target.constructor,
      prop,
      populate(new StaticGetterPointcut<T>(), {
        cls,
        property,
      })
    );
  };
} 