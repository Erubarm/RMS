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
  SimpleCell,
  Button,
  CardGrid,
  Card,
  InfoRow,
} from '@vkontakte/vkui';
import { Icon28TicketOutline } from '@vkontakte/icons';
import { useRouteNavigator, useParams } from '@vkontakte/vk-mini-apps-router';
import { useExposition } from '../api/hooks';

function ExpositionDetail() {
  const routeNavigator = useRouteNavigator();
  const params = useParams();
  const id = params?.id;
  const { exposition, loading, error } = useExposition(id);

  return (
    <>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Экспозиция
      </PanelHeader>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <span>Загрузка...</span>
        </div>
      )}

      {error && <Placeholder>Не удалось загрузить экспозицию.</Placeholder>}

      {!loading && exposition && (
        <>
          <Group>
            <div
              style={{
                height: 200,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              {exposition.imageUrl ? (
                <img
                  src={exposition.imageUrl}
                  alt={exposition.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Title level="1" style={{ color: '#fff' }}>
                  {exposition.title}
                </Title>
              )}
            </div>
            <Box>
              <Title level="2">{exposition.title}</Title>
              <Spacing size={8} />
              <Text>{exposition.description}</Text>
              {exposition.workingHours && (
                <>
                  <Spacing size={12} />
                  <InfoRow header="Режим работы">{exposition.workingHours}</InfoRow>
                </>
              )}
              {exposition.ageRestriction && (
                <>
                  <Spacing size={8} />
                  <InfoRow header="Возрастное ограничение">{exposition.ageRestriction}</InfoRow>
                </>
              )}
            </Box>
          </Group>

          {exposition.excursions && exposition.excursions.length > 0 && (
            <Group header={<Header>Доступные экскурсии</Header>}>
              <CardGrid size="l">
                {exposition.excursions.map((excursion) => (
                  <Card key={excursion.id || excursion._id}>
                    <Box>
                      <Title level="3">{excursion.title}</Title>
                      <Spacing size={4} />
                      <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                        {excursion.duration && `${excursion.duration} мин`}
                        {excursion.price != null && ` · ${excursion.price} ₽`}
                        {excursion.groupSize && ` · до ${excursion.groupSize} чел.`}
                      </Text>
                      <Spacing size={8} />
                      <Button
                        size="m"
                        mode="primary"
                        before={<Icon28TicketOutline width={20} height={20} />}
                        onClick={() =>
                          routeNavigator.push(`/booking/${excursion.id || excursion._id}`)
                        }
                      >
                        Записаться
                      </Button>
                    </Box>
                  </Card>
                ))}
              </CardGrid>
            </Group>
          )}
        </>
      )}
    </>
  );
}

export default ExpositionDetail;
