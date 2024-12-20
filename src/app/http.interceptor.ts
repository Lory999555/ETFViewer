import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  //put your free api key from https://polygon.io/dashboard/api-keys here (sign up if you don't have one)
  //tocca capire come togliere l'info da qua e metterla in un enviroment e soprattutto come legare questa cosa con vercel.
  const apiKey = import.meta.env['NG_APP_API_KEY'];
  request = request.clone({
    setParams: {
      apiKey: apiKey,
    },
  });
  return next(request);
};
