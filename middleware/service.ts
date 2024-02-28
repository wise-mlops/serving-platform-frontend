import { SuccessResponseCode, NotFoundErrorResponseCode } from "~/assets/const/HttpResponseCode";
import { modelFormatOptions } from "~/assets/data/model";

/**
 * 올바르지 않은 접근이거나 Status가 Ready가 아닐 때, 상세보기 페이지와 테스트 페이지 접근 제한
 * 1. 올바르지 않은 접근
 *   a. 존재하지 않는 inference service일 때
 *   b. model format이 유효하지 않을 때
 *   c. # todo: 등록할 때 설정한 model format이 아닐 때 테스트 페이지 접근 제한
 *              지금은 url 직접 입력 시 model format 변경해도 테스트 페이지 접근 가능
 * 2. Status가 Ready가 아닐 때
 *   a. Status === "Unknown"
 *   b. Status === "False"
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const name = to.params.name;
  const query = to.query.model_format;
  try {
    const response = await restAPI.get(`/kserve/stat/${name}`);
    if (response) {
      if (response.code !== SuccessResponseCode) {
        if (response.code === NotFoundErrorResponseCode) {
          alert(`"${name}"라는 Inference Service가 존재하지 않습니다.
Inference Service 이름을 다시 한번 확인해주세요.`);
        }
        else {
          console.log(response.message);
        }
        return navigateTo('/services');
      }
      else {
        if (response.result === "True") {
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
        else {
          alert('Inference Service의 상태가 Ready일 때만 접근 가능합니다.');
          return navigateTo('/services');
        }
      }
    }
  } catch (error) {
    console.error('Error loading data:', error);
    return navigateTo('/services');
  }
})