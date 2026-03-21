import React from 'react';
import {
  PanelHeader,
  PanelHeaderBack,
  Group,
  Header,
  Box,
  Title,
  Text,
  Spacing,
  Placeholder,
  Button,
  CardGrid,
  Card,
  Alert,
} from '@vkontakte/vkui';
import { Icon56InboxOutline } from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useBookings } from '../api/hooks';
import useStore from '../store/useStore';
import client from '../api/client';

const STATUS_LABELS = {
  PENDING: { text: 'Ожидает', color: 'var(--vkui--color_text_secondary)' },
  CONFIRMED: { text: 'Подтверждена', color: 'var(--vkui--color_accent_green)' },
  CANCELLED: { text: 'Отменена', color: 'var(--vkui--color_text_negative)' },
  COMPLETED: { text: 'Завершена', color: 'var(--vkui--color_text_secondary)' },
};

function MyBookings() {
  const routeNavigator = useRouteNavigator();
  const { bookings, loading, error, refetch } = useBookings();
  const setPopout = useStore((state) => state.setPopout);

  const now = new Date();
  const activeBookings = bookings.filter((b) => {
    const slotDate = b.timeSlot?.date ? new Date(b.timeSlot.date) : null;
    return slotDate >= now && b.status !== 'CANCELLED';
  });
  const pastBookings = bookings.filter((b) => {
    const slotDate = b.timeSlot?.date ? new Date(b.timeSlot.date) : null;
    return !slotDate || slotDate < now || b.status === 'CANCELLED';
  });

  const confirmCancel = (bookingId, bookingCode) => {
    setPopout(
      <Alert
        header="Отмена записи"
        text={`Вы уверены, что хотите отменить запись ${bookingCode ? `(${bookingCode})` : ''}? Это действие нельзя отменить.`}
        actions={[
          {
            title: 'Не отменять',
            mode: 'cancel',
            action: () => setPopout(null),
          },
          {
            title: 'Отменить запись',
            mode: 'destructive',
            action: async () => {
              setPopout(null);
              try {
                await client.delete(`/bookings/${bookingId}`);
                refetch();
              } catch {
                setPopout(
                  <Alert
                    header="Ошибка"
                    text="Не удалось отменить запись. Попробуйте позже."
                    actions={[{ title: 'OK', mode: 'cancel', action: () => setPopout(null) }]}
                    onClose={() => setPopout(null)}
                  />
                );
              }
            },
          },
        ]}
        onClose={() => setPopout(null)}
      />
    );
  };

  const formatDate = (booking) => {
    const date = booking.timeSlot?.date;
    const time = booking.timeSlot?.time;
    if (!date) return '';
    return (
      new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) + (time ? ` в ${time}` : '')
    );
  };

  const renderBookingCard = (booking, showCancel = false) => {
    const statusInfo = STATUS_LABELS[booking.status] || STATUS_LABELS.PENDING;
    return (
      <Card key={booking.id}>
        <Box style={{ padding: '12px 16px' }}>
          <Title level="3">
            {booking.timeSlot?.excursion?.title || 'Экскурсия'}
          </Title>
          <Spacing size={4} />
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            {formatDate(booking)}
          </Text>
          <Spacing size={4} />
          <Text>
            Человек: {booking.peopleCount}
            {booking.code && ` · Код: `}
            {booking.code && <b>{booking.code}</b>}
          </Text>
          <Spacing size={4} />
          <Text style={{ color: statusInfo.color, fontWeight: 500 }}>
            {statusInfo.text}
          </Text>
          {showCancel && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
            <>
              <Spacing size={8} />
              <Button
                size="s"
                mode="secondary"
                appearance="negative"
                onClick={() => confirmCancel(booking.id, booking.code)}
              >
                Отменить запись
              </Button>
            </>
          )}
        </Box>
      </Card>
    );
  };

  return (
    <>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Мои записи
      </PanelHeader>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <span>Загрузка...</span>
        </div>
      )}

      {error && <Placeholder>Не удалось загрузить записи.</Placeholder>}

      {!loading && bookings.length === 0 && (
        <Placeholder
          icon={<Icon56InboxOutline />}
          header="Записей пока нет"
          action={
            <Button size="m" mode="primary" onClick={() => routeNavigator.push('/poster')}>
              Записаться на экскурсию
            </Button>
          }
        >
          Запишитесь на экскурсию, и она появится здесь
        </Placeholder>
      )}

      {!loading && activeBookings.length > 0 && (
        <Group header={<Header>Активные</Header>}>
          <CardGrid size="l">{activeBookings.map((b) => renderBookingCard(b, true))}</CardGrid>
        </Group>
      )}

      {!loading && pastBookings.length > 0 && (
        <Group header={<Header>Прошедшие и отменённые</Header>}>
          <CardGrid size="l">{pastBookings.map((b) => renderBookingCard(b, false))}</CardGrid>
        </Group>
      )}
    </>
  );
}

export default MyBookings;
