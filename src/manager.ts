import { Annotator, Type } from '@neoskop/annotation-factory';
import {
    After,
    AfterStatic,
    Around,
    AroundStatic,
    Before,
    BeforeStatic,
    InstancePointcut,
    StaticPointcut
} from './metadata';
import { Reflection } from './reflection';

export interface Joinpoint extends Function {
    (...args : any[]) : any;
    
    restore() : void;
}

export class JoinpointContext<ARGS extends any[] = any[],
    CONTEXT = any,
    RESULT = any> {
    protected result? : RESULT;
    
    constructor(protected args : ARGS,
                protected readonly context : CONTEXT,
                protected readonly method : string,
                protected readonly target? : Function) {
        
    }
    
    getContext() : CONTEXT {
        return this.context;
    }
    
    getMethod() : string {
        return this.method;
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

export class AopManager {
    install(aspects : any[]) {
        for(const aspect of aspects) {
            const type = aspect.constructor;
            const annotationsMap = Annotator.getPropAnnotations(type as Type<any>);
            
            for(const [ adviceName, annotations ] of Object.entries(annotationsMap)) {
                for(const annotation of annotations!) {
                    if(annotation instanceof InstancePointcut) {
                        const pointcuts = findPointcuts(annotation.cls, annotation.property);
                        for(const pointcut of pointcuts) {
                            if(annotation instanceof Before) {
                                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                                    const context = new JoinpointContext(args, this, pointcut);
                                    aspect[ adviceName ](context);
                                    
                                    return target.apply(this, args);
                                }, pointcut, annotation.cls.prototype);
                            }
                            if(annotation instanceof After) {
                                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                                    const context = new JoinpointContext(args, this, pointcut);
                                    context.setResult(target.apply(this, args));
                                    aspect[ adviceName ](context);
                                    
                                    return context.getResult();
                                }, pointcut, annotation.cls.prototype);
                            }
                            if(annotation instanceof Around) {
                                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                                    const context = new JoinpointContext(args, this, pointcut, target);
                                    return aspect[ adviceName ](context);
                                }, pointcut, annotation.cls.prototype);
                            }
                            
                        }
                    } else if(annotation instanceof StaticPointcut) {
                        const pointcuts = findStaticPointcuts(annotation.cls, annotation.property);
                        for(const pointcut of pointcuts) {
                            if(annotation instanceof BeforeStatic) {
                                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                                    const context = new JoinpointContext(args, this, pointcut);
                                    aspect[ adviceName ](context);
                                    
                                    return target.apply(this, args);
                                }, pointcut, annotation.cls);
                            }
                            if(annotation instanceof AfterStatic) {
                                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                                    const context = new JoinpointContext(args, this, pointcut);
                                    context.setResult(target.apply(this, args));
                                    aspect[ adviceName ](context);
                                    
                                    return context.getResult();
                                }, pointcut, annotation.cls);
                            }
                            if(annotation instanceof AroundStatic) {
                                createJoinpoint(function(this : any, target : Function, ...args : any[]) {
                                    const context = new JoinpointContext(args, this, pointcut, target);
                                    return aspect[ adviceName ](context);
                                }, pointcut, annotation.cls);
                            }
                        }
                    }
                }
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

function findPointcuts<T>(cls : Type<T>, selector : keyof T | string[] | RegExp) : string[] {
    const allMethods = Reflection.getAllClassMethods(cls);
    
    return allMethods.filter(createFilter(selector));
}

function findStaticPointcuts<T extends Type<any>>(cls : T, selector : keyof T | string[] | RegExp) : string[] {
    const allMethods = Reflection.getAllStaticClassMethods(cls);
    
    return allMethods.filter(createFilter(selector));
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
