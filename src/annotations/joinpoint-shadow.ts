/**
 * Marks a method explicit as joinpoint shadow
 * Required for annotated methods!
 * @example
 * ```
 * class Controller {
 *     @Get('/')
 *     @JoinpointShadow() // IMPORTANT: as last annotation!
 *     method() {
 *         return 'foo';
 *     }
 * }
 * ```
 */
 export function JoinpointShadow() : MethodDecorator {
    return (_target: Object, _propertyKey : string | symbol, descriptor: PropertyDescriptor) => {
        descriptor.value = Object.assign(function(this : any) {
            return descriptor.value.JoinpointShadow.apply(this, arguments);
        }, { JoinpointShadow: descriptor.value });

        return descriptor;
    }
}