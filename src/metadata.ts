import { Annotator, Type } from '@neoskop/annotation-factory';

export interface InstanceMethodPointcutDecorator {
    <T>(cls : Type<T>, property : keyof T|string[]|RegExp) : any;
    new<T>(cls : Type<T>, property : keyof T|string[]|RegExp) : InstanceMethodPointcut<T>;
}

export interface StaticMethodPointcutDecorator {
    <T>(cls : T, property : keyof T|string[]|RegExp) : any;
    new<T>(cls : T, property : keyof T|string[]|RegExp) : StaticMethodPointcut<T>;
}

export interface InstancePropertyPointcutDecorator {
    <T>(cls : Type<T>, property : keyof T|string[]) : any;
    new<T>(cls : Type<T>, property : keyof T|string[]) : InstancePropertyPointcut<T>;
}

export interface StaticPropertyPointcutDecorator {
    <T>(cls : T, property : keyof T|string[]) : any;
    new<T>(cls : T, property : keyof T|string[]) : StaticPropertyPointcut<T>;
}

export abstract class Pointcut<T> {
    abstract readonly cls : Type<T>|T;
    abstract readonly property : keyof T|keyof T[]|string[]|RegExp;
}


const propsFactory = (cls : Type<any>, property : string|string[]|RegExp) => ({
    cls,
    property
});

export abstract class InstanceMethodPointcut<T> extends Pointcut<T> {
    readonly cls! : Type<T>;
    readonly property! : keyof T|keyof T[]|RegExp;
}

export abstract class StaticMethodPointcut<T> extends Pointcut<T> {
    readonly cls! : T;
    readonly property! : keyof T|keyof T[]|RegExp;
}

export abstract class InstancePropertyPointcut<T> extends Pointcut<T> {
    readonly cls! : Type<T>;
    readonly property! : keyof T|keyof T[];
}

export abstract class StaticPropertyPointcut<T> extends Pointcut<T> {
    readonly cls! : T;
    readonly property! : keyof T|keyof T[];
}

export const Before : InstanceMethodPointcutDecorator = Annotator.makePropDecorator('Before', propsFactory, InstanceMethodPointcut);
export const After : InstanceMethodPointcutDecorator = Annotator.makePropDecorator('After', propsFactory, InstanceMethodPointcut);
export const Around : InstanceMethodPointcutDecorator = Annotator.makePropDecorator('Around', propsFactory, InstanceMethodPointcut);

export const Getter : InstancePropertyPointcutDecorator = Annotator.makePropDecorator('Getter', propsFactory, InstancePropertyPointcut);
export const Setter : InstancePropertyPointcutDecorator = Annotator.makePropDecorator('Setter', propsFactory, InstancePropertyPointcut);

export const BeforeStatic : StaticMethodPointcutDecorator = Annotator.makePropDecorator('BeforeStatic', propsFactory, StaticMethodPointcut);
export const AfterStatic : StaticMethodPointcutDecorator = Annotator.makePropDecorator('AfterStatic', propsFactory, StaticMethodPointcut);
export const AroundStatic : StaticMethodPointcutDecorator = Annotator.makePropDecorator('AroundStatic', propsFactory, StaticMethodPointcut);

export const StaticGetter : StaticPropertyPointcutDecorator = Annotator.makePropDecorator('GetterStatic', propsFactory, StaticPropertyPointcut);
export const StaticSetter : StaticPropertyPointcutDecorator = Annotator.makePropDecorator('SetterStatic', propsFactory, StaticPropertyPointcut);

