import 'mocha';
import { expect, use } from 'chai';
import { spy } from 'sinon';
import { AopManager, Joinpoint, JoinpointContext } from './manager';
import { After, AfterStatic, Around, AroundStatic, Before, BeforeStatic } from './metadata';
import { Annotator } from '@neoskop/annotation-factory';

use(require('sinon-chai'));

const SPIES = {
    parentParentTest: spy(),
    parentTest      : spy(),
    beforeTest      : spy(),
    afterTest       : spy(),
    aroundTest      : spy(),
    before          : spy(),
    after           : spy(),
    around          : spy(),
    parentParent    : spy(),
    parent          : spy(),
    staticBeforeTest: spy(),
    staticAfterTest : spy(),
    staticAroundTest: spy(),
    staticBefore    : spy(),
    staticAfter     : spy(),
    staticAround    : spy(),
    staticParentTest: spy(),
    resetHistory() {
        this.parentParentTest.resetHistory();
        this.parentTest.resetHistory();
        this.beforeTest.resetHistory();
        this.afterTest.resetHistory();
        this.aroundTest.resetHistory();
        this.before.resetHistory();
        this.after.resetHistory();
        this.around.resetHistory();
        this.parentParent.resetHistory();
        this.parent.resetHistory();
        this.staticBeforeTest.resetHistory();
        this.staticAfterTest.resetHistory();
        this.staticAroundTest.resetHistory();
        this.staticBefore.resetHistory();
        this.staticAfter.resetHistory();
        this.staticAround.resetHistory();
    }
};

const Misc = Annotator.makePropDecorator('Misc');

class ParentParentClass {
    parentParentTest(...args : any[]) {
        SPIES.parentParentTest(...args);
        return 'parentParentTest';
    }
}

class ParentClass extends ParentParentClass {
    static staticParentTest(...args : any[]) {
        SPIES.staticParentTest(...args);
        return 'staticParentTest';
    }
    
    parentTest(...args : any[]) {
        SPIES.parentTest(...args);
        return 'parentTest';
    }
}

declare class TestClassDeclaration extends ParentClass {
    static staticBeforeTest(...args : any[]) : any;
    
    static staticAfterTest(...args : any[]) : any;
    
    static staticAroundTest(...args : any[]) : any;
    
    beforeTest(...args : any[]) : any;
    
    afterTest(...args : any[]) : any;
    
    aroundTest(...args : any[]) : any;
    misc(...args : any[]) : any;
    misc2(...args : any[]) : any;
}

describe('AopManager', () => {
    let TestClass : typeof TestClassDeclaration;
    let TestAspect : any;
    let manager : AopManager | undefined;
    let instance : TestClassDeclaration;
    
    beforeEach(() => {
        manager = new AopManager();
        TestClass = class extends ParentClass {
            static staticBeforeTest(...args : any[]) {
                SPIES.staticBeforeTest(...args);
                return 'staticBeforeTest';
            }
            
            static staticAfterTest(...args : any[]) {
                SPIES.staticAfterTest(...args);
                return 'staticAfterTest';
            }
            
            static staticAroundTest(...args : any[]) {
                SPIES.staticAroundTest(...args);
                return 'staticAroundTest';
            }
            
            beforeTest(...args : any[]) {
                SPIES.beforeTest(...args);
                return 'beforeTest';
            }
            
            afterTest(...args : any[]) {
                SPIES.afterTest(...args);
                return 'afterTest';
            }
            
            aroundTest(...args : any[]) {
                SPIES.aroundTest(...args);
                return 'aroundTest';
            }
    
            misc() {}
            misc2() {}
        };
        
        class _TestAspect {
            @Before(TestClass, /misc/)
            beforeAny(_jp : JoinpointContext) {}
    
            @Before(TestClass, [ 'misc', 'misc2' ])
            beforeSome(_jp : JoinpointContext) {}
            
            @Misc()
            @Before(TestClass, 'beforeTest')
            beforeAdvice(jp : JoinpointContext) {
                SPIES.before(jp);
                if(true === jp.getArgument(0)) {
                    jp.setArgument(1, 'foobar')
                }
            }
            
            @After(TestClass, 'afterTest')
            afterAdvice(jp : JoinpointContext) {
                SPIES.after(jp);
                if(true === jp.getArgument(0)) {
                    jp.setResult('foobar');
                }
            }
            
            @Around(TestClass, 'aroundTest')
            aroundAdvice(jp : JoinpointContext) {
                SPIES.around(jp);
                if(!jp.getArgument(0)) {
                    return jp.proceed();
                }
            }
            
            @Before(TestClass, 'parentTest')
            parentAdvice(jp : JoinpointContext) {
                SPIES.parent(jp);
            }
            
            @Before(TestClass, 'parentParentTest')
            parentParentAdvice(jp : JoinpointContext) {
                SPIES.parentParent(jp);
            }
            
            @BeforeStatic(TestClass, 'staticBeforeTest')
            staticBeforeAdvice(jp : JoinpointContext) {
                SPIES.staticBefore(jp);
                if(true === jp.getArgument(0)) {
                    jp.setArgument(1, 'foobar')
                }
            }
            
            @AfterStatic(TestClass, 'staticAfterTest')
            staticAfterAdvice(jp : JoinpointContext) {
                SPIES.staticAfter(jp);
                if(true === jp.getArgument(0)) {
                    jp.setResult('foobar');
                }
            }
            
            @AroundStatic(TestClass, 'staticAroundTest')
            staticAroundAdvice(jp : JoinpointContext) {
                SPIES.staticAround(jp);
                if(!jp.getArgument(0)) {
                    return jp.proceed();
                }
            }
            
            @BeforeStatic(TestClass, 'staticParentTest')
            staticParentAdvice() {}
        }
        
        TestAspect = _TestAspect;
    });
    
    afterEach(() => {
        SPIES.resetHistory();
    });
    
    describe('install (instance)', () => {
        it('should replace methods on prototype', () => {
            const beforeOrigin = TestClass.prototype.beforeTest;
            const afterOrigin = TestClass.prototype.afterTest;
            const aroundOrigin = TestClass.prototype.aroundTest;
            
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
            
            expect(instance.beforeTest).to.be.equal(TestClass.prototype.beforeTest);
            expect(instance.afterTest).to.be.equal(TestClass.prototype.afterTest);
            expect(instance.aroundTest).to.be.equal(TestClass.prototype.aroundTest);
            
            expect(instance.beforeTest).not.to.be.equal(beforeOrigin);
            expect(instance.afterTest).not.to.be.equal(afterOrigin);
            expect(instance.aroundTest).not.to.be.equal(aroundOrigin);
        });
        
        it('should restore methods on prototype', () => {
            const beforeOrigin = TestClass.prototype.beforeTest;
            const afterOrigin = TestClass.prototype.afterTest;
            const aroundOrigin = TestClass.prototype.aroundTest;
            
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
            
            (instance.beforeTest as Joinpoint).restore();
            (instance.afterTest as Joinpoint).restore();
            (instance.aroundTest as Joinpoint).restore();
            
            expect(instance.beforeTest).to.be.equal(beforeOrigin);
            expect(instance.afterTest).to.be.equal(afterOrigin);
            expect(instance.aroundTest).to.be.equal(aroundOrigin);
        });
        
        it('should set aspect on current prototype when overwriting parent method', () => {
            const parentOrigin = TestClass.prototype.parentTest;
            expect(Object.getOwnPropertyDescriptor(TestClass.prototype, 'parentTest')).to.be.undefined;
            
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
            
            expect(Object.getOwnPropertyDescriptor(TestClass.prototype, 'parentTest')).not.to.be.undefined;
            
            (instance.parentTest as Joinpoint).restore();
            
            expect(Object.getOwnPropertyDescriptor(TestClass.prototype, 'parentTest')).to.be.undefined;
            expect(instance.parentTest).to.be.equal(parentOrigin);
        });
        
        it('should call before advice', () => {
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
            
            expect(instance.beforeTest('a', 'b', 'c')).to.be.equal('beforeTest');
            
            expect(SPIES.before).to.have.been.calledOnce;
            expect(SPIES.beforeTest).to.have.been.calledOnceWith('a', 'b', 'c');
            expect(SPIES.before).to.have.been.calledBefore(SPIES.beforeTest);
            
            const jp : JoinpointContext = SPIES.before.getCall(0).args[0];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(instance);
            expect(jp.getMethod()).to.be.equal('beforeTest');
            
            SPIES.resetHistory();
            
            instance.beforeTest(true);
            expect(SPIES.beforeTest).to.have.been.calledOnceWith(true, 'foobar');
        });
        
        it('should call after advice', () => {
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
            
            expect(instance.afterTest()).to.be.equal('afterTest');
            
            expect(SPIES.after).to.have.been.calledOnce;
            expect(SPIES.afterTest).to.have.been.calledOnce;
            expect(SPIES.afterTest).to.have.been.calledBefore(SPIES.after);
    
            const jp : JoinpointContext = SPIES.after.getCall(0).args[0];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(instance);
            expect(jp.getMethod()).to.be.equal('afterTest');
            
            SPIES.resetHistory();
    
            expect(instance.afterTest(true)).to.be.equal('foobar');
            expect(SPIES.afterTest).to.have.been.calledOnceWith(true);
        });
        
        it('should call around advice', () => {
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
            
            expect(instance.aroundTest()).to.be.equal('aroundTest');
            
            expect(SPIES.around).to.have.been.calledOnce;
            expect(SPIES.aroundTest).to.have.been.calledOnce;
            expect(SPIES.around).to.have.been.calledBefore(SPIES.aroundTest);
    
            const jp : JoinpointContext = SPIES.around.getCall(0).args[0];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(instance);
            expect(jp.getMethod()).to.be.equal('aroundTest');
            
            SPIES.resetHistory();
            
            expect(instance.aroundTest(true)).to.be.undefined;
            expect(SPIES.around).to.have.been.calledOnce;
            expect(SPIES.aroundTest).not.to.have.been.called;
        });
        
        it('should call parent method', () => {
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
            
            expect(instance.parentTest()).to.be.equal('parentTest');
        })
    });
    
    describe('install (static)', () => {
        it('should replace static methods', () => {
            const beforeOrigin = TestClass.staticBeforeTest;
            const afterOrigin = TestClass.staticAfterTest;
            const aroundOrigin = TestClass.staticAroundTest;
            
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
            
            expect(TestClass.staticBeforeTest).not.to.be.equal(beforeOrigin);
            expect(TestClass.staticAfterTest).not.to.be.equal(afterOrigin);
            expect(TestClass.staticAroundTest).not.to.be.equal(aroundOrigin);
        });
        
        it('should set aspect on current class when overwriting parent method', () => {
            const parentOrigin = TestClass.staticParentTest;
            expect(Object.getOwnPropertyDescriptor(TestClass, 'staticParentTest')).to.be.undefined;
        
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
        
            expect(Object.getOwnPropertyDescriptor(TestClass, 'staticParentTest')).not.to.be.undefined;
        
            (TestClass.staticParentTest as Joinpoint).restore();
    
            expect(Object.getOwnPropertyDescriptor(TestClass, 'staticParentTest')).to.be.undefined;
            expect(TestClass.staticParentTest).to.be.equal(parentOrigin);
        });
        
        it('should restore static methods', () => {
            const beforeOrigin = TestClass.staticBeforeTest;
            const afterOrigin = TestClass.staticAfterTest;
            const aroundOrigin = TestClass.staticAroundTest;
            
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
            
            (TestClass.staticBeforeTest as Joinpoint).restore();
            (TestClass.staticAfterTest as Joinpoint).restore();
            (TestClass.staticAroundTest as Joinpoint).restore();
            
            expect(TestClass.staticBeforeTest).to.be.equal(beforeOrigin);
            expect(TestClass.staticAfterTest).to.be.equal(afterOrigin);
            expect(TestClass.staticAroundTest).to.be.equal(aroundOrigin);
        });
        
        it('should call before advice', () => {
            manager!.install([ new TestAspect() ]);
            
            expect(TestClass.staticBeforeTest()).to.be.equal('staticBeforeTest');
            
            expect(SPIES.staticBefore).to.have.been.calledOnce;
            expect(SPIES.staticBeforeTest).to.have.been.calledOnce;
            expect(SPIES.staticBefore).to.have.been.calledBefore(SPIES.staticBeforeTest);
    
            const jp : JoinpointContext = SPIES.staticBefore.getCall(0).args[0];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(TestClass);
            expect(jp.getMethod()).to.be.equal('staticBeforeTest');
    
            SPIES.resetHistory();
    
            TestClass.staticBeforeTest(true);
            expect(SPIES.staticBeforeTest).to.have.been.calledOnceWith(true, 'foobar');
        });
        
        it('should call after advice', () => {
            manager!.install([ new TestAspect() ]);
            
            expect(TestClass.staticAfterTest()).to.be.equal('staticAfterTest');
            
            expect(SPIES.staticAfter).to.have.been.calledOnce;
            expect(SPIES.staticAfterTest).to.have.been.calledOnce;
            expect(SPIES.staticAfterTest).to.have.been.calledBefore(SPIES.staticAfter);
    
            const jp : JoinpointContext = SPIES.staticAfter.getCall(0).args[0];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(TestClass);
            expect(jp.getMethod()).to.be.equal('staticAfterTest');
    
            SPIES.resetHistory();
    
            expect(TestClass.staticAfterTest(true)).to.be.equal('foobar');
            expect(SPIES.staticAfterTest).to.have.been.calledOnceWith(true);
        });
        
        it('should call around advice', () => {
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
    
            expect(TestClass.staticAroundTest()).to.be.equal('staticAroundTest');
            
            expect(SPIES.staticAround).to.have.been.calledOnce;
            expect(SPIES.staticAroundTest).to.have.been.calledOnce;
            expect(SPIES.staticAround).to.have.been.calledBefore(SPIES.staticAroundTest);
    
            const jp : JoinpointContext = SPIES.staticAround.getCall(0).args[0];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(TestClass);
            expect(jp.getMethod()).to.be.equal('staticAroundTest');
    
            SPIES.resetHistory();
    
            expect(TestClass.staticAroundTest(true)).to.be.undefined;
            expect(SPIES.staticAround).to.have.been.calledOnce;
            expect(SPIES.staticAroundTest).not.to.have.been.called;
        });
    });
    
});
