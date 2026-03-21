import React, { useEffect, useState } from 'react';
import {
  PanelHeader,
  Group,
  Header,
  SimpleCell,
  Avatar,
  Box,
  Title,
  Text,
  Spacing,
  Switch,
  Snackbar,
} from '@vkontakte/vkui';
import {
  Icon28TicketOutline,
  Icon28EducationOutline,
  Icon28Notifications,
  Icon28FavoriteOutline,
  Icon28CheckCircleOutline,
  Icon28CancelCircleOutline,
} from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import useStore from '../store/useStore';
import { getUserInfo, allowNotifications, denyNotifications, addToFavorites } from '../utils/vkBridge';
import client from '../api/client';

function Profile() {
  const routeNavigator = useRouteNavigator();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    if (!user) {
      getUserInfo().then((info) => {
        if (info) setUser(info);
      });
    }
  }, [user, setUser]);

  // Загрузить статус подписки при монтировании
  useEffect(() => {
    client.get('/notifications/status')
      .then((res) => setNotifyEnabled(res.data.notifyEnabled))
      .catch(() => {});
  }, []);

  const showSnackbar = (text, success = true) => {
    setSnackbar(
      <Snackbar
        onClose={() => setSnackbar(null)}
        before={
          success
            ? <Icon28CheckCircleOutline fill="var(--vkui--color_accent_green)" />
            : <Icon28CancelCircleOutline fill="var(--vkui--color_text_negative)" />
        }
      >
        {text}
      </Snackbar>
    );
  };

  const handleNotifyToggle = async () => {
    setNotifyLoading(true);
    try {
      if (!notifyEnabled) {
        // Запрашиваем разрешение через VK Bridge
        const granted = await allowNotifications();
        if (!granted) {
          showSnackbar('Вы запретили уведомления в настройках VK', false);
          setNotifyLoading(false);
          return;
        }
        await client.post('/notifications/subscribe');
        setNotifyEnabled(true);
        showSnackbar('Уведомления включены');
      } else {
        await denyNotifications();
        await client.delete('/notifications/subscribe');
        setNotifyEnabled(false);
        showSnackbar('Уведомления отключены');
      }
    } catch {
      showSnackbar('Не удалось изменить настройки уведомлений', false);
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    const added = await addToFavorites();
    if (added) {
      showSnackbar('Приложение добавлено в избранное');
    } else {
      showSnackbar('Не удалось добавить в избранное', false);
    }
  };

  return (
    <>
      <PanelHeader>Профиль</PanelHeader>

      <Group>
        {!user ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <span>Загрузка...</span>
          </div>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
            <Avatar size={96} src={user.photo_200 || user.photo_100} />
            <Spacing size={12} />
            <Title level="2">
              {user.first_name} {user.last_name}
            </Title>
            {user.city?.title && (
              <>
                <Spacing size={4} />
                <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                  {user.city.title}
                </Text>
              </>
            )}
          </Box>
        )}
      </Group>

      <Group header={<Header>Меню</Header>}>
        <SimpleCell
          before={<Icon28TicketOutline />}
          expandable="auto"
          onClick={() => routeNavigator.push('/my-bookings')}
        >
          Мои бронирования
        </SimpleCell>
        <SimpleCell
          before={<Icon28EducationOutline />}
          expandable="auto"
          onClick={() => routeNavigator.push('/teacher')}
        >
          Для учителей
        </SimpleCell>
      </Group>

      <Group header={<Header>Настройки</Header>}>
        <SimpleCell
          before={<Icon28Notifications />}
          after={
            <Switch
              checked={notifyEnabled}
              onChange={handleNotifyToggle}
              disabled={notifyLoading}
            />
          }
          onClick={handleNotifyToggle}
        >
          Уведомления о записях
        </SimpleCell>
        <SimpleCell
          before={<Icon28FavoriteOutline />}
          expandable="auto"
          onClick={handleAddToFavorites}
        >
          Добавить в избранное
        </SimpleCell>
      </Group>

      {snackbar}
    </>
  );
}

export default Profile;
