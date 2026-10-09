import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceUrl: string) => {
  return proxy(serviceUrl, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Never forward a client-supplied user ID; only the session can set it
      delete proxyReqOpts.headers["x-user-id"];

      if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      }

      return proxyReqOpts;
    },
  });
};
