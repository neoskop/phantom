import {
  AopManager,
  GetterJoinpointContext,
  Joinpoint,
  JoinpointContext,
  SetterJoinpointContext,
} from "./manager";
import {
  After,
  AfterStatic,
  Around,
  AroundStatic,
  Before,
  BeforeStatic,
  Getter,
  Setter,
  StaticGetter,
  StaticSetter,
  JoinpointShadow,
} from "./metadata";
import { Annotator } from "@neoskop/annotation-factory";

const SPIES = {
  parentParentTest: jest.fn(),
  parentTest: jest.fn(),
  beforeTest: jest.fn(),
  afterTest: jest.fn(),
  aroundTest: jest.fn(),
  before: jest.fn(),
  after: jest.fn(),
  around: jest.fn(),
  parentParent: jest.fn(),
  parent: jest.fn(),
  staticBeforeTest: jest.fn(),
  staticAfterTest: jest.fn(),
  staticAroundTest: jest.fn(),
  staticBefore: jest.fn(),
  staticAfter: jest.fn(),
  staticAround: jest.fn(),
  staticParentTest: jest.fn(),
  withoutValue: jest.fn(),
  withValue: jest.fn(),
  parentValue: jest.fn(),
  mockReset() {
    this.parentParentTest.mockReset();
    this.parentTest.mockReset();
    this.beforeTest.mockReset();
    this.afterTest.mockReset();
    this.aroundTest.mockReset();
    this.before.mockReset();
    this.after.mockReset();
    this.around.mockReset();
    this.parentParent.mockReset();
    this.parent.mockReset();
    this.staticBeforeTest.mockReset();
    this.staticAfterTest.mockReset();
    this.staticAroundTest.mockReset();
    this.staticBefore.mockReset();
    this.staticAfter.mockReset();
    this.staticAround.mockReset();
    this.withoutValue.mockReset();
    this.withValue.mockReset();
    this.parentValue.mockReset();
  },
};

const Misc = Annotator.makePropDecorator("Misc");

class ParentParentClass {
  $parentParent: any;
  get parentParent() {
    return this.$parentParent;
  }
  set parentParent(v: any) {
    this.$parentParent = v;
  }

  static $parentParent: any;
  static get parentParent() {
    return this.$parentParent;
  }
  static set parentParent(v: any) {
    this.$parentParent = v;
  }

  parentParentTest(...args: any[]) {
    SPIES.parentParentTest(...args);
    return "parentParentTest";
  }
}

class ParentClass extends ParentParentClass {
  $parent: any;
  get parent() {
    return this.$parent;
  }
  set parent(v: any) {
    this.$parent = v;
  }

  static $parent: any;
  static get parent() {
    return this.$parent;
  }
  static set parent(v: any) {
    this.$parent = v;
  }

  static staticParentTest(...args: any[]) {
    SPIES.staticParentTest(...args);
    return "staticParentTest";
  }

  parentTest(...args: any[]) {
    SPIES.parentTest(...args);
    return "parentTest";
  }
}

declare class TestClassDeclaration extends ParentClass {
  withoutValue: any;
  withValue: any;

  static withoutValue: any;
  static withValue: any;

  readonly getterOnly: any;
  setterOnly: any;

  static readonly getterOnly: any;
  static setterOnly: any;

  static staticBeforeTest(...args: any[]): any;

  static staticAfterTest(...args: any[]): any;

  static staticAroundTest(...args: any[]): any;

  beforeTest(intercept?: boolean | string, name?: string, ...args: any[]): any;

  afterTest(...args: any[]): any;

  aroundTest(...args: any[]): any;

  misc(...args: any[]): any;

  misc2(...args: any[]): any;
}

declare class TestClassJoinpointShadowDeclaration {
  static staticMethod(arg: string): string;

  method(arg: string): string;
}

describe("AopManager", () => {
  let TestClass: typeof TestClassDeclaration;
  let TestClassJoinpointShadow: typeof TestClassJoinpointShadowDeclaration;
  let TestAspect: any;
  let TestAspectJoinpointShadow: any;
  let manager: AopManager | undefined;
  let instance: TestClassDeclaration;

  beforeEach(() => {
    manager = new AopManager();
    TestClass = class extends ParentClass {
      withoutValue: any;
      withValue: any = "val123";

      static withoutValue: any;
      static withValue: any = "val123";

      get getterOnly() {
        return "getterOnlyValue";
      }

      set setterOnly(v: any) {
        (this as any).$setterOnly = v;
      }

      static get getterOnly() {
        return "getterOnlyValue";
      }

      static set setterOnly(v: any) {
        (this as any).$setterOnly = v;
      }

      static staticBeforeTest(...args: any[]) {
        SPIES.staticBeforeTest(...args);
        return "staticBeforeTest";
      }

      static staticAfterTest(...args: any[]) {
        SPIES.staticAfterTest(...args);
        return "staticAfterTest";
      }

      static staticAroundTest(...args: any[]) {
        SPIES.staticAroundTest(...args);
        return "staticAroundTest";
      }

      beforeTest(...args: any[]) {
        SPIES.beforeTest(...args);
        return "beforeTest";
      }

      afterTest(...args: any[]) {
        SPIES.afterTest(...args);
        return "afterTest";
      }

      aroundTest(...args: any[]) {
        SPIES.aroundTest(...args);
        return "aroundTest";
      }

      misc() {}

      misc2() {}
    };

    class _TestAspect {
      @Before(TestClass, /misc/)
      beforeAny(_jp: JoinpointContext<TestClassDeclaration, "misc">) {}

      @Before(TestClass, ["misc", "misc2"])
      beforeSome(
        _jp: JoinpointContext<TestClassDeclaration, "misc" | "misc2">
      ) {}

      @Misc()
      @Before(TestClass, "beforeTest")
      beforeAdvice(jp: JoinpointContext<TestClassDeclaration, "beforeTest">) {
        SPIES.before(jp);
        if (true === jp.getArgument(0)) {
          jp.setArgument(1, "foobar");
        }
      }

      @After(TestClass, "afterTest")
      afterAdvice(jp: JoinpointContext<TestClassDeclaration, "afterTest">) {
        SPIES.after(jp);
        if (true === jp.getArgument(0)) {
          jp.setResult("foobar");
        }
      }

      @Around(TestClass, "aroundTest")
      aroundAdvice(jp: JoinpointContext<TestClassDeclaration, "aroundTest">) {
        SPIES.around(jp);
        if (!jp.getArgument(0)) {
          return jp.proceed();
        }
      }

      @Before(TestClass, "parentTest")
      parentAdvice(jp: JoinpointContext<TestClassDeclaration, "parentTest">) {
        SPIES.parent(jp);
      }

      @Before(TestClass, "parentParentTest")
      parentParentAdvice(
        jp: JoinpointContext<TestClassDeclaration, "parentParentTest">
      ) {
        SPIES.parentParent(jp);
      }

      @BeforeStatic(TestClass, "staticBeforeTest")
      staticBeforeAdvice(
        jp: JoinpointContext<typeof TestClassDeclaration, "staticBeforeTest">
      ) {
        SPIES.staticBefore(jp);
        if (true === jp.getArgument(0)) {
          jp.setArgument(1, "foobar");
        }
      }

      @AfterStatic(TestClass, "staticAfterTest")
      staticAfterAdvice(
        jp: JoinpointContext<typeof TestClassDeclaration, "staticAfterTest">
      ) {
        SPIES.staticAfter(jp);
        if (true === jp.getArgument(0)) {
          jp.setResult("foobar");
        }
      }

      @AroundStatic(TestClass, "staticAroundTest")
      staticAroundAdvice(
        jp: JoinpointContext<typeof TestClassDeclaration, "staticAroundTest">
      ) {
        SPIES.staticAround(jp);
        if (!jp.getArgument(0)) {
          return jp.proceed();
        }
      }

      @BeforeStatic(TestClass, "staticParentTest")
      staticParentAdvice() {}
    }

    class TestClassJoinpointShadow_
      implements TestClassJoinpointShadowDeclaration
    {
      @JoinpointShadow()
      static staticMethod(arg: string) {
        return arg.toUpperCase();
      }

      @JoinpointShadow()
      method(arg: string) {
        return arg.toUpperCase();
      }
    }

    class TestAspectJoinpointShadow_ {
      @AfterStatic(TestClassJoinpointShadow_, "staticMethod")
      afterStaticMethod(
        jp: JoinpointContext<typeof TestClassJoinpointShadow_, "staticMethod">
      ) {
        jp.setResult(jp.getResult() + "+AFTER");
      }

      @After(TestClassJoinpointShadow_, "method")
      afterMethod(jp: JoinpointContext<TestClassJoinpointShadow_, "method">) {
        jp.setResult(jp.getResult() + "+AFTER");
      }
    }

    TestAspectJoinpointShadow = TestAspectJoinpointShadow_;
    TestClassJoinpointShadow = TestClassJoinpointShadow_;
    TestAspect = _TestAspect;
  });

  afterEach(() => {
    SPIES.mockReset();
  });

  describe("install (instance)", () => {
    it("should replace methods on prototype", () => {
      const beforeOrigin = TestClass.prototype.beforeTest;
      const afterOrigin = TestClass.prototype.afterTest;
      const aroundOrigin = TestClass.prototype.aroundTest;

      manager!.install([new TestAspect()]);
      instance = new TestClass();

      expect(instance.beforeTest).toEqual(TestClass.prototype.beforeTest);
      expect(instance.afterTest).toEqual(TestClass.prototype.afterTest);
      expect(instance.aroundTest).toEqual(TestClass.prototype.aroundTest);

      expect(instance.beforeTest).not.toEqual(beforeOrigin);
      expect(instance.afterTest).not.toEqual(afterOrigin);
      expect(instance.aroundTest).not.toEqual(aroundOrigin);
    });

    it("should restore methods on prototype", () => {
      const beforeOrigin = TestClass.prototype.beforeTest;
      const afterOrigin = TestClass.prototype.afterTest;
      const aroundOrigin = TestClass.prototype.aroundTest;

      manager!.install([new TestAspect()]);
      instance = new TestClass();

      (instance.beforeTest as Joinpoint).restore();
      (instance.afterTest as Joinpoint).restore();
      (instance.aroundTest as Joinpoint).restore();

      expect(instance.beforeTest).toEqual(beforeOrigin);
      expect(instance.afterTest).toEqual(afterOrigin);
      expect(instance.aroundTest).toEqual(aroundOrigin);
    });

    it("should set aspect on current prototype when overwriting parent property", () => {
      const parentOrigin = TestClass.prototype.parentTest;
      expect(
        Object.getOwnPropertyDescriptor(TestClass.prototype, "parentTest")
      ).toBeUndefined();

      manager!.install([new TestAspect()]);
      instance = new TestClass();

      expect(
        Object.getOwnPropertyDescriptor(TestClass.prototype, "parentTest")
      ).not.toBeUndefined();

      (instance.parentTest as Joinpoint).restore();

      expect(
        Object.getOwnPropertyDescriptor(TestClass.prototype, "parentTest")
      ).toBeUndefined();
      expect(instance.parentTest).toEqual(parentOrigin);
    });

    it("should call before advice", () => {
      manager!.install([new TestAspect()]);
      instance = new TestClass();

      expect(instance.beforeTest("a", "b", "c")).toEqual("beforeTest");

      expect(SPIES.before).toHaveBeenCalledTimes(1);
      expect(SPIES.beforeTest).toHaveBeenCalledWith("a", "b", "c");
      // expect(SPIES.before).to.have.been.calledBefore(SPIES.beforeTest);

      const jp: JoinpointContext<TestClassDeclaration, "beforeTest"> =
        SPIES.before.mock.calls[0][0];
      expect(jp).toBeInstanceOf(JoinpointContext);
      expect(jp.getContext()).toEqual(instance);
      expect(jp.getProperty()).toEqual("beforeTest");
      expect(jp.getPointcut()).toBeInstanceOf(Before);

      SPIES.mockReset();

      instance.beforeTest(true);
      expect(SPIES.beforeTest).toHaveBeenCalledWith(true, "foobar");
    });

    it("should call after advice", () => {
      manager!.install([new TestAspect()]);
      instance = new TestClass();

      expect(instance.afterTest()).toEqual("afterTest");

      expect(SPIES.after).toHaveBeenCalledTimes(1);
      expect(SPIES.afterTest).toHaveBeenCalledTimes(1);
      // expect(SPIES.afterTest).to.have.been.calledBefore(SPIES.after);

      const jp: JoinpointContext<TestClassDeclaration, "afterTest"> =
        SPIES.after.mock.calls[0][0];
      expect(jp).toBeInstanceOf(JoinpointContext);
      expect(jp.getContext()).toEqual(instance);
      expect(jp.getProperty()).toEqual("afterTest");
      expect(jp.getPointcut()).toBeInstanceOf(After);

      SPIES.mockReset();

      expect(instance.afterTest(true)).toEqual("foobar");
      expect(SPIES.afterTest).toHaveBeenCalledWith(true);
    });

    it("should call around advice", () => {
      manager!.install([new TestAspect()]);
      instance = new TestClass();

      expect(instance.aroundTest()).toEqual("aroundTest");

      expect(SPIES.around).toHaveBeenCalledTimes(1);
      expect(SPIES.aroundTest).toHaveBeenCalledTimes(1);
      // expect(SPIES.around).to.have.been.calledBefore(SPIES.aroundTest);

      const jp: JoinpointContext<TestClassDeclaration, "aroundTest"> =
        SPIES.around.mock.calls[0][0];
      expect(jp).toBeInstanceOf(JoinpointContext);
      expect(jp.getContext()).toEqual(instance);
      expect(jp.getProperty()).toEqual("aroundTest");
      expect(jp.getPointcut()).toBeInstanceOf(Around);

      SPIES.mockReset();

      expect(instance.aroundTest(true)).toBeUndefined();
      expect(SPIES.around).toHaveBeenCalledTimes(1);
      expect(SPIES.aroundTest).not.toHaveBeenCalled();
    });

    it("should call parent property", () => {
      manager!.install([new TestAspect()]);
      instance = new TestClass();

      expect(instance.parentTest()).toEqual("parentTest");
    });

    it("should use inner joinpoint shadow", () => {
      const origin = TestClassJoinpointShadow.prototype.method;
      manager!.install([new TestAspectJoinpointShadow()]);

      const instance = new TestClassJoinpointShadow();

      expect(instance.method).toEqual(origin);
      expect(instance.method("foo")).toEqual("FOO+AFTER");
    });
  });

  describe("install (instance property)", () => {
    const setterAdviceWithout = jest.fn();
    const getterAdviceWithout = jest.fn();
    const setterAdviceWith = jest.fn();
    const getterAdviceWith = jest.fn();
    it("should set and get standard values", () => {
      class Aspect {
        @Setter(TestClass, "withoutValue")
        setterAdviceWithout(
          jp: SetterJoinpointContext<TestClassDeclaration, "withoutValue">
        ) {
          setterAdviceWithout(jp);
          jp.proceed();
        }

        @Getter(TestClass, "withoutValue")
        getterAdviceWithout(
          jp: GetterJoinpointContext<TestClassDeclaration, "withoutValue">
        ) {
          getterAdviceWithout(jp);
          return jp.getValue();
        }
        @Setter(TestClass, "withValue")
        setterAdviceWith(
          jp: SetterJoinpointContext<TestClassDeclaration, "withValue">
        ) {
          setterAdviceWith(jp);
          if (jp.getArgument()) {
            jp.proceed();
          }
        }

        @Getter(TestClass, "withValue")
        getterAdviceWith(
          jp: GetterJoinpointContext<TestClassDeclaration, "withValue">
        ) {
          getterAdviceWith(jp);
          const value = jp.getValue();
          return value;
        }
      }
      manager!.install([new Aspect()]);
      instance = new TestClass();

      expect(setterAdviceWithout).not.toHaveBeenCalled();
      expect(getterAdviceWithout).not.toHaveBeenCalled();
      expect(setterAdviceWith).toHaveBeenCalledTimes(1);
      expect(getterAdviceWith).not.toHaveBeenCalled();

      expect(instance.withoutValue).toBeUndefined();
      expect(instance.withValue).toEqual("val123");

      expect(setterAdviceWithout).not.toHaveBeenCalled();
      expect(getterAdviceWithout).toHaveBeenCalledTimes(1);
      expect(setterAdviceWith).toHaveBeenCalledTimes(1);
      expect(getterAdviceWith).toHaveBeenCalledTimes(1);

      instance.withoutValue = "123";
      instance.withValue = "456";

      expect(setterAdviceWithout).toHaveBeenCalledTimes(1);
      expect(getterAdviceWithout).toHaveBeenCalledTimes(1);
      expect(setterAdviceWith).toHaveBeenCalledTimes(2);
      expect(getterAdviceWith).toHaveBeenCalledTimes(1);

      expect(instance.withoutValue).toEqual("123");
      expect(instance.withValue).toEqual("456");

      expect(setterAdviceWithout).toHaveBeenCalledTimes(1);
      expect(getterAdviceWithout).toHaveBeenCalledTimes(2);
      expect(setterAdviceWith).toHaveBeenCalledTimes(2);
      expect(getterAdviceWith).toHaveBeenCalledTimes(2);

      instance.withValue = false;

      expect(instance.withValue).toEqual("456");
    });

    it("should use parent accessors", () => {
      const setterParent = jest.fn();
      const getterParent = jest.fn();
      const setterParentParent = jest.fn();
      const getterParentParent = jest.fn();
      class Aspect {
        @Setter(TestClass, "parent")
        setterParent(
          jp: SetterJoinpointContext<TestClassDeclaration, "parent">
        ) {
          setterParent(jp);
          jp.proceed();
        }

        @Getter(TestClass, "parent")
        getterParent(
          jp: GetterJoinpointContext<TestClassDeclaration, "parent">
        ) {
          getterParent(jp);
          return jp.getValue();
        }

        @Setter(TestClass, "parentParent")
        setterParentParent(
          jp: SetterJoinpointContext<TestClassDeclaration, "parentParent">
        ) {
          setterParentParent(jp);
          jp.proceed();
        }

        @Getter(TestClass, "parentParent")
        getterParentParent(
          jp: GetterJoinpointContext<TestClassDeclaration, "parentParent">
        ) {
          getterParentParent(jp);
          return jp.getValue();
        }
      }
      manager!.install([new Aspect()]);
      instance = new TestClass();

      expect(setterParent).not.toHaveBeenCalled();
      expect(getterParent).not.toHaveBeenCalled();
      expect(setterParentParent).not.toHaveBeenCalled();
      expect(getterParentParent).not.toHaveBeenCalled();

      expect(instance.parent).toBeUndefined();
      expect(instance.parentParent).toBeUndefined();

      expect(setterParent).not.toHaveBeenCalled();
      expect(getterParent).toHaveBeenCalledTimes(1);
      expect(setterParentParent).not.toHaveBeenCalled();
      expect(getterParentParent).toHaveBeenCalledTimes(1);

      instance.parent = "p";
      instance.parentParent = "pp";

      expect(setterParent).toHaveBeenCalledTimes(1);
      expect(getterParent).toHaveBeenCalledTimes(1);
      expect(setterParentParent).toHaveBeenCalledTimes(1);
      expect(getterParentParent).toHaveBeenCalledTimes(1);

      expect(instance.$parent).toEqual("p");
      expect(instance.$parentParent).toEqual("pp");
      expect(instance.parent).toEqual("p");
      expect(instance.parentParent).toEqual("pp");
    });

    it("should throw on getter aspect on setter only", () => {
      class Aspect {
        @Getter(TestClass, "setterOnly")
        getter(jp: GetterJoinpointContext<TestClassDeclaration, "setterOnly">) {
          return jp.getValue();
        }
      }

      expect(() => {
        manager!.install([new Aspect()]);
      }).toThrow("Cannot install getter, only setter available");
    });

    it("should throw on setter aspect on getter only", () => {
      class Aspect {
        @Setter(TestClass, "getterOnly")
        setter(jp: SetterJoinpointContext<TestClassDeclaration, "getterOnly">) {
          jp.proceed();
        }
      }

      expect(() => {
        manager!.install([new Aspect()]);
      }).toThrow("Cannot install setter, only getter available");
    });
  });

  describe("install (static)", () => {
    it("should replace static methods", () => {
      const beforeOrigin = TestClass.staticBeforeTest;
      const afterOrigin = TestClass.staticAfterTest;
      const aroundOrigin = TestClass.staticAroundTest;

      manager!.install([new TestAspect()]);
      instance = new TestClass();

      expect(TestClass.staticBeforeTest).not.toEqual(beforeOrigin);
      expect(TestClass.staticAfterTest).not.toEqual(afterOrigin);
      expect(TestClass.staticAroundTest).not.toEqual(aroundOrigin);
    });

    it("should set aspect on current class when overwriting parent property", () => {
      const parentOrigin = TestClass.staticParentTest;
      expect(
        Object.getOwnPropertyDescriptor(TestClass, "staticParentTest")
      ).toBeUndefined();

      manager!.install([new TestAspect()]);
      instance = new TestClass();

      expect(
        Object.getOwnPropertyDescriptor(TestClass, "staticParentTest")
      ).not.toBeUndefined();

      (TestClass.staticParentTest as Joinpoint).restore();

      expect(
        Object.getOwnPropertyDescriptor(TestClass, "staticParentTest")
      ).toBeUndefined();
      expect(TestClass.staticParentTest).toEqual(parentOrigin);
    });

    it("should restore static methods", () => {
      const beforeOrigin = TestClass.staticBeforeTest;
      const afterOrigin = TestClass.staticAfterTest;
      const aroundOrigin = TestClass.staticAroundTest;

      manager!.install([new TestAspect()]);
      instance = new TestClass();

      (TestClass.staticBeforeTest as Joinpoint).restore();
      (TestClass.staticAfterTest as Joinpoint).restore();
      (TestClass.staticAroundTest as Joinpoint).restore();

      expect(TestClass.staticBeforeTest).toEqual(beforeOrigin);
      expect(TestClass.staticAfterTest).toEqual(afterOrigin);
      expect(TestClass.staticAroundTest).toEqual(aroundOrigin);
    });

    it("should call before advice", () => {
      manager!.install([new TestAspect()]);

      expect(TestClass.staticBeforeTest()).toEqual("staticBeforeTest");

      expect(SPIES.staticBefore).toHaveBeenCalledTimes(1);
      expect(SPIES.staticBeforeTest).toHaveBeenCalledTimes(1);
      // expect(SPIES.staticBefore).to.have.been.calledBefore(SPIES.staticBeforeTest);

      const jp: JoinpointContext<
        typeof TestClassDeclaration,
        "staticBeforeTest"
      > = SPIES.staticBefore.mock.calls[0][0];
      expect(jp).toBeInstanceOf(JoinpointContext);
      expect(jp.getContext()).toEqual(TestClass);
      expect(jp.getProperty()).toEqual("staticBeforeTest");

      SPIES.mockReset();

      TestClass.staticBeforeTest(true);
      expect(SPIES.staticBeforeTest).toHaveBeenCalledWith(true, "foobar");
    });

    it("should call after advice", () => {
      manager!.install([new TestAspect()]);

      expect(TestClass.staticAfterTest()).toEqual("staticAfterTest");

      expect(SPIES.staticAfter).toHaveBeenCalledTimes(1);
      expect(SPIES.staticAfterTest).toHaveBeenCalledTimes(1);
      // expect(SPIES.staticAfterTest).to.have.been.calledBefore(SPIES.staticAfter);

      const jp: JoinpointContext<
        typeof TestClassDeclaration,
        "staticAfterTest"
      > = SPIES.staticAfter.mock.calls[0][0];
      expect(jp).toBeInstanceOf(JoinpointContext);
      expect(jp.getContext()).toEqual(TestClass);
      expect(jp.getProperty()).toEqual("staticAfterTest");

      SPIES.mockReset();

      expect(TestClass.staticAfterTest(true)).toEqual("foobar");
      expect(SPIES.staticAfterTest).toHaveBeenCalledWith(true);
    });

    it("should call around advice", () => {
      manager!.install([new TestAspect()]);
      instance = new TestClass();

      expect(TestClass.staticAroundTest()).toEqual("staticAroundTest");

      expect(SPIES.staticAround).toHaveBeenCalledTimes(1);
      expect(SPIES.staticAroundTest).toHaveBeenCalledTimes(1);
      // expect(SPIES.staticAround).to.have.been.calledBefore(SPIES.staticAroundTest);

      const jp: JoinpointContext<
        typeof TestClassDeclaration,
        "staticAroundTest"
      > = SPIES.staticAround.mock.calls[0][0];
      expect(jp).toBeInstanceOf(JoinpointContext);
      expect(jp.getContext()).toEqual(TestClass);
      expect(jp.getProperty()).toEqual("staticAroundTest");

      SPIES.mockReset();

      expect(TestClass.staticAroundTest(true)).toBeUndefined();
      expect(SPIES.staticAround).toHaveBeenCalledTimes(1);
      expect(SPIES.staticAroundTest).not.toHaveBeenCalled();
    });

    it("should use inner joinpoint shadow", () => {
      const origin = TestClassJoinpointShadow.staticMethod;
      manager!.install([new TestAspectJoinpointShadow()]);

      expect(TestClassJoinpointShadow.staticMethod).toBe(origin);
      expect(TestClassJoinpointShadow.staticMethod("foo")).toEqual("FOO+AFTER");
    });
  });

  describe("install (static property)", () => {
    const setterAdviceWithout = jest.fn();
    const getterAdviceWithout = jest.fn();
    const setterAdviceWith = jest.fn();
    const getterAdviceWith = jest.fn();
    it("should set and get standard values", () => {
      class Aspect {
        @StaticSetter(TestClass, "withoutValue")
        setterAdviceWithout(
          jp: SetterJoinpointContext<
            typeof TestClassDeclaration,
            "withoutValue"
          >
        ) {
          setterAdviceWithout(jp);
          jp.proceed();
        }

        @StaticGetter(TestClass, "withoutValue")
        getterAdviceWithout(
          jp: GetterJoinpointContext<
            typeof TestClassDeclaration,
            "withoutValue"
          >
        ) {
          getterAdviceWithout(jp);
          return jp.getValue();
        }
        @StaticSetter(TestClass, "withValue")
        setterAdviceWith(
          jp: SetterJoinpointContext<typeof TestClassDeclaration, "withValue">
        ) {
          setterAdviceWith(jp);
          if (jp.getArgument()) {
            jp.proceed();
          }
        }

        @StaticGetter(TestClass, "withValue")
        getterAdviceWith(
          jp: GetterJoinpointContext<typeof TestClassDeclaration, "withValue">
        ) {
          getterAdviceWith(jp);
          const value = jp.getValue();
          return value;
        }
      }
      manager!.install([new Aspect()]);

      expect(setterAdviceWithout).not.toHaveBeenCalled();
      expect(getterAdviceWithout).not.toHaveBeenCalled();
      expect(setterAdviceWith).not.toHaveBeenCalled();
      expect(getterAdviceWith).not.toHaveBeenCalled();

      expect(TestClass.withoutValue).toBeUndefined();
      expect(TestClass.withValue).toEqual("val123");

      expect(setterAdviceWithout).not.toHaveBeenCalled();
      expect(getterAdviceWithout).toHaveBeenCalledTimes(1);
      expect(setterAdviceWith).not.toHaveBeenCalled();
      expect(getterAdviceWith).toHaveBeenCalledTimes(1);

      TestClass.withoutValue = "123";
      TestClass.withValue = "456";

      expect(setterAdviceWithout).toHaveBeenCalledTimes(1);
      expect(getterAdviceWithout).toHaveBeenCalledTimes(1);
      expect(setterAdviceWith).toHaveBeenCalledTimes(1);
      expect(getterAdviceWith).toHaveBeenCalledTimes(1);

      expect(TestClass.withoutValue).toEqual("123");
      expect(TestClass.withValue).toEqual("456");

      expect(setterAdviceWithout).toHaveBeenCalledTimes(1);
      expect(getterAdviceWithout).toHaveBeenCalledTimes(2);
      expect(setterAdviceWith).toHaveBeenCalledTimes(1);
      expect(getterAdviceWith).toHaveBeenCalledTimes(2);

      TestClass.withValue = false;

      expect(TestClass.withValue).toEqual("456");
    });

    it("should use parent accessors", () => {
      const setterParent = jest.fn();
      const getterParent = jest.fn();
      const setterParentParent = jest.fn();
      const getterParentParent = jest.fn();
      class Aspect {
        @StaticSetter(TestClass, "parent")
        setterParent(
          jp: SetterJoinpointContext<typeof TestClassDeclaration, "parent">
        ) {
          setterParent(jp);
          jp.proceed();
        }

        @StaticGetter(TestClass, "parent")
        getterParent(
          jp: GetterJoinpointContext<typeof TestClassDeclaration, "parent">
        ) {
          getterParent(jp);
          return jp.getValue();
        }

        @StaticSetter(TestClass, "parentParent")
        setterParentParent(
          jp: SetterJoinpointContext<
            typeof TestClassDeclaration,
            "parentParent"
          >
        ) {
          setterParentParent(jp);
          jp.proceed();
        }

        @StaticGetter(TestClass, "parentParent")
        getterParentParent(
          jp: GetterJoinpointContext<
            typeof TestClassDeclaration,
            "parentParent"
          >
        ) {
          getterParentParent(jp);
          return jp.getValue();
        }
      }
      manager!.install([new Aspect()]);

      expect(setterParent).not.toHaveBeenCalled();
      expect(getterParent).not.toHaveBeenCalled();
      expect(setterParentParent).not.toHaveBeenCalled();
      expect(getterParentParent).not.toHaveBeenCalled();

      expect(TestClass.parent).toBeUndefined();
      expect(TestClass.parentParent).toBeUndefined();

      expect(setterParent).not.toHaveBeenCalled();
      expect(getterParent).toHaveBeenCalledTimes(1);
      expect(setterParentParent).not.toHaveBeenCalled();
      expect(getterParentParent).toHaveBeenCalledTimes(1);

      TestClass.parent = "p";
      TestClass.parentParent = "pp";

      expect(setterParent).toHaveBeenCalledTimes(1);
      expect(getterParent).toHaveBeenCalledTimes(1);
      expect(setterParentParent).toHaveBeenCalledTimes(1);
      expect(getterParentParent).toHaveBeenCalledTimes(1);

      expect(TestClass.$parent).toEqual("p");
      expect(TestClass.$parentParent).toEqual("pp");
      expect(TestClass.parent).toEqual("p");
      expect(TestClass.parentParent).toEqual("pp");
    });

    it("should throw on getter aspect on setter only", () => {
      class Aspect {
        @StaticGetter(TestClass, ["setterOnly"])
        getter(
          jp: GetterJoinpointContext<typeof TestClassDeclaration, "setterOnly">
        ) {
          return jp.getValue();
        }
      }

      expect(() => {
        manager!.install([new Aspect()]);
      }).toThrow("Cannot install getter, only setter available");
    });

    it("should throw on setter aspect on getter only", () => {
      class Aspect {
        @StaticSetter(TestClass, ["getterOnly"])
        setter(
          jp: SetterJoinpointContext<typeof TestClassDeclaration, "getterOnly">
        ) {
          jp.proceed();
        }
      }

      expect(() => {
        manager!.install([new Aspect()]);
      }).toThrow("Cannot install setter, only getter available");
    });
  });
});
