import { Type } from '@neoskop/annotation-factory';
import { Joinpoint } from './manager';
import { Reflection } from './reflection';

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

export enum MODE { SETTER, GETTER }

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

export function findPointcuts<T>(cls : Type<T>, selector : keyof T | string[] | RegExp) : string[] {
    const allMethods = Reflection.getAllClassMethods(cls);
    
    return allMethods.filter(createFilter(selector));
}

export function findStaticPointcuts<T extends Type<any>>(cls : T, selector : keyof T | string[] | RegExp) : string[] {
    const allMethods = Reflection.getAllStaticClassMethods(cls);
    
    return allMethods.filter(createFilter(selector));
}

export function toPointcuts<T>(selector : keyof T | keyof T[]) {
    if(Array.isArray(selector)) {
        return selector;
    }
    return [ selector ]
}

export function createFilter<T>(filter : keyof T | string[] | RegExp) : (str : string) => boolean {
    if(filter instanceof RegExp) {
        return str => filter.test(str);
    } else if(Array.isArray(filter)) {
        return str => filter.includes(str);
    } else {
        return str => str === filter;
    }
}
