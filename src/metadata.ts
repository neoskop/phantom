import { Annotator, Type } from '@neoskop/annotation-factory';

export interface InstancePointcutDecorator {
    <T>(cls : Type<T>, property : keyof T|string[]|RegExp) : any;
    new<T>(cls : Type<T>, property : keyof T|string[]|RegExp) : InstancePointcut<T>;
}

export interface StaticPointcutDecorator {
    <T>(cls : T, property : keyof T|string[]|RegExp) : any;
    new<T>(cls : T, property : keyof T|string[]|RegExp) : StaticPointcut<T>;
}

export abstract class Pointcut<T> {
    abstract cls : Type<T>|T;
    abstract property : keyof T|string[]|RegExp;
}


const propsFactory = (cls : Type<any>, property : string|string[]|RegExp) => ({
    cls,
    property
});

export abstract class InstancePointcut<T> extends Pointcut<T> {
    cls! : Type<T>;
    property! : keyof T|string[]|RegExp;
}

export abstract class StaticPointcut<T> extends Pointcut<T> {
    cls! : T;
    property! : keyof T|string[]|RegExp;
}

export const Before : InstancePointcutDecorator = Annotator.makePropDecorator('Before', propsFactory, InstancePointcut);
export const After : InstancePointcutDecorator = Annotator.makePropDecorator('After', propsFactory, InstancePointcut);
export const Around : InstancePointcutDecorator = Annotator.makePropDecorator('Around', propsFactory, InstancePointcut);
export const Getter : InstancePointcutDecorator = Annotator.makePropDecorator('Getter', propsFactory, InstancePointcut);
export const Setter : InstancePointcutDecorator = Annotator.makePropDecorator('Setter', propsFactory, InstancePointcut);

export const BeforeStatic : StaticPointcutDecorator = Annotator.makePropDecorator('BeforeStatic', propsFactory, StaticPointcut);
export const AfterStatic : StaticPointcutDecorator = Annotator.makePropDecorator('AfterStatic', propsFactory, StaticPointcut);
export const AroundStatic : StaticPointcutDecorator = Annotator.makePropDecorator('AroundStatic', propsFactory, StaticPointcut);
export const GetterStatic : StaticPointcutDecorator = Annotator.makePropDecorator('GetterStatic', propsFactory, StaticPointcut);
export const SetterStatic : StaticPointcutDecorator = Annotator.makePropDecorator('SetterStatic', propsFactory, StaticPointcut);

