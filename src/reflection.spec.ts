import { Reflection } from './reflection';

class A {
    methodA() {
    }
}

class B extends A {
    static staticB() {
    }
    
    methodB() {
    }
}

class C extends B {
    static staticC() {
    }
}

class D extends B {
}

describe('Reflection', () => {
    describe('getParentClasses', () => {
        it('should return all parent classes' , () => {
            expect(Reflection.getParentClasses(A)).toEqual([ Object ]);
            expect(Reflection.getParentClasses(B)).toEqual([ A, Object ]);
            expect(Reflection.getParentClasses(C)).toEqual([ B, A, Object ]);
            expect(Reflection.getParentClasses(D)).toEqual([ B, A, Object ]);
        });
    });
    
    describe('getOwnClassMethods', () => {
        it('should return all own class methods', () => {
            expect(Reflection.getOwnClassMethods(A)).toEqual([ 'methodA' ]);
            expect(Reflection.getOwnClassMethods(B)).toEqual([ 'methodB' ]);
        });
    });
    
    describe('getAllClassMethods', () => {
        it('should return all class methods', () => {
            expect(Reflection.getAllClassMethods(A)).toEqual([ 'methodA', 'toString', 'valueOf' ]);
            expect(Reflection.getAllClassMethods(B)).toEqual([ 'methodB', 'methodA', 'toString', 'valueOf' ]);
        });
    });
    
    describe('getOwnStaticClassMethods', () => {
        it('should return all own static class methods', () => {
            expect(Reflection.getOwnStaticClassMethods(A)).toEqual([]);
            expect(Reflection.getOwnStaticClassMethods(B)).toEqual([ 'staticB' ]);
        });
    });
    
    describe('getAllStaticClassMethods', () => {
        it('should return all static class methods', () => {
            expect(Reflection.getAllStaticClassMethods(A)).toEqual([]);
            expect(Reflection.getAllStaticClassMethods(B)).toEqual([ 'staticB' ]);
            expect(Reflection.getAllStaticClassMethods(C)).toEqual([ 'staticC', 'staticB' ]);
        });
    });
});
