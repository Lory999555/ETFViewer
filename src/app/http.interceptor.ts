import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {

  //put here your api key from https://polygon.io/dashboard/api-keys (sign up if you don't have one)
  const apiKey = 'your-api-key';
  request = request.clone({
    setParams: {
      apiKey: apiKey,
    },
  });
  return next(request);
};
