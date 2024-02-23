import { SuccessResponseCode, FailureResponseCode } from "~/assets/const/HttpResponseCode";
import { modelFormatOptions } from "~/assets/data/model";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const name = to.params.name;
  const query = to.query.model_format;
  try {
    const response = await restAPI.get(`/kserve/${name}`);
    if (response) {
      if (response.code !== SuccessResponseCode) {
        if (response.code === FailureResponseCode) {
          alert(`"${name}"라는 Inference Service가 존재하지 않습니다.
Inference Service 이름을 다시 한번 확인해주세요.`);
        }
        else {
          console.log(response.message);
        }
        return navigateTo('/services');
      }
      else {
        if (to.fullPath.startsWith('/test')) {
          if (query) {
            if (!modelFormatOptions.includes(query)) {
              alert(`model format을 다시 확인해주세요.
  현재 입력된 model format: ${query}`);
              return navigateTo('/services');
            }
          }
          else {
            alert(`model format이 입력되지 않았습니다.`);
            return navigateTo('/services');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading data:', error);
    return navigateTo('/services');
  }
})