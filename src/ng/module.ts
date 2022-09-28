import { Inject, InjectionToken, ModuleWithProviders, NgModule, Optional, Type } from '@angular/core';
import { AopManager } from '@neoskop/phantom';

export const ASPECTS = new InjectionToken<object[]|object[][]>('Aspect');

export function instanceFactory(...instances : any[]) {
    return instances;
}

@NgModule({
    providers: [
        AopManager
    ]
})
export class PhantomRootModule {
    constructor(manager : AopManager,
                @Optional() @Inject(ASPECTS) aspects?: (object|object[])[]) {
        if(aspects) {
            aspects = aspects.reduce<object[]>((r, c) => Array.isArray(c) ? r.concat(c) as any : [ ...r, c ] as any, []);
            manager.install(aspects);
        }
    }
}

@NgModule()
export class PhantomModule {
    static forRoot(aspects: Type<any>[]) : ModuleWithProviders<PhantomRootModule> {
        return {
            ngModule: PhantomRootModule,
            providers: [
                aspects,
                {
                    provide: ASPECTS,
                    useFactory: instanceFactory,
                    deps: aspects,
                    multi: true
                }
            ]
        }
    }
    
    static forChild(aspects: Type<any>[]) : ModuleWithProviders<PhantomModule> {
        return {
            ngModule: PhantomModule,
            providers: [
                aspects,
                {
                    provide: ASPECTS,
                    useFactory: instanceFactory,
                    deps: aspects,
                    multi: true
                }
            ]
        }
    }
}

export { PhantomRootModule as AopRootModule, PhantomModule as AopModule };
