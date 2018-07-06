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

/**
 * Defines a before advice
 * @example
 * ```
 * class Aspect {
 *     @Before(ExampleClass, 'exampleMethod')
 *     advice(jp : JoinpointContext) {}
 * }
 * ```
 */
export const Before : InstanceMethodPointcutDecorator = Annotator.makePropDecorator('Before', propsFactory, InstanceMethodPointcut);

/**
 * Defines a after advice
 * @example
 * ```
 * class Aspect {
 *     @After(ExampleClass, 'exampleMethod')
 *     advice(jp : JoinpointContext) {}
 * }
 * ```
 */
export const After : InstanceMethodPointcutDecorator = Annotator.makePropDecorator('After', propsFactory, InstanceMethodPointcut);

/**
 * Defines a around advice
 * @example
 * ```
 * class Aspect {
 *     @Around(ExampleClass, 'exampleMethod')
 *     advice(jp : JoinpointContext) {
 *         return jp.proceed()
 *     }
 * }
 * ```
 */
export const Around : InstanceMethodPointcutDecorator = Annotator.makePropDecorator('Around', propsFactory, InstanceMethodPointcut);

/**
 * Defines a getter advice
 * @example
 * ```
 * class Aspect {
 *     @Getter(ExampleClass, 'exampleProperty')
 *     advice(jp : GetterJoinpointContext) {
 *         return jp.getValue()
 *     }
 * }
 * ```
 */
export const Getter : InstancePropertyPointcutDecorator = Annotator.makePropDecorator('Getter', propsFactory, InstancePropertyPointcut);

/**
 * Defines a setter advice
 * @example
 * ```
 * class Aspect {
 *     @Setter(ExampleClass, 'exampleProperty')
 *     advice(jp : SetterJoinpointContext) {
 *         jp.proceed()
 *     }
 * }
 * ```
 */
export const Setter : InstancePropertyPointcutDecorator = Annotator.makePropDecorator('Setter', propsFactory, InstancePropertyPointcut);

/**
 * Defines a static before advice
 * @example
 * ```
 * class Aspect {
 *     @BeforeStatic(ExampleClass, 'exampleMethod')
 *     advice(jp : JoinpointContext) {}
 * }
 * ```
 */
export const BeforeStatic : StaticMethodPointcutDecorator = Annotator.makePropDecorator('BeforeStatic', propsFactory, StaticMethodPointcut);

/**
 * Defines a static after advice
 * @example
 * ```
 * class Aspect {
 *     @AfterStatic(ExampleClass, 'exampleMethod')
 *     advice(jp : JoinpointContext) {}
 * }
 * ```
 */
export const AfterStatic : StaticMethodPointcutDecorator = Annotator.makePropDecorator('AfterStatic', propsFactory, StaticMethodPointcut);

/**
 * Defines a static around advice
 * @example
 * ```
 * class Aspect {
 *     @AroundStatic(ExampleClass, 'exampleMethod')
 *     advice(jp : JoinpointContext) {
 *         return jp.proceed()
 *     }
 * }
 * ```
 */
export const AroundStatic : StaticMethodPointcutDecorator = Annotator.makePropDecorator('AroundStatic', propsFactory, StaticMethodPointcut);

/**
 * Defines a static getter advice
 * @example
 * ```
 * class Aspect {
 *     @StaticGetter(ExampleClass, 'exampleProperty')
 *     advice(jp : GetterJoinpointContext) {
 *         return jp.getValue()
 *     }
 * }
 * ```
 */
export const StaticGetter : StaticPropertyPointcutDecorator = Annotator.makePropDecorator('GetterStatic', propsFactory, StaticPropertyPointcut);

/**
 * Defines a static setter advice
 * @example
 * ```
 * class Aspect {
 *     @StaticSetter(ExampleClass, 'exampleProperty')
 *     advice(jp : SetterJoinpointContext) {
 *         jp.proceed()
 *     }
 * }
 * ```
 */
export const StaticSetter : StaticPropertyPointcutDecorator = Annotator.makePropDecorator('SetterStatic', propsFactory, StaticPropertyPointcut);

