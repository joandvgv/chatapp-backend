declare module "@schibsted/middy-error-handler" {
  import middy from "@middy/core";

  interface Options {
    logger?: (error: any) => void;
    fallbackMessage?: string;
  }

  export default function httpErrorHandler(
    options?: Options
  ): middy.MiddlewareObj;
}
