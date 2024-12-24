import swaggerJsDoc from 'swagger-jsdoc';
import { SwaggerOptions } from 'swagger-jsdoc';

const options: SwaggerOptions = {
  definition: {
    openapi: '3.0.0', // Phiên bản Swagger OpenAPI
    info: {
      title: 'API Documentation Movie Ticket Online', // Tên API
      version: '1.0.0',           // Phiên bản API
      description: 'Đầy là tài liệu API về project Nodejs của tui làm về đặt vé xem phim online',
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL của API
      },
    ],
  },
  // Quét các file route, bạn có thể thay đổi đường dẫn tùy theo cấu trúc dự án của mình
  apis: ['./openapi/*.yaml'],
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;
