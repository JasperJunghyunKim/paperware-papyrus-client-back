/* istanbul ignore file */
import { Injectable, RequestMethod } from '@nestjs/common';
import { CONTROLLER_WATERMARK, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';

@Injectable()
export class RouteScanService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScannerService: MetadataScanner,
    private readonly reflector: Reflector,
  ) {
    const controllers = this.discoveryService.getControllers().filter((wrapper: InstanceWrapper) => {
      if (!wrapper?.metatype) {
        return false;
      }

      return !!this.reflector.get(CONTROLLER_WATERMARK, wrapper.metatype);
    });

    const routes = [];

    controllers.forEach((controller) => {
      const instance = controller.instance;
      const prototype = Object.getPrototypeOf(instance);

      const controllerPath: string = this.reflector.get(PATH_METADATA, controller.metatype);

      this.metadataScannerService.scanFromPrototype(instance, prototype, (name) => {
        const handler = prototype[name];

        const path: string = Reflect.getMetadata(PATH_METADATA, handler);
        const method: RequestMethod = Reflect.getMetadata(METHOD_METADATA, handler);

        if (path !== null && method !== null) {
          if (path === '/') {
            routes.push({
              method: RequestMethod[method],
              fullPath: `/${controllerPath}`,
            });
          } else {
            routes.push({
              method: RequestMethod[method],
              fullPath: `/${controllerPath}/${path}`,
            });
          }
        }
      });
    });
  }
}
