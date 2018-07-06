import { Annotator, Type } from '@neoskop/annotation-factory';
import {
    After,
    AfterStatic,
    Around,
    AroundStatic,
    Before,
    BeforeStatic, Getter,
    InstanceMethodPointcut, InstancePropertyPointcut, Pointcut, Setter, StaticGetter,
    StaticMethodPointcut, StaticPropertyPointcut, StaticSetter
} from './metadata';
import { Reflection } from './reflection';

export interface Joinpoint extends Function {
    (...args : any[]) : any;
    
    restore() : void;
}

export abstract class AbstractJoinpointContext<CONTEXT = any, P extends Pointcut<any> = Pointcut<any>> {
    constructor(protected readonly context : CONTEXT,
                protected readonly property : string,
                protected readonly pointcut : P) {
        
    }
    
    getContext() : CONTEXT {
        return this.context;
    }
    
    getProperty() : string {
        return this.property;
    }
    
    getPointcut() : P {
        return this.pointcut;
    }
}

export class JoinpointContext<ARGS extends any[] = any[],
    CONTEXT = any,
    RESULT = any> extends AbstractJoinpointContext<CONTEXT, InstanceMethodPointcut<any>|StaticMethodPointcut<any>> {
    protected result? : RESULT;
    
    constructor(protected args : ARGS,
                context : CONTEXT,
                property : string,
                pointcut : InstanceMethodPointcut<any>|StaticMethodPointcut<any>,
                protected readonly target? : Function) {
        super(context, property, pointcut);
    }
    
    getArguments() : ARGS {
        return this.args;
    }
    
    getArgument<Index extends keyof ARGS>(index : Index) : ARGS[Index] | undefined {
        return this.args[ index ];
    }
    
    setArgument<Index extends keyof ARGS>(index : Index, arg : ARGS[Index]) : this {
        this.args[ index ] = arg;
        
        return this;
    }
    
    getResult() : RESULT | undefined {
        return this.result;
    }
    
    setResult(result : RESULT) : this {
        this.result = result;
        
        return this;
    }
    
    proceed() {
        return this.target!.apply(this.context, this.getArguments());
    }
}

export abstract class PropertyJoinpointContext<CONTEXT = any> extends AbstractJoinpointContext<CONTEXT, InstancePropertyPointcut<any>|StaticPropertyPointcut<any>> {
    // protected value?: T;
    //
    // getValue() : T|undefined {
    //     return this.value;
    // }
    //
    // setValue(value : T) : this {
    //     this.value = value;
    //
    //     return this;
    // }
}

export class GetterJoinpointContext<T = any, CONTEXT = any> extends PropertyJoinpointContext<CONTEXT> {
    
    constructor(context : any,
                property : string,
                pointcut : InstancePropertyPointcut<any> | StaticPropertyPointcut<any>,
                protected readonly getter : Function) {
        super(context, property, pointcut);
    }
    
    getValue() : T {
        return this.getter.call(this.context);
    }
}

export class SetterJoinpointContext<T = any, CONTEXT = any> extends PropertyJoinpointContext<CONTEXT> {
    
    constructor(context : any,
                property : string,
                pointcut : InstancePropertyPointcut<any> | StaticPropertyPointcut<any>,
                protected readonly setter : Function,
                protected readonly argument : T) {
        super(context, property, pointcut);
    }
    
    setValue(value : T) : void {
        return this.setter.call(this.context, value);
    }
    
    getArgument() : T {
        return this.argument;
    }
    
    proceed() {
        const arg = this.getArgument();
        this.setValue(arg);
        
        return arg;
    }
}

export class AopManager {
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

function createJoinpoint(fn : (this : any, target : Function, ...args : any[]) => any, pointcut : string, proto : any) : Joinpoint {
    const ownPropertyDescriptor = Object.getOwnPropertyDescriptor(proto, pointcut);
    const origin = ownPropertyDescriptor && ownPropertyDescriptor.value;
    return proto[ pointcut ] = Object.assign(function(this : any, ...args : any[]) {
        const target = ownPropertyDescriptor ? ownPropertyDescriptor.value! : Object.getPrototypeOf(proto)[ pointcut ];
        return fn.apply(this, [ target, ...args ]);
    }, {
        restore() {
            if(origin) {
                proto[ pointcut ] = origin;
            } else {
                delete proto[ pointcut ];
            }
        }
    })
}

enum MODE { SETTER, GETTER }

function getDescriptorInPrototypeChain(proto : any, name : string) : PropertyDescriptor|undefined {
    while(proto) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, name);
        if(descriptor) {
            return descriptor;
        }
        proto = Object.getPrototypeOf(proto);
    }
    
    return;
}

function createPropertyJoinpoint(fn : (this : any, targets : { getter : Function, setter : Function }, value?: any) => any, mode : MODE, pointcut : string, proto : any) : void {
    const descriptor : PropertyDescriptor = getDescriptorInPrototypeChain(proto, pointcut) || {
        enumerable: true,
        configurable: true
    };
    
    if(!descriptor.set && !descriptor.get) {
        let value = descriptor.value;
        
        descriptor.set = function(v : any) {
            value = v;
        };
        
        descriptor.get = function() {
            return value;
        };
    }
    
    delete descriptor.value;
    delete descriptor.writable;
    
    /* istanbul ignore else */
    if(mode === MODE.SETTER) {
        const setter = descriptor.set;
        if(!setter) {
            throw new Error('Cannot install setter, only getter available');
        }
        
        descriptor.set = function(value : any) {
            fn.call(this, { setter }, value);
        }
    } else if(mode === MODE.GETTER) {
        const getter = descriptor.get;
        if(!getter) {
            throw new Error('Cannot install getter, only setter available');
        }
        
        descriptor.get = function() {
            return fn.call(this, { getter });
        }
    }
    
    Object.defineProperty(proto, pointcut, descriptor);
}

function findPointcuts<T>(cls : Type<T>, selector : keyof T | string[] | RegExp) : string[] {
    const allMethods = Reflection.getAllClassMethods(cls);
    
    return allMethods.filter(createFilter(selector));
}

function findStaticPointcuts<T extends Type<any>>(cls : T, selector : keyof T | string[] | RegExp) : string[] {
    const allMethods = Reflection.getAllStaticClassMethods(cls);
    
    return allMethods.filter(createFilter(selector));
}

function toPointcuts<T>(selector : keyof T | keyof T[]) {
    if(Array.isArray(selector)) {
        return selector;
    }
    return [ selector ]
}

function createFilter<T>(filter : keyof T | string[] | RegExp) : (str : string) => boolean {
    if(filter instanceof RegExp) {
        return str => filter.test(str);
    } else if(Array.isArray(filter)) {
        return str => filter.includes(str);
    } else {
        return str => str === filter;
    }
}
