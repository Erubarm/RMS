import React from 'react';
import {
  PanelHeader,
  PanelHeaderBack,
  Group,
  Box,
  Title,
  Text,
  Spacing,
  Placeholder,
  Button,
  InfoRow,
} from '@vkontakte/vkui';
import { Icon28TicketOutline } from '@vkontakte/icons';
import { useRouteNavigator, useParams } from '@vkontakte/vk-mini-apps-router';
import { useExcursion } from '../api/hooks';

function ExcursionDetail() {
  const routeNavigator = useRouteNavigator();
  const params = useParams();
  const id = params?.id;
  const { excursion, loading, error } = useExcursion(id);

  return (
    <>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Экскурсия
      </PanelHeader>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <span>Загрузка...</span>
        </div>
      )}

      {error && <Placeholder>Не удалось загрузить информацию об экскурсии.</Placeholder>}

      {!loading && excursion && (
        <>
          <Group>
            <Box>
              <Title level="2">{excursion.title}</Title>
              <Spacing size={12} />
              <Text>{excursion.description}</Text>
              <Spacing size={16} />

              {excursion.price != null && (
                <InfoRow header="Стоимость">{excursion.price} ₽</InfoRow>
              )}
              <Spacing size={8} />
              {excursion.duration && (
                <InfoRow header="Продолжительность">{excursion.duration} мин</InfoRow>
              )}
              <Spacing size={8} />
              {excursion.groupSize && (
                <InfoRow header="Размер группы">до {excursion.groupSize} чел.</InfoRow>
              )}
              <Spacing size={8} />
              {excursion.ageRestriction && (
                <InfoRow header="Возрастное ограничение">{excursion.ageRestriction}</InfoRow>
              )}
            </Box>
          </Group>

          <Group>
            <Box>
              <Button
                size="l"
                mode="primary"
                stretched
                before={<Icon28TicketOutline width={24} height={24} />}
                onClick={() => routeNavigator.push(`/booking/${excursion.id || excursion._id}`)}
              >
                Записаться на экскурсию
              </Button>
            </Box>
          </Group>
        </>
      )}
    </>
  );
}

export default ExcursionDetail;
