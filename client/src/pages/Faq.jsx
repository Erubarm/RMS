import React, { useState } from 'react';
import {
  PanelHeader,
  PanelHeaderBack,
  Group,
  Header,
  SimpleCell,
  Box,
  Text,
  Spacing,
  Placeholder,
} from '@vkontakte/vkui';
import { Icon28ChevronDownOutline, Icon28ChevronUpOutline } from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useFaq } from '../api/hooks';

const FALLBACK_FAQ = [
  {
    id: 1,
    question: 'Как купить билет?',
    answer:
      'Билет можно приобрести онлайн через наше приложение или на кассе исторического парка. При онлайн-покупке вы получите QR-код, который нужно показать при входе.',
  },
  {
    id: 2,
    question: 'Есть ли скидки для студентов?',
    answer:
      'Да, студенты очной формы обучения при предъявлении студенческого билета получают скидку 50% на входной билет.',
  },
  {
    id: 3,
    question: 'Можно ли вернуть билет?',
    answer:
      'Возврат билетов возможен не позднее чем за 3 дня до даты посещения. Для возврата обратитесь на электронную почту info@myhistorypark.ru.',
  },
  {
    id: 4,
    question: 'Сколько длится экскурсия?',
    answer:
      'Средняя продолжительность экскурсии — 60-90 минут в зависимости от выбранной экспозиции. Самостоятельный осмотр не ограничен по времени в рамках рабочих часов парка.',
  },
  {
    id: 5,
    question: 'Есть ли парковка?',
    answer:
      'На территории ВДНХ есть несколько платных парковок. Ближайшая находится у главного входа. Стоимость — от 200 ₽/час.',
  },
];

function Faq() {
  const routeNavigator = useRouteNavigator();
  const { faq, loading, error } = useFaq();
  const [expandedId, setExpandedId] = useState(null);

  const faqItems = faq.length > 0 ? faq : FALLBACK_FAQ;

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        FAQ
      </PanelHeader>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <span>Загрузка...</span>
        </div>
      )}

      <Group header={<Header>Часто задаваемые вопросы</Header>}>
        {faqItems.map((item) => {
          const itemId = item.id || item._id || item.question;
          const isExpanded = expandedId === itemId;

          return (
            <React.Fragment key={itemId}>
              <SimpleCell
                after={
                  isExpanded ? (
                    <Icon28ChevronUpOutline />
                  ) : (
                    <Icon28ChevronDownOutline />
                  )
                }
                onClick={() => toggleExpanded(itemId)}
                multiline
              >
                <Text weight="2">{item.question}</Text>
              </SimpleCell>
              {isExpanded && (
                <Box
                  style={{
                    background: 'var(--vkui--color_background_secondary)',
                    margin: '0 16px 8px',
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <Text>{item.answer}</Text>
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Group>
    </>
  );
}

export default Faq;
