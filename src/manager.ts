/// <reference path="../node_modules/typescript/lib/lib.es2017.d.ts" />
import { Annotator, Type } from '@neoskop/annotation-factory';
import {
    After,
    AfterStatic,
    Around,
    AroundStatic,
    Before,
    BeforeStatic,
    Getter,
    InstanceMethodPointcut,
    InstancePropertyPointcut,
    Pointcut,
    Setter,
    StaticGetter,
    StaticMethodPointcut,
    StaticPropertyPointcut,
    StaticSetter
} from './metadata';
import {
    ArgumentTypes,
    ReturnType,
    createJoinpoint,
    createPropertyJoinpoint,
    findPointcuts,
    findStaticPointcuts,
    MODE,
    toPointcuts
} from './utils';

/**
 * A joinpoint who invokes the advice and can be restored to the origin method.
 */
export interface Joinpoint extends Function {
    (...args : any[]) : any;
    
    restore() : void;
}

/**
 * Abstract base class for all joinpoint contexts
 */
export abstract class AbstractJoinpointContext<CONTEXT = any, P extends Pointcut<any> = Pointcut<any>> {
    constructor(protected readonly context : CONTEXT,
                protected readonly property : string,
                protected readonly pointcut : P) {
        
    }
    
    /**
     * Returns the invoking context, usually `this`.
     */
    getContext() : CONTEXT {
        return this.context;
    }
    
    /**
     * Returns the method or property name
     */
    getProperty() : string {
        return this.property;
    }
    
    /**
     * Returns the pointcut annotation
     */
    getPointcut() : P {
        return this.pointcut;
    }
}

/**
 * Joinpoint context for method advices
 */
export class JoinpointContext<CONTEXT = any,
                            P extends keyof CONTEXT = never,
                            ARGS extends any[] = ArgumentTypes<CONTEXT[P]>,
                            RESULT = ReturnType<CONTEXT[P]>> extends AbstractJoinpointContext<CONTEXT, InstanceMethodPointcut<any>|StaticMethodPointcut<any>> {
    protected result? : RESULT;
    
    constructor(protected args : ARGS,
                context : CONTEXT,
                property : string,
                pointcut : InstanceMethodPointcut<any>|StaticMethodPointcut<any>,
                protected readonly target? : Function) {
        super(context, property, pointcut);
    }
    
    /**
     * Returns all arguments
     */
    getArguments() : ARGS {
        return this.args;
    }
    
    /**
     * Returns the argument at index `index`
     */
    getArgument(index : 0) : ARGS[0] | undefined;
    getArgument(index : 1) : ARGS[1] | undefined;
    getArgument(index : 2) : ARGS[2] | undefined;
    getArgument(index : 3) : ARGS[3] | undefined;
    getArgument(index : 4) : ARGS[4] | undefined;
    getArgument(index : 5) : ARGS[5] | undefined;
    getArgument(index : 6) : ARGS[6] | undefined;
    getArgument(index : 7) : ARGS[7] | undefined;
    getArgument(index : 8) : ARGS[8] | undefined;
    getArgument(index : 9) : ARGS[9] | undefined;
    getArgument(index : number) : any | undefined;
    getArgument<Index extends keyof ARGS>(index : Index) : ARGS[Index] | undefined;
    getArgument(index : number) : any | undefined {
        return this.args[ index ];
    }
    
    /**
     * Set a specific argument
     */
    setArgument<Index extends keyof ARGS|number>(index : Index, arg : ARGS[Index]) : this {
        this.args[ index ] = arg;
        
        return this;
    }
    
    /**
     * Returns the method result
     */
    getResult() : RESULT | undefined {
        return this.result;
    }
    
    /**
     * Set/overwrites the method result
     */
    setResult(result : RESULT) : this {
        this.result = result;
        
        return this;
    }
    
    /**
     * Invoke the origin method, only applicable on `Around` advices
     */
    proceed() {
        return this.target!.apply(this.context, this.getArguments());
    }
}


export abstract class PropertyJoinpointContext<CONTEXT> extends AbstractJoinpointContext<CONTEXT, InstancePropertyPointcut<any>|StaticPropertyPointcut<any>> {}

/**
 * Joinpoint context for getter advices
 */
export class GetterJoinpointContext<CONTEXT = any, P extends keyof CONTEXT = never, T = CONTEXT[P]> extends PropertyJoinpointContext<CONTEXT> {
    
    /* istanbul ignore next: instanbul bug workaround */
    constructor(context : any,
                property : string,
                pointcut : InstancePropertyPointcut<any> | StaticPropertyPointcut<any>,
                protected readonly getter : Function) {
        super(context, property, pointcut);
    }
    
    /**
     * Returns the value of the origin getter
     */
    getValue() : T {
        return this.getter.call(this.context);
    }
}

/**
 * Joinpoint context for setter advices
 */
export class SetterJoinpointContext<CONTEXT = any, P extends keyof CONTEXT = never, T = CONTEXT[P]> extends PropertyJoinpointContext<CONTEXT> {
    
    /* istanbul ignore next: instanbul bug workaround */
    constructor(context : any,
                property : string,
                pointcut : InstancePropertyPointcut<any> | StaticPropertyPointcut<any>,
                protected readonly setter : Function,
                protected readonly argument : T) {
        super(context, property, pointcut);
    }
    
    /**
     * Set the value by calling the origin setter
     */
    setValue(value : T) : void {
        return this.setter.call(this.context, value);
    }
    
    /**
     * Returns the setter argument value
     */
    getArgument() : T {
        return this.argument;
    }
    
    /**
     * Calls origin setter with argument
     */
    proceed() {
        const arg = this.getArgument();
        this.setValue(arg);
        
        return arg;
    }
}

export class AopManager {
    /**
     * Install all advices of the given aspects
     */
    install(aspects : any[]) {
        for(const aspect of aspects) {
            const type = aspect.constructor;
            const annotationsMap = Annotator.getPropAnnotations(type as Type<any>);
            
            for(const [ adviceName, annotations ] of Object.entries(annotationsMap)) {
                for(const annotation of annotations!) {
                    if(annotation instanceof InstanceMethodPointcut) {
                        this.installMethodAdvices(aspect, adviceName, annotation);
                    } else if(annotation instanceof StaticMethodPointcut) {
                        this.installStaticMethodAdvices(aspect, adviceName, annotation);
                    } else if(annotation instanceof InstancePropertyPointcut) {
                        this.installPropertyAdvices(aspect, adviceName, annotation);
                    } else if(annotation instanceof StaticPropertyPointcut) {
                        this.installStaticPropertyAdvices(aspect, adviceName, annotation);
                    }
                }
            }
        }
    }
    
    protected installMethodAdvices(aspect : any, adviceName: string, annotation : InstanceMethodPointcut<any>) {
        const pointcuts = findPointcuts(annotation.cls, annotation.property);
        for(const pointcut of pointcuts) {
            if(annotation instanceof Before) {
                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                    const context = new JoinpointContext(args, this, pointcut, annotation);
                    aspect[ adviceName ](context);
                
                    return target.apply(this, args);
                }, pointcut, annotation.cls.prototype);
            }
            if(annotation instanceof After) {
                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                    const context = new JoinpointContext(args, this, pointcut, annotation);
                    context.setResult(target.apply(this, args));
                    aspect[ adviceName ](context);
                
                    return context.getResult();
                }, pointcut, annotation.cls.prototype);
            }
            if(annotation instanceof Around) {
                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                    const context = new JoinpointContext(args, this, pointcut, annotation, target);
                    return aspect[ adviceName ](context);
                }, pointcut, annotation.cls.prototype);
            }
        
        }
    }
    
    protected installStaticMethodAdvices(aspect : any, adviceName: string, annotation : StaticMethodPointcut<any>) {
        const pointcuts = findStaticPointcuts(annotation.cls, annotation.property);
        for(const pointcut of pointcuts) {
            if(annotation instanceof BeforeStatic) {
                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                    const context = new JoinpointContext(args, this, pointcut, annotation);
                    aspect[ adviceName ](context);
                    
                    return target.apply(this, args);
                }, pointcut, annotation.cls);
            }
            if(annotation instanceof AfterStatic) {
                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                    const context = new JoinpointContext(args, this, pointcut, annotation);
                    context.setResult(target.apply(this, args));
                    aspect[ adviceName ](context);
                    
                    return context.getResult();
                }, pointcut, annotation.cls);
            }
            if(annotation instanceof AroundStatic) {
                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                    const context = new JoinpointContext(args, this, pointcut, annotation, target);
                    return aspect[ adviceName ](context);
                }, pointcut, annotation.cls);
            }
        }
    }
    
    protected installPropertyAdvices<T>(aspect : any, adviceName : string, annotation : InstancePropertyPointcut<T>) {
        const pointcuts = toPointcuts<T>(annotation.property);
        for(const pointcut of pointcuts) {
            if(annotation instanceof Getter) {
                createPropertyJoinpoint(function(this : any, { getter } : { getter: Function }) {
                    const context = new GetterJoinpointContext(this, pointcut, annotation, getter);
                    return aspect[adviceName](context);
                }, MODE.GETTER, pointcut, annotation.cls.prototype);
            }
            if(annotation instanceof Setter) {
                createPropertyJoinpoint(function(this : any, { setter } : { setter: Function }, value : any) {
                    const context = new SetterJoinpointContext(this, pointcut, annotation, setter, value);
                    aspect[adviceName](context);
                }, MODE.SETTER, pointcut, annotation.cls.prototype);
            }
        }
    }
    
    protected installStaticPropertyAdvices<T>(aspect : any, adviceName : string, annotation : StaticPropertyPointcut<T>) {
        const pointcuts = toPointcuts<T>(annotation.property);
        for(const pointcut of pointcuts) {
            if(annotation instanceof StaticGetter) {
                createPropertyJoinpoint(function(this : any, { getter } : { getter: Function }) {
                    const context = new GetterJoinpointContext(this, pointcut, annotation, getter);
                    return aspect[adviceName](context);
                }, MODE.GETTER, pointcut, annotation.cls);
            }
            if(annotation instanceof StaticSetter) {
                createPropertyJoinpoint(function(this : any, { setter } : { setter: Function }, value : any) {
                    const context = new SetterJoinpointContext(this, pointcut, annotation, setter, value);
                    aspect[adviceName](context);
                }, MODE.SETTER, pointcut, annotation.cls);
            }
        }
    }
}

