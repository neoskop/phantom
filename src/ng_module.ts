import { Inject, InjectionToken, ModuleWithProviders, NgModule, Optional, Type } from '@angular/core';
import { AopManager } from '@neoskop/phantom';

export const ASPECTS = new InjectionToken<object[]>('Aspect');

@NgModule({
    providers: [
        AopManager
    ]
})
export class AopRootModule {
    constructor(manager : AopManager,
                @Optional() @Inject(ASPECTS) aspects?: object[]) {
        if(aspects) {
            manager.install(aspects);
        }
    }
}

@NgModule()
export class AopModule {
    static forRoot(aspects?: Type<any>[]) : ModuleWithProviders {
        return {
            ngModule: AopRootModule,
            providers: aspects && aspects.map(aspect => ({ provide: ASPECTS, useClass: aspect, multi: true }))
        }
    }
    
    static forChild(aspects?: Type<any>[]) : ModuleWithProviders {
        return {
            ngModule: AopModule,
            providers: aspects && aspects.map(aspect => ({ provide: ASPECTS, useClass: aspect, multi: true }))
        }
    }
}
