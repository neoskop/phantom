import { Before } from './metadata';
import { JoinpointContext } from './manager';

describe('Github Issues (https://github.com/neoskop/phantom/issues)', () => {
    describe('#1 (https://github.com/neoskop/phantom/issues/1)', () => {
        it('should allow abstract classes', () => {
            abstract class TestClass {
                foobar() {}
            }
            
            class TestAspect {
                @Before(TestClass, 'foobar')
                beforeFoobar(_jp : JoinpointContext<TestClass, 'foobar'>) {}
            }
            
            expect(new TestAspect()).toBeInstanceOf(TestAspect);
        });
    });
    
    describe('#2 (https://github.com/neoskop/phantom/issues/2)', () => {
        it('should allow private/protected properties', () => {
            class TestClass {
                protected foobar() {}
            }
            
            class TestAspect {
                @Before(TestClass, 'foobar')
                beforeFoobar(_jp : JoinpointContext<TestClass>) {}
            }
    
            expect(new TestAspect()).toBeInstanceOf(TestAspect);
        });
    });
});
