import { Type } from '@neoskop/annotation-factory';
import { Joinpoint } from './manager';
import { Reflection } from './reflection';
import { Property } from './metadata';

/**
 * @hidden
 */
export function createJoinpoint(fn : (this : any, target : Function, ...args : any[]) => any, pointcut : string, proto : any) : Joinpoint {
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

/**
 * @hidden
 */
export enum MODE { SETTER, GETTER }

/**
 * @hidden
 */
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

/**
 * @hidden
 */
export function createPropertyJoinpoint(fn : (this : any, targets : { getter : Function, setter : Function }, value?: any) => any, mode : MODE, pointcut : string, proto : any) : void {
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

/**
 * @hidden
 */
export function findPointcuts<T>(cls : Type<T>, selector : keyof T | string[] | RegExp) : string[] {
    const allMethods = Reflection.getAllClassMethods(cls);
    
    return allMethods.filter(createFilter(selector));
}

/**
 * @hidden
 */
export function findStaticPointcuts<T extends Type<any>>(cls : T, selector : keyof T | string[] | RegExp) : string[] {
    const allMethods = Reflection.getAllStaticClassMethods(cls);
    
    return allMethods.filter(createFilter(selector));
}

/**
 * @hidden
 */
export function toPointcuts<T>(selector : Property<T>) : string[] {
    if(Array.isArray(selector)) {
        return selector;
    }
    return [ selector as string ]
}

/**
 * @hidden
 */
export function createFilter<T>(filter : keyof T | string[] | RegExp) : (str : string) => boolean {
    if(filter instanceof RegExp) {
        return str => filter.test(str);
    } else if(Array.isArray(filter)) {
        return str => filter.includes(str);
    } else {
        return str => str === filter;
    }
}

/**
 * hidden
 */
export function unique<T>(c : T, i : number, a : T[]) : boolean {
    return a.indexOf(c) === i;
}

/**
 * hidden
 */
export type ArgumentTypes<T> =
    T extends (arg0 : infer A, arg1 : infer B, arg2 : infer C, arg3 : infer D, arg4 : infer E, arg5 : infer F, arg6 : infer G, arg7 : infer H, arg8 : infer I, arg9 : infer J) => any ? [ A, B, C, D, E, F, G, H, I, J ]
        : T extends (arg0 : infer A, arg1 : infer B, arg2 : infer C, arg3 : infer D, arg4 : infer E, arg5 : infer F, arg6 : infer G, arg7 : infer H, arg8 : infer I) => any ? [ A, B, C, D, E, F, G, H, I ]
        : T extends (arg0 : infer A, arg1 : infer B, arg2 : infer C, arg3 : infer D, arg4 : infer E, arg5 : infer F, arg6 : infer G, arg7 : infer H) => any ? [ A, B, C, D, E, F, G, H ]
        : T extends (arg0 : infer A, arg1 : infer B, arg2 : infer C, arg3 : infer D, arg4 : infer E, arg5 : infer F, arg6 : infer G) => any ? [ A, B, C, D, E, F, G ]
        : T extends (arg0 : infer A, arg1 : infer B, arg2 : infer C, arg3 : infer D, arg4 : infer E, arg5 : infer F) => any ? [ A, B, C, D, E, F ]
        : T extends (arg0 : infer A, arg1 : infer B, arg2 : infer C, arg3 : infer D, arg4 : infer E) => any ? [ A, B, C, D, E ]
        : T extends (arg0 : infer A, arg1 : infer B, arg2 : infer C, arg3 : infer D) => any ? [ A, B, C, D ]
        : T extends (arg0 : infer A, arg1 : infer B, arg2 : infer C) => any ? [ A, B, C ]
        : T extends (arg0 : infer A, arg1 : infer B) => any ? [ A, B ]
        : T extends (arg0 : infer A) => any ? [ A ]
        : T extends () => any ? [ void ]
        : any[];

/**
 * hidden
 */
export type ReturnType<T> = T extends (...args : any[]) => infer R ? R : any;
