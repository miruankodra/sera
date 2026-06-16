import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {StorageService} from '../services/storage.service';
import {StoragePaths} from '../models/constants/storage-paths';
import {RoutePaths} from '../models/constants/route-paths';

export const authGuard: CanActivateFn = async () => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  const hasToken = await storageService.has(StoragePaths.AUTHORIZATION_TOKEN);
  if (!hasToken) {
    return router.createUrlTree([RoutePaths.login]);
  }
  return true;
};
