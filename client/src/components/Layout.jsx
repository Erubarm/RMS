import React, { useEffect, useState } from 'react';
import {
  SplitLayout,
  SplitCol,
  View,
  Panel,
  Tabbar,
  TabbarItem,
} from '@vkontakte/vkui';
import {
  Icon28HomeOutline,
  Icon28ListOutline,
  Icon28TicketOutline,
  Icon28InfoCircleOutline,
  Icon28UserCircleOutline,
} from '@vkontakte/icons';
import { useActiveVkuiLocation, useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import useStore from '../store/useStore';

import Home from '../pages/Home';
import Poster from '../pages/Poster';
import ExpositionDetail from '../pages/ExpositionDetail';
import ExcursionDetail from '../pages/ExcursionDetail';
import Booking from '../pages/Booking';
import MyBookings from '../pages/MyBookings';
import Events from '../pages/Events';
import Info from '../pages/Info';
import Faq from '../pages/Faq';
import TeacherForm from '../pages/TeacherForm';
import Profile from '../pages/Profile';

function Layout() {
  const location = useActiveVkuiLocation();
  const routeNavigator = useRouteNavigator();
  const [ready, setReady] = useState(false);
  const popout = useStore((state) => state.popout);

  const activePanel = location?.panel || 'home';

  useEffect(() => {
    // Ensure hash route is set on first load
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      window.location.hash = '#/';
    }
    // Small delay to let router initialize
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!ready && !location?.panel) {
    return (
      <SplitLayout>
        <SplitCol>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <span>Загрузка...</span>
          </div>
        </SplitCol>
      </SplitLayout>
    );
  }

  const getTabSelection = () => {
    switch (activePanel) {
      case 'home':
        return '/';
      case 'poster':
      case 'exposition':
      case 'excursion':
        return '/poster';
      case 'myBookings':
        return '/my-bookings';
      case 'info':
      case 'faq':
        return '/info';
      case 'profile':
      case 'teacher':
        return '/profile';
      default:
        return '/';
    }
  };

  const currentTab = getTabSelection();

  const tabbar = (
    <Tabbar>
      <TabbarItem
        selected={currentTab === '/'}
        onClick={() => routeNavigator.push('/')}
        text="Главная"
      >
        <Icon28HomeOutline />
      </TabbarItem>
      <TabbarItem
        selected={currentTab === '/poster'}
        onClick={() => routeNavigator.push('/poster')}
        text="Афиша"
      >
        <Icon28ListOutline />
      </TabbarItem>
      <TabbarItem
        selected={currentTab === '/my-bookings'}
        onClick={() => routeNavigator.push('/my-bookings')}
        text="Мои записи"
      >
        <Icon28TicketOutline />
      </TabbarItem>
      <TabbarItem
        selected={currentTab === '/info'}
        onClick={() => routeNavigator.push('/info')}
        text="Инфо"
      >
        <Icon28InfoCircleOutline />
      </TabbarItem>
      <TabbarItem
        selected={currentTab === '/profile'}
        onClick={() => routeNavigator.push('/profile')}
        text="Профиль"
      >
        <Icon28UserCircleOutline />
      </TabbarItem>
    </Tabbar>
  );

  return (
    <SplitLayout popout={popout}>
      <SplitCol>
        <View id="main" activePanel={activePanel} nav="main">
          <Panel id="home" nav="home">
            <Home />
          </Panel>
          <Panel id="poster" nav="poster">
            <Poster />
          </Panel>
          <Panel id="exposition" nav="exposition">
            <ExpositionDetail />
          </Panel>
          <Panel id="excursion" nav="excursion">
            <ExcursionDetail />
          </Panel>
          <Panel id="booking" nav="booking">
            <Booking />
          </Panel>
          <Panel id="myBookings" nav="myBookings">
            <MyBookings />
          </Panel>
          <Panel id="events" nav="events">
            <Events />
          </Panel>
          <Panel id="info" nav="info">
            <Info />
          </Panel>
          <Panel id="faq" nav="faq">
            <Faq />
          </Panel>
          <Panel id="teacher" nav="teacher">
            <TeacherForm />
          </Panel>
          <Panel id="profile" nav="profile">
            <Profile />
          </Panel>
        </View>
      </SplitCol>
    </SplitLayout>
  );
}

export default Layout;
