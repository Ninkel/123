import { getToday, getSlotsForDate } from './database.js';

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;
        const params = url.searchParams;

        await delay(500);

        if (params.get('error') === '1') {
          return sendJson(res, 500, { error: 'Внутренняя ошибка сервера' });
        }

        try {
          if (pathname === '/api/today') {
            return sendJson(res, 200, getToday());
          }

          if (pathname === '/api/slots') {
            const dateStr = params.get('date');
            if (!dateStr) {
              return sendJson(res, 400, { error: 'Параметр date обязателен' });
            }
            const slots = getSlotsForDate(dateStr);
            return sendJson(res, 200, { slots });
          }

          return sendJson(res, 404, { error: 'Эндпоинт не найден' });
        } catch (err) {
          return sendJson(res, 500, { error: err.message });
        }
      });
    }
  };
}
