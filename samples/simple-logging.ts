import { AopManager, Before, After, JoinpointContext } from '../src/public_api';

class TestClass {
    foo(arg : string) {
        return arg.toUpperCase();
    }
    bar(arg : string) {
        return arg.toLowerCase()
    }
}

class LoggerAspect {
    @Before(TestClass, /./)
    beforeEach(jp : JoinpointContext) {
        console.log('> TestClass', jp.getProperty(), jp.getArguments());
    }
    
    @After(TestClass, /./)
    afterEach(jp : JoinpointContext) {
        console.log('< TestClass', jp.getProperty(), jp.getResult());
    }
}

const manager = new AopManager();
manager.install([ new LoggerAspect() ]);

const instance = new TestClass();

console.log(instance.foo('Foo'));
console.log(instance.bar('Bar'));
