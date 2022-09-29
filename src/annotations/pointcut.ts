import { Ctor } from "../metadata-utils";

export type MethodProperty<T> = string|string[]|keyof T|keyof T[]|RegExp;
export type Property<T> = string|string[]|keyof T|keyof T[];

export abstract class Pointcut<T extends {}> {
    abstract readonly cls: Ctor<T>|T;
    abstract readonly property: Property<T>|MethodProperty<T>;
}

export class InstanceMethodPointcut<T extends {}> extends Pointcut<T> {
    readonly cls!: Ctor<T>;
    readonly property!: MethodProperty<T>;
}

export class StaticMethodPointcut<T extends {}> extends Pointcut<T> {
    readonly cls!: T;
    readonly property!: MethodProperty<T>;
}

export class InstancePropertyPointcut<T extends {}> extends Pointcut<T> {
    readonly cls!: Ctor<T>;
    readonly property!: Property<T>;
}

export class StaticPropertyPointcut<T extends {}> extends Pointcut<T> {
    readonly cls!: T;
    readonly property!: Property<T>;
}