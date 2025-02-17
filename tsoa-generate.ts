import { title } from "process";
import {
  generateRoutes,
  generateSpec,
  ExtendedRoutesConfig,
  ExtendedSpecConfig,
} from "tsoa";

(async () => {
  const filePath = __dirname;
  const specOptions: ExtendedSpecConfig = {
    basePath: "/api",
    entryFile: filePath + "/src/index.ts",
    specVersion: 3,
    outputDirectory: filePath + "/src/swagger",
    controllerPathGlobs: [filePath + "/src/controllers/*.ts"],
    noImplicitAdditionalProperties: "silently-remove-extras",
    securityDefinitions: {
      JWT: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
      tsoa_auth: {
        type: "oauth2",
        authorizationUrl: "http://swagger.io/api/oauth/dialog",
        flow: "implicit",
        scopes: {
          "write:pets": "modify things",
          "read:pets": "read things",
        },
      },
    },
    version: "1.00",
    description:
      "Một dự án API quản lí và đặt vé xem phim tích hợp thanh toán trực tuyến momo,stripe, database:mysql",
    name: "API Vé xem phim",
  };
  const routeOptions: ExtendedRoutesConfig = {
    basePath: "/api",
    controllerPathGlobs: [filePath + "/src/controllers/*.ts"],
    entryFile: filePath + "/src/index.ts",
    routesDir: filePath + "/src/routes",
    bodyCoercion: true,
    noImplicitAdditionalProperties: "silently-remove-extras",
    authenticationModule: filePath + "/src/middlewares/authentication.ts",
  };
  await generateSpec(specOptions);
  await generateRoutes(routeOptions);
})();
