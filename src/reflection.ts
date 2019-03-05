import { Type } from '@angular/core';
import { unique } from './utils';

export const REFLECTION_PROPERTY_BLACKLIST = new Set([
    '__defineGetter__',
    '__defineSetter__',
    'hasOwnProperty',
    '__lookupGetter__',
    '__lookupSetter__',
    'isPrototypeOf',
    'propertyIsEnumerable',
    '__proto__',
    'toLocaleString'
]);

/**
 * @hidden
 */
export class Reflection {
    static getParentClasses(cls : Type<any>) : Type<any>[] {
        const parents : Type<any>[] = [];
        
        let proto = Object.getPrototypeOf(cls.prototype);
        while(proto) {
            parents.push(proto.constructor);
            proto = Object.getPrototypeOf(proto.constructor.prototype);
        }
        
        return parents;
    }
    
    static getOwnClassMethods(cls : Type<any>) : string[] {
        const methods : string[] = [];
        
        for(const method of Object.keys(Object.getOwnPropertyDescriptors(cls.prototype)).filter(key => !REFLECTION_PROPERTY_BLACKLIST.has(key))) {
            if('constructor' === method) continue;
            methods.push(method);
        }
        
        return methods;
    }
    
    static getAllClassMethods(cls : Type<any>) : string[] {
        const methods : string[] = [];

        for(const clazz of [ cls, ...this.getParentClasses(cls) ]) {
            methods.push(...this.getOwnClassMethods(clazz));
        }

        return methods.filter(unique);
    }
    
    static getOwnStaticClassMethods(cls : Type<any>) : string[] {
        return Object.keys(cls);
    }
    
    static getAllStaticClassMethods(cls : Type<any>) : string[] {
        const methods : string[] = [];

        for(const clazz of [ cls, ...this.getParentClasses(cls) ]) {
            methods.push(...this.getOwnStaticClassMethods(clazz));
        }

        return methods.filter(unique);
    }
}
