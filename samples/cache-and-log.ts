import { After, AopManager, Around, Before, JoinpointContext } from '../src/public_api';

class Fibonacci {
    calculate(n : number) : number {
        if(n == 0) {
            return 0
        } else if(n == 1) {
            return 1;
        } else {
            return this.calculate(n - 1) + this.calculate(n - 2);
        }
    }
}

class LoggerAspect {
    @Before(Fibonacci, 'calculate')
    beforeCalculate(jp : JoinpointContext) {
        console.log('-->', jp.getArgument(0))
    }
    
    @After(Fibonacci, 'calculate')
    afterCalculate(jp : JoinpointContext) {
        console.log('<--', jp.getResult())
    }
}

class CacheAspect {
    readonly cache = new Map<number, number>();
    
    @Around(Fibonacci, 'calculate')
    aroundCalculate(jp : JoinpointContext) {
        if(!this.cache.has(jp.getArgument(0))) {
            this.cache.set(jp.getArgument(0), jp.proceed());
        }
        
        return this.cache.get(jp.getArgument(0));
    }
}

const manager = new AopManager();
manager.install([ new LoggerAspect(), new CacheAspect() ]); // note the sorting

const fib = new Fibonacci();

console.log('Fibonacci: 10', fib.calculate(10));
console.log('Fibonacci: 8', fib.calculate(8));
