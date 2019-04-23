import 'mocha';
import { expect } from 'chai';
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
            expect(Reflection.getParentClasses(A)).to.be.eql([ Object ]);
            expect(Reflection.getParentClasses(B)).to.be.eql([ A, Object ]);
            expect(Reflection.getParentClasses(C)).to.be.eql([ B, A, Object ]);
            expect(Reflection.getParentClasses(D)).to.be.eql([ B, A, Object ]);
        });
    });
    
    describe('getOwnClassMethods', () => {
        it('should return all own class methods', () => {
            expect(Reflection.getOwnClassMethods(A)).to.be.eql([ 'methodA' ]);
            expect(Reflection.getOwnClassMethods(B)).to.be.eql([ 'methodB' ]);
        });
    });
    
    describe('getAllClassMethods', () => {
        it('should return all class methods', () => {
            expect(Reflection.getAllClassMethods(A)).to.be.eql([ 'methodA', 'toString', 'valueOf' ]);
            expect(Reflection.getAllClassMethods(B)).to.be.eql([ 'methodB', 'methodA', 'toString', 'valueOf' ]);
        });
    });
    
    describe('getOwnStaticClassMethods', () => {
        it('should return all own static class methods', () => {
            expect(Reflection.getOwnStaticClassMethods(A)).to.be.eql([]);
            expect(Reflection.getOwnStaticClassMethods(B)).to.be.eql([ 'staticB' ]);
        });
    });
    
    describe('getAllStaticClassMethods', () => {
        it('should return all static class methods', () => {
            expect(Reflection.getAllStaticClassMethods(A)).to.be.eql([]);
            expect(Reflection.getAllStaticClassMethods(B)).to.be.eql([ 'staticB' ]);
            expect(Reflection.getAllStaticClassMethods(C)).to.be.eql([ 'staticC', 'staticB' ]);
        });
    });
});
