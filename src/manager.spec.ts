import 'mocha';
import { expect, use } from 'chai';
import { spy } from 'sinon';
import { AopManager, GetterJoinpointContext, Joinpoint, JoinpointContext, SetterJoinpointContext } from './manager';
import {
    After,
    AfterStatic,
    Around,
    AroundStatic,
    Before,
    BeforeStatic,
    Getter,
    Setter, StaticGetter,
    StaticSetter
} from './metadata';
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
    withoutValue    : spy(),
    withValue       : spy(),
    parentValue     : spy(),
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
        this.withoutValue.resetHistory();
        this.withValue.resetHistory();
        this.parentValue.resetHistory();
    }
};

const Misc = Annotator.makePropDecorator('Misc');

class ParentParentClass {
    $parentParent : any;
    get parentParent() {
        return this.$parentParent;
    }
    set parentParent(v : any) {
        this.$parentParent = v;
    }
    
    static $parentParent : any;
    static get parentParent() {
        return this.$parentParent;
    }
    static set parentParent(v : any) {
        this.$parentParent = v;
    }
    
    parentParentTest(...args : any[]) {
        SPIES.parentParentTest(...args);
        return 'parentParentTest';
    }
}

class ParentClass extends ParentParentClass {
    $parent : any;
    get parent() {
        return this.$parent;
    }
    set parent(v : any) {
        this.$parent = v;
    }
    
    static $parent : any;
    static get parent() {
        return this.$parent;
    }
    static set parent(v : any) {
        this.$parent = v;
    }
    
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
    withoutValue : any;
    withValue : any;
    
    static withoutValue : any;
    static withValue : any;
    
    readonly getterOnly : any;
    setterOnly : any;
    
    static readonly getterOnly : any;
    static setterOnly : any;
    
    
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
            withoutValue : any;
            withValue : any = 'val123';
            
            static withoutValue : any;
            static withValue : any = 'val123';
            
            get getterOnly() {
                return 'getterOnlyValue';
            }
            
            set setterOnly(v : any) {
                (this as any).$setterOnly = v;
            }
            
            static get getterOnly() {
                return 'getterOnlyValue';
            }
            
            static set setterOnly(v : any) {
                (this as any).$setterOnly = v;
            }
            
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
            
            misc() {
            }
            
            misc2() {
            }
        };
        
        class _TestAspect {
            @Before(TestClass, /misc/)
            beforeAny(_jp : JoinpointContext) {
            }
            
            @Before(TestClass, [ 'misc', 'misc2' ])
            beforeSome(_jp : JoinpointContext) {
            }
            
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
            staticParentAdvice() {
            }
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
        
        it('should set aspect on current prototype when overwriting parent property', () => {
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
            
            const jp : JoinpointContext = SPIES.before.getCall(0).args[ 0 ];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(instance);
            expect(jp.getProperty()).to.be.equal('beforeTest');
            expect(jp.getPointcut()).to.be.instanceOf(Before);
            
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
            
            const jp : JoinpointContext = SPIES.after.getCall(0).args[ 0 ];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(instance);
            expect(jp.getProperty()).to.be.equal('afterTest');
            expect(jp.getPointcut()).to.be.instanceOf(After);
            
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
            
            const jp : JoinpointContext = SPIES.around.getCall(0).args[ 0 ];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(instance);
            expect(jp.getProperty()).to.be.equal('aroundTest');
            expect(jp.getPointcut()).to.be.instanceOf(Around);
            
            SPIES.resetHistory();
            
            expect(instance.aroundTest(true)).to.be.undefined;
            expect(SPIES.around).to.have.been.calledOnce;
            expect(SPIES.aroundTest).not.to.have.been.called;
        });
        
        it('should call parent property', () => {
            manager!.install([ new TestAspect() ]);
            instance = new TestClass();
            
            expect(instance.parentTest()).to.be.equal('parentTest');
        })
    });
    
    describe('install (instance property)', () => {
        const setterAdviceWithout = spy();
        const getterAdviceWithout = spy();
        const setterAdviceWith = spy();
        const getterAdviceWith = spy();
        it('should set and get standard values', () => {
            class Aspect {
                @Setter(TestClass, 'withoutValue')
                setterAdviceWithout(jp : SetterJoinpointContext) {
                    setterAdviceWithout(jp);
                    jp.proceed();
                }
    
                @Getter(TestClass, 'withoutValue')
                getterAdviceWithout(jp : GetterJoinpointContext) {
                    getterAdviceWithout(jp);
                    return jp.getValue();
                }
                @Setter(TestClass, 'withValue')
                setterAdviceWith(jp : SetterJoinpointContext) {
                    setterAdviceWith(jp);
                    if(jp.getArgument()) {
                        jp.proceed();
                    }
                }
    
                @Getter(TestClass, 'withValue')
                getterAdviceWith(jp : GetterJoinpointContext) {
                    getterAdviceWith(jp);
                    const value = jp.getValue();
                    return value;
                }
            }
            manager!.install([ new Aspect() ]);
            instance = new TestClass();
            
            expect(setterAdviceWithout).not.to.have.been.called;
            expect(getterAdviceWithout).not.to.have.been.called;
            expect(setterAdviceWith).to.have.been.calledOnce;
            expect(getterAdviceWith).not.to.have.been.called;
            
            expect(instance.withoutValue).to.be.undefined;
            expect(instance.withValue).to.be.equal('val123');
    
            expect(setterAdviceWithout).not.to.have.been.called;
            expect(getterAdviceWithout).to.have.been.calledOnce;
            expect(setterAdviceWith).to.have.been.calledOnce;
            expect(getterAdviceWith).to.have.been.calledOnce;
    
            instance.withoutValue = '123';
            instance.withValue = '456';
            
            expect(setterAdviceWithout).to.have.been.calledOnce;
            expect(getterAdviceWithout).to.have.been.calledOnce;
            expect(setterAdviceWith).to.have.been.calledTwice;
            expect(getterAdviceWith).to.have.been.calledOnce;
            
            expect(instance.withoutValue).to.be.equal('123');
            expect(instance.withValue).to.be.equal('456');
            
            expect(setterAdviceWithout).to.have.been.calledOnce;
            expect(getterAdviceWithout).to.have.been.calledTwice;
            expect(setterAdviceWith).to.have.been.calledTwice;
            expect(getterAdviceWith).to.have.been.calledTwice;
            
            instance.withValue = false;
            
            expect(instance.withValue).to.be.equal('456');
        });
        
        it('should use parent accessors', () => {
            const setterParent = spy();
            const getterParent = spy();
            const setterParentParent = spy();
            const getterParentParent = spy();
            class Aspect {
                @Setter(TestClass, 'parent')
                setterParent(jp : SetterJoinpointContext) {
                    setterParent(jp);
                    jp.proceed();
                }
        
                @Getter(TestClass, 'parent')
                getterParent(jp : GetterJoinpointContext) {
                    getterParent(jp);
                    return jp.getValue();
                }
                
                @Setter(TestClass, 'parentParent')
                setterParentParent(jp : SetterJoinpointContext) {
                    setterParentParent(jp);
                    jp.proceed();
                }
        
                @Getter(TestClass, 'parentParent')
                getterParentParent(jp : GetterJoinpointContext) {
                    getterParentParent(jp);
                    return jp.getValue();
                }
            }
            manager!.install([ new Aspect() ]);
            instance = new TestClass();
            
            expect(setterParent).not.to.have.been.called;
            expect(getterParent).not.to.have.been.called;
            expect(setterParentParent).not.to.have.been.called;
            expect(getterParentParent).not.to.have.been.called;
            
            expect(instance.parent).to.be.undefined;
            expect(instance.parentParent).to.be.undefined;
            
            expect(setterParent).not.to.have.been.called;
            expect(getterParent).to.have.been.calledOnce;
            expect(setterParentParent).not.to.have.been.called;
            expect(getterParentParent).to.have.been.calledOnce;
            
            instance.parent = 'p';
            instance.parentParent = 'pp';
    
            expect(setterParent).to.have.been.calledOnce;
            expect(getterParent).to.have.been.calledOnce;
            expect(setterParentParent).to.have.been.calledOnce;
            expect(getterParentParent).to.have.been.calledOnce;
            
            expect(instance.$parent).to.be.equal('p');
            expect(instance.$parentParent).to.be.equal('pp');
            expect(instance.parent).to.be.equal('p');
            expect(instance.parentParent).to.be.equal('pp');
        });
        
        it('should throw on getter aspect on setter only', () => {
            class Aspect {
                @Getter(TestClass, 'setterOnly')
                getter(jp : GetterJoinpointContext) {
                    return jp.getValue();
                }
            }
            
            expect(() => {
                manager!.install([ new Aspect() ]);
            }).to.throw('Cannot install getter, only setter available');
        });
        
        it('should throw on setter aspect on getter only', () => {
            class Aspect {
                @Setter(TestClass, 'getterOnly')
                setter(jp : SetterJoinpointContext) {
                    jp.proceed();
                }
            }
            
            expect(() => {
                manager!.install([ new Aspect() ]);
            }).to.throw('Cannot install setter, only getter available');
        });
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
        
        it('should set aspect on current class when overwriting parent property', () => {
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
            
            const jp : JoinpointContext = SPIES.staticBefore.getCall(0).args[ 0 ];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(TestClass);
            expect(jp.getProperty()).to.be.equal('staticBeforeTest');
            
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
            
            const jp : JoinpointContext = SPIES.staticAfter.getCall(0).args[ 0 ];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(TestClass);
            expect(jp.getProperty()).to.be.equal('staticAfterTest');
            
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
            
            const jp : JoinpointContext = SPIES.staticAround.getCall(0).args[ 0 ];
            expect(jp).to.be.instanceOf(JoinpointContext);
            expect(jp.getContext()).to.be.equal(TestClass);
            expect(jp.getProperty()).to.be.equal('staticAroundTest');
            
            SPIES.resetHistory();
            
            expect(TestClass.staticAroundTest(true)).to.be.undefined;
            expect(SPIES.staticAround).to.have.been.calledOnce;
            expect(SPIES.staticAroundTest).not.to.have.been.called;
        });
    });
    
    describe('install (static property)', () => {
        const setterAdviceWithout = spy();
        const getterAdviceWithout = spy();
        const setterAdviceWith = spy();
        const getterAdviceWith = spy();
        it('should set and get standard values', () => {
            class Aspect {
                @StaticSetter(TestClass, 'withoutValue')
                setterAdviceWithout(jp : SetterJoinpointContext) {
                    setterAdviceWithout(jp);
                    jp.proceed();
                }
                
                @StaticGetter(TestClass, 'withoutValue')
                getterAdviceWithout(jp : GetterJoinpointContext) {
                    getterAdviceWithout(jp);
                    return jp.getValue();
                }
                @StaticSetter(TestClass, 'withValue')
                setterAdviceWith(jp : SetterJoinpointContext) {
                    setterAdviceWith(jp);
                    if(jp.getArgument()) {
                        jp.proceed();
                    }
                }
                
                @StaticGetter(TestClass, 'withValue')
                getterAdviceWith(jp : GetterJoinpointContext) {
                    getterAdviceWith(jp);
                    const value = jp.getValue();
                    return value;
                }
            }
            manager!.install([ new Aspect() ]);
            
            expect(setterAdviceWithout).not.to.have.been.called;
            expect(getterAdviceWithout).not.to.have.been.called;
            expect(setterAdviceWith).not.to.have.been.called;
            expect(getterAdviceWith).not.to.have.been.called;

            expect(TestClass.withoutValue).to.be.undefined;
            expect(TestClass.withValue).to.be.equal('val123');

            expect(setterAdviceWithout).not.to.have.been.called;
            expect(getterAdviceWithout).to.have.been.calledOnce;
            expect(setterAdviceWith).not.to.have.been.called;
            expect(getterAdviceWith).to.have.been.calledOnce;

            TestClass.withoutValue = '123';
            TestClass.withValue = '456';

            expect(setterAdviceWithout).to.have.been.calledOnce;
            expect(getterAdviceWithout).to.have.been.calledOnce;
            expect(setterAdviceWith).to.have.been.calledOnce;
            expect(getterAdviceWith).to.have.been.calledOnce;

            expect(TestClass.withoutValue).to.be.equal('123');
            expect(TestClass.withValue).to.be.equal('456');

            expect(setterAdviceWithout).to.have.been.calledOnce;
            expect(getterAdviceWithout).to.have.been.calledTwice;
            expect(setterAdviceWith).to.have.been.calledOnce;
            expect(getterAdviceWith).to.have.been.calledTwice;

            TestClass.withValue = false;

            expect(TestClass.withValue).to.be.equal('456');
        });
        
        it('should use parent accessors', () => {
            const setterParent = spy();
            const getterParent = spy();
            const setterParentParent = spy();
            const getterParentParent = spy();
            class Aspect {
                @StaticSetter(TestClass, 'parent')
                setterParent(jp : SetterJoinpointContext) {
                    setterParent(jp);
                    jp.proceed();
                }
                
                @StaticGetter(TestClass, 'parent')
                getterParent(jp : GetterJoinpointContext) {
                    getterParent(jp);
                    return jp.getValue();
                }
                
                @StaticSetter(TestClass, 'parentParent')
                setterParentParent(jp : SetterJoinpointContext) {
                    setterParentParent(jp);
                    jp.proceed();
                }
                
                @StaticGetter(TestClass, 'parentParent')
                getterParentParent(jp : GetterJoinpointContext) {
                    getterParentParent(jp);
                    return jp.getValue();
                }
            }
            manager!.install([ new Aspect() ]);
            
            expect(setterParent).not.to.have.been.called;
            expect(getterParent).not.to.have.been.called;
            expect(setterParentParent).not.to.have.been.called;
            expect(getterParentParent).not.to.have.been.called;
            
            expect(TestClass.parent).to.be.undefined;
            expect(TestClass.parentParent).to.be.undefined;
            
            expect(setterParent).not.to.have.been.called;
            expect(getterParent).to.have.been.calledOnce;
            expect(setterParentParent).not.to.have.been.called;
            expect(getterParentParent).to.have.been.calledOnce;
            
            TestClass.parent = 'p';
            TestClass.parentParent = 'pp';
            
            expect(setterParent).to.have.been.calledOnce;
            expect(getterParent).to.have.been.calledOnce;
            expect(setterParentParent).to.have.been.calledOnce;
            expect(getterParentParent).to.have.been.calledOnce;
            
            expect(TestClass.$parent).to.be.equal('p');
            expect(TestClass.$parentParent).to.be.equal('pp');
            expect(TestClass.parent).to.be.equal('p');
            expect(TestClass.parentParent).to.be.equal('pp');
        });
        
        it('should throw on getter aspect on setter only', () => {
            class Aspect {
                @StaticGetter(TestClass, [ 'setterOnly' ])
                getter(jp : GetterJoinpointContext) {
                    return jp.getValue();
                }
            }
            
            expect(() => {
                manager!.install([ new Aspect() ]);
            }).to.throw('Cannot install getter, only setter available');
        });
        
        it('should throw on setter aspect on getter only', () => {
            class Aspect {
                @StaticSetter(TestClass, [ 'getterOnly' ])
                setter(jp : SetterJoinpointContext) {
                    jp.proceed();
                }
            }
            
            expect(() => {
                manager!.install([ new Aspect() ]);
            }).to.throw('Cannot install setter, only getter available');
        });
    });
    
});
