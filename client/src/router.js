import { createHashRouter, createPanel, createRoot, createView, RoutesConfig } from '@vkontakte/vk-mini-apps-router';

const routes = RoutesConfig.create([
  createRoot('main_root', [
    createView('main', [
      createPanel('home', '/', []),
      createPanel('poster', '/poster', []),
      createPanel('exposition', '/exposition/:id', []),
      createPanel('excursion', '/excursion/:id', []),
      createPanel('booking', '/booking/:excursionId', []),
      createPanel('myBookings', '/my-bookings', []),
      createPanel('events', '/events', []),
      createPanel('info', '/info', []),
      createPanel('faq', '/faq', []),
      createPanel('teacher', '/teacher', []),
      createPanel('profile', '/profile', []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
