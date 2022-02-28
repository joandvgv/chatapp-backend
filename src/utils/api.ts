export const apiResponse = <T extends object>(
  statusCode: number,
  body: T,
  newHeaders?: Record<string, string>,
  contentType?: string
) => {
  const statusGroup = ("" + statusCode)[0];
  //HTTP status codes MUST belong to these groups, according to the standard
  const validGroups = ["1", "2", "3", "4", "5"];
  if (!validGroups.includes(statusGroup)) {
    throw new Error(`Invalid HTTP status code: ${statusCode}`);
  }

  return {
    statusCode,
    body: body as unknown as string, // will be parsed by middleware,
    headers: {
      // TODO: limit access control to domain specific after
      "Access-Control-Allow-Origin":
        "https://naughty-noether-ea5b97.netlify.app", //TODO: update,
      "Access-Control-Allow-Credentials": true,
      "Content-type": contentType ? contentType : "application/json",
      ...newHeaders,
    },
  };
};
