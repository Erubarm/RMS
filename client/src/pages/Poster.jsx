import React from 'react';
import {
  PanelHeader,
  Group,
  Header,
  CardGrid,
  Card,
  Box,
  Title,
  Text,
  Spacing,
  Placeholder,
} from '@vkontakte/vkui';
import { Icon56GalleryOutline } from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useExpositions } from '../api/hooks';

function Poster() {
  const routeNavigator = useRouteNavigator();
  const { expositions, loading, error } = useExpositions();

  return (
    <>
      <PanelHeader>Афиша</PanelHeader>

      <Group header={<Header>Экспозиции</Header>}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <span>Загрузка...</span>
          </div>
        )}

        {error && (
          <Placeholder>Не удалось загрузить экспозиции. Попробуйте позже.</Placeholder>
        )}

        {!loading && !error && expositions.length === 0 && (
          <Placeholder icon={<Icon56GalleryOutline />}>
            Экспозиции пока не добавлены
          </Placeholder>
        )}

        {!loading && expositions.length > 0 && (
          <CardGrid size="l">
            {expositions.map((expo) => (
              <Card
                key={expo.id || expo._id}
                onClick={() => routeNavigator.push(`/exposition/${expo.id || expo._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  style={{
                    height: 140,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 48,
                  }}
                >
                  {expo.imageUrl ? (
                    <img
                      src={expo.imageUrl}
                      alt={expo.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                    />
                  ) : (
                    <Icon56GalleryOutline fill="#fff" />
                  )}
                </div>
                <Box>
                  <Title level="3">{expo.title}</Title>
                  <Spacing size={4} />
                  <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                    {expo.description
                      ? expo.description.slice(0, 120) + (expo.description.length > 120 ? '...' : '')
                      : ''}
                  </Text>
                </Box>
              </Card>
            ))}
          </CardGrid>
        )}
      </Group>
    </>
  );
}

export default Poster;
