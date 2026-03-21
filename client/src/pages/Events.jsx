import React, { useState } from 'react';
import {
  PanelHeader,
  PanelHeaderBack,
  Group,
  Tabs,
  TabsItem,
  Box,
  Title,
  Text,
  Spacing,
  Placeholder,
  Button,
  CardGrid,
  Card,
} from '@vkontakte/vkui';
import { Icon56CalendarOutline } from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useEvents } from '../api/hooks';

const EVENT_TYPES = [
  { value: '', label: 'Все' },
  { value: 'EXHIBITION', label: 'Выставки' },
  { value: 'NEWS', label: 'Новости' },
  { value: 'LECTURE', label: 'Лекции' },
  { value: 'WORKSHOP', label: 'Мастер-классы' },
];

function Events() {
  const routeNavigator = useRouteNavigator();
  const [activeType, setActiveType] = useState('');
  const [page, setPage] = useState(1);

  const { events, total, loading, error } = useEvents(activeType, page);

  const handleTypeChange = (type) => {
    setActiveType(type);
    setPage(1);
  };

  const hasMore = events.length < total;

  return (
    <>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        События
      </PanelHeader>

      <Group>
        <Tabs>
          {EVENT_TYPES.map((type) => (
            <TabsItem
              key={type.value}
              selected={activeType === type.value}
              onClick={() => handleTypeChange(type.value)}
              id={`tab-${type.value || 'all'}`}
              aria-controls="events-list"
            >
              {type.label}
            </TabsItem>
          ))}
        </Tabs>
      </Group>

      <Group id="events-list" role="tabpanel">
        {error && <Placeholder>Не удалось загрузить события.</Placeholder>}

        {!error && events.length === 0 && !loading && (
          <Placeholder icon={<Icon56CalendarOutline />}>Событий пока нет</Placeholder>
        )}

        {events.length > 0 && (
          <CardGrid size="l">
            {events.map((event, index) => (
              <Card key={event.id || event._id || index}>
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
                    {event.type && ` · ${event.type}`}
                  </Text>
                  <Spacing size={4} />
                  <Text>{event.content}</Text>
                </Box>
              </Card>
            ))}
          </CardGrid>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
            <span>Загрузка...</span>
          </div>
        )}

        {!loading && hasMore && (
          <Box>
            <Button size="l" mode="secondary" stretched onClick={() => setPage((p) => p + 1)}>
              Загрузить ещё
            </Button>
          </Box>
        )}
      </Group>
    </>
  );
}

export default Events;
