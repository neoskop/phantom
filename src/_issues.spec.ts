import 'mocha';
import { expect } from 'chai';
import { Before } from './metadata';

describe('Github Issues (https://github.com/neoskop/phantom/issues)', () => {
    describe('#1 (https://github.com/neoskop/phantom/issues/1)', () => {
        it('should allow abstract classes', () => {
            abstract class TestClass {
                foobar() {}
            }
            
            class TestAspect {
                @Before(TestClass, 'foobar')
                beforeFoobar() {}
            }
            
            expect(new TestAspect()).to.be.instanceOf(TestAspect);
        });
    });
    
    describe('#2 (https://github.com/neoskop/phantom/issues/2)', () => {
        it('should allow private/protected properties', () => {
            class TestClass {
                protected foobar() {}
            }
            
            class TestAspect {
                @Before(TestClass, 'foobar')
                beforeFoobar() {}
            }
    
            expect(new TestAspect()).to.be.instanceOf(TestAspect);
        });
    });
});
