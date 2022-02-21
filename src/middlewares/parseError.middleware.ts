import { apiResponse } from "../utils/api";

export const parseErrorsMiddleware = () => ({
  onError: (handler: any) => {
    const hasHTTPCode = handler.error.code;

    if (!hasHTTPCode) {
      return; // delegate to main http handler
    }
    const { code, message } = handler.error;
    return apiResponse(code, { error: message });
  },
});
