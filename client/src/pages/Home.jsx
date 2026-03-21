import React, { useEffect, useState } from 'react';
import {
  PanelHeader,
  Group,
  Header,
  Banner,
  SimpleCell,
  CardGrid,
  Card,
  Box,
  Text,
  Title,
  Spacing,
} from '@vkontakte/vkui';
import {
  Icon28WriteOutline,
  Icon28ListOutline,
  Icon28PlaceOutline,
  Icon28CalendarOutline,
} from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import client from '../api/client';

function Home() {
  const routeNavigator = useRouteNavigator();
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    client
      .get('/events', { params: { page: 1, limit: 4 } })
      .then((res) => setUpcomingEvents(res.data.data || res.data.items || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <PanelHeader>РМИ</PanelHeader>

      <Group>
        <Banner
          before={
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #E53935, #1565C0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              РМИ
            </div>
          }
          header="Россия — Моя история"
          subheader="Исторический парк. Мультимедийные экспозиции, экскурсии и события."
          actions={
            <React.Fragment>
              <Spacing size={8} />
            </React.Fragment>
          }
        />
      </Group>

      <Group header={<Header>Быстрые действия</Header>}>
        <SimpleCell
          before={<Icon28WriteOutline />}
          onClick={() => routeNavigator.push('/poster')}
          expandable="auto"
        >
          Записаться на экскурсию
        </SimpleCell>
        <SimpleCell
          before={<Icon28ListOutline />}
          onClick={() => routeNavigator.push('/events')}
          expandable="auto"
        >
          Афиша событий
        </SimpleCell>
        <SimpleCell
          before={<Icon28PlaceOutline />}
          onClick={() => routeNavigator.push('/info')}
          expandable="auto"
        >
          Как добраться
        </SimpleCell>
      </Group>

      <Group header={<Header>Ближайшие события</Header>}>
        {upcomingEvents.length > 0 ? (
          <CardGrid size="l">
            {upcomingEvents.map((event) => (
              <Card key={event.id || event._id}>
                <Box>
                  <Title level="3">{event.title}</Title>
                  <Spacing size={4} />
                  <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                    {event.eventDate
                      ? new Date(event.eventDate).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                        })
                      : 'Дата уточняется'}
                  </Text>
                  <Spacing size={4} />
                  <Text>
                    {event.content
                      ? event.content.slice(0, 100) + (event.content.length > 100 ? '...' : '')
                      : 'Подробности уточняются'}
                  </Text>
                </Box>
              </Card>
            ))}
          </CardGrid>
        ) : (
          <Box>
            <SimpleCell before={<Icon28CalendarOutline />} disabled>
              Информация о событиях загружается...
            </SimpleCell>
          </Box>
        )}
      </Group>
    </>
  );
}

export default Home;
