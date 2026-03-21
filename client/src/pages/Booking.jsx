import React, { useState, useEffect } from 'react';
import {
  PanelHeader,
  PanelHeaderBack,
  Group,
  Header,
  Box,
  Title,
  Text,
  Spacing,
  Button,
  FormItem,
  Input,
  Select,
  Placeholder,
  CardGrid,
  Card,
  Separator,
  Banner,
} from '@vkontakte/vkui';
import { Icon28CheckCircleOutline } from '@vkontakte/icons';
import { useRouteNavigator, useParams } from '@vkontakte/vk-mini-apps-router';
import { useExcursion, useSlots, useExpositions } from '../api/hooks';
import client from '../api/client';

function Booking() {
  const routeNavigator = useRouteNavigator();
  const params = useParams();
  const excursionIdFromRoute = params?.excursionId;

  const [step, setStep] = useState(excursionIdFromRoute ? 2 : 1);
  const [selectedExcursionId, setSelectedExcursionId] = useState(excursionIdFromRoute || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [peopleCount, setPeopleCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const { expositions } = useExpositions();
  const { excursion } = useExcursion(selectedExcursionId);
  const { slots, loading: slotsLoading } = useSlots(selectedExcursionId, selectedDate);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await client.post('/bookings', {
        excursionId: selectedExcursionId,
        date: selectedDate,
        slotId: selectedSlot?.id || selectedSlot?._id,
        time: selectedSlot?.time,
        people: peopleCount,
      });
      setBookingResult(res.data);
      setStep(5);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Произошла ошибка при бронировании');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1: Select exposition / excursion
  if (step === 1) {
    return (
      <>
        <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
          Запись — Шаг 1/4
        </PanelHeader>
        <Group header={<Header>Выберите экскурсию</Header>}>
          {expositions.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <span>Загрузка...</span>
            </div>
          ) : (
            expositions.map((expo) =>
              (expo.excursions || []).map((exc) => (
                <Card
                  key={exc.id || exc._id}
                  style={{
                    margin: '8px 16px',
                    cursor: 'pointer',
                    border:
                      selectedExcursionId === (exc.id || exc._id)
                        ? '2px solid var(--vkui--color_accent_blue)'
                        : '2px solid transparent',
                    borderRadius: 12,
                  }}
                  onClick={() => setSelectedExcursionId(exc.id || exc._id)}
                >
                  <Box>
                    <Title level="3">{exc.title}</Title>
                    <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                      {expo.title}
                      {exc.price != null && ` · ${exc.price} ₽`}
                    </Text>
                  </Box>
                </Card>
              ))
            )
          )}
          <Box>
            <Button
              size="l"
              mode="primary"
              stretched
              disabled={!selectedExcursionId}
              onClick={() => setStep(2)}
            >
              Далее
            </Button>
          </Box>
        </Group>
      </>
    );
  }

  // Step 2: Date picker
  if (step === 2) {
    return (
      <>
        <PanelHeader before={<PanelHeaderBack onClick={() => excursionIdFromRoute ? routeNavigator.back() : setStep(1)} />}>
          Запись — Шаг 2/4
        </PanelHeader>
        <Group header={<Header>Выберите дату</Header>}>
          <FormItem top="Дата посещения">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </FormItem>
          <Box>
            <Button
              size="l"
              mode="primary"
              stretched
              disabled={!selectedDate}
              onClick={() => setStep(3)}
            >
              Далее
            </Button>
          </Box>
        </Group>
      </>
    );
  }

  // Step 3: Time slot + people count
  if (step === 3) {
    return (
      <>
        <PanelHeader before={<PanelHeaderBack onClick={() => setStep(2)} />}>
          Запись — Шаг 3/4
        </PanelHeader>
        <Group header={<Header>Выберите время и количество</Header>}>
          {slotsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <span>Загрузка...</span>
            </div>
          ) : slots.length === 0 ? (
            <Placeholder>Нет доступных слотов на выбранную дату</Placeholder>
          ) : (
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {slots.map((slot) => (
                <Button
                  key={slot.id || slot._id || slot.time}
                  size="m"
                  mode={
                    (selectedSlot?.id || selectedSlot?.time) === (slot.id || slot.time)
                      ? 'primary'
                      : 'secondary'
                  }
                  disabled={slot.availableSpots === 0}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot.time}
                  {slot.availableSpots != null && (
                    <span style={{ fontSize: 11, marginLeft: 4 }}>
                      ({slot.availableSpots} мест)
                    </span>
                  )}
                </Button>
              ))}
            </Box>
          )}

          <Spacing size={16} />

          <FormItem
            top="Количество человек"
            status={
              selectedSlot && peopleCount > selectedSlot.availableSpots ? 'error' : undefined
            }
            bottom={
              selectedSlot && peopleCount > selectedSlot.availableSpots
                ? `Максимум ${selectedSlot.availableSpots} мест`
                : selectedSlot
                ? `Доступно мест: ${selectedSlot.availableSpots}`
                : undefined
            }
          >
            <Input
              type="number"
              min={1}
              max={selectedSlot?.availableSpots || 20}
              value={String(peopleCount)}
              onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </FormItem>

          <Box>
            <Button
              size="l"
              mode="primary"
              stretched
              disabled={!selectedSlot || peopleCount > (selectedSlot?.availableSpots || 0)}
              onClick={() => setStep(4)}
            >
              Далее
            </Button>
          </Box>
        </Group>
      </>
    );
  }

  // Step 4: Confirmation
  if (step === 4) {
    return (
      <>
        <PanelHeader before={<PanelHeaderBack onClick={() => setStep(3)} />}>
          Запись — Шаг 4/4
        </PanelHeader>
        <Group header={<Header>Подтверждение</Header>}>
          <Box>
            <Title level="3">Проверьте данные</Title>
            <Spacing size={12} />

            {excursion && (
              <Text>
                <b>Экскурсия:</b> {excursion.title}
              </Text>
            )}
            <Spacing size={4} />
            <Text>
              <b>Дата:</b>{' '}
              {new Date(selectedDate).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Spacing size={4} />
            <Text>
              <b>Время:</b> {selectedSlot?.time}
            </Text>
            <Spacing size={4} />
            <Text>
              <b>Количество человек:</b> {peopleCount}
            </Text>
            {excursion?.price != null && (
              <>
                <Spacing size={4} />
                <Text>
                  <b>Итого:</b> {excursion.price * peopleCount} ₽
                </Text>
              </>
            )}

            <Spacing size={16} />
            <Separator />
            <Spacing size={16} />

            {submitError && (
              <>
                <Text style={{ color: 'var(--vkui--color_text_negative)' }}>{submitError}</Text>
                <Spacing size={8} />
              </>
            )}

            <Button
              size="l"
              mode="primary"
              stretched
              loading={submitting}
              onClick={handleSubmit}
            >
              Подтвердить запись
            </Button>
          </Box>
        </Group>
      </>
    );
  }

  // Step 5: Success
  if (step === 5) {
    return (
      <>
        <PanelHeader>Запись оформлена</PanelHeader>
        <Group>
          <Placeholder
            icon={<Icon28CheckCircleOutline width={56} height={56} fill="var(--vkui--color_accent_green)" />}
            header="Вы успешно записаны!"
            action={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                <Button size="l" mode="primary" stretched onClick={() => routeNavigator.push('/my-bookings')}>
                  Мои записи
                </Button>
                <Button size="l" mode="secondary" stretched onClick={() => routeNavigator.push('/')}>
                  На главную
                </Button>
              </div>
            }
          >
            {bookingResult?.code && (
              <Text>
                Код бронирования: <b>{bookingResult.code}</b>
              </Text>
            )}
            {bookingResult?.message && <Text>{bookingResult.message}</Text>}
          </Placeholder>
        </Group>
      </>
    );
  }

  return null;
}

export default Booking;
