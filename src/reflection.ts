import { Type } from '@angular/core';

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
        
        for(const method of Object.keys(cls.prototype)) {
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
        
        return methods.filter((c, i, a) => a.indexOf(c) === i);
    }
    
    static getOwnStaticClassMethods(cls : Type<any>) : string[] {
        return Object.keys(cls);
    }
    
    static getAllStaticClassMethods(cls : Type<any>) : string[] {
        const methods : string[] = [];
    
        for(const clazz of [ cls, ...this.getParentClasses(cls) ]) {
            methods.push(...this.getOwnStaticClassMethods(clazz));
        }
    
        return methods.filter((c, i, a) => a.indexOf(c) === i);
    }
}
