import React from 'react';
import {
  PanelHeader,
  PanelHeaderBack,
  Group,
  Header,
  SimpleCell,
  InfoRow,
  Box,
  Text,
  Link,
} from '@vkontakte/vkui';
import {
  Icon28PlaceOutline,
  Icon28ClockOutline,
  Icon28PhoneOutline,
  Icon28MoneyCircleOutline,
  Icon28DocumentOutline,
  Icon28QuestionOutline,
} from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

function Info() {
  const routeNavigator = useRouteNavigator();

  return (
    <>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Информация
      </PanelHeader>

      <Group header={<Header>Как добраться</Header>}>
        <SimpleCell before={<Icon28PlaceOutline />} multiline>
          <InfoRow header="Адрес">
            г. Тверь, ул. Советская, д. 34
          </InfoRow>
        </SimpleCell>
        <Box style={{ padding: '0 16px 12px' }}>
          <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: 8 }}>
            <strong>На автобусе / маршрутке:</strong> остановка «Площадь Ленина» — автобусы № 20, 21, 30, 41, маршрутки № 5, 7, 212. От остановки 3 минуты пешком по ул. Советской.
          </Text>
          <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: 8 }}>
            <strong>На автомобиле:</strong> от Московского шоссе по ул. Вольного Новгорода до ул. Советской. Парковка рядом с парком на пл. Ленина и во дворах на ул. Советской.
          </Text>
          <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: 8 }}>
            <strong>От ж/д вокзала Тверь:</strong> 15 минут пешком по проспекту Чайковского и далее по ул. Советской, либо на автобусе до остановки «Площадь Ленина».
          </Text>
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            <strong>Из Москвы:</strong> электричка или «Ласточка» до станции Тверь (время в пути ~1,5 часа), далее пешком или на общественном транспорте.
          </Text>
        </Box>
      </Group>

      <Group header={<Header>График работы</Header>}>
        <SimpleCell before={<Icon28ClockOutline />} multiline>
          <InfoRow header="Понедельник — Вторник">Выходной</InfoRow>
        </SimpleCell>
        <SimpleCell before={<Icon28ClockOutline />} multiline>
          <InfoRow header="Среда — Воскресенье">11:00 — 19:00</InfoRow>
        </SimpleCell>
        <SimpleCell before={<Icon28ClockOutline />} multiline>
          <InfoRow header="Касса закрывается">18:00</InfoRow>
        </SimpleCell>
      </Group>

      <Group header={<Header>Контакты</Header>}>
        <SimpleCell before={<Icon28PhoneOutline />} multiline>
          <InfoRow header="Телефон">
            <Link href="tel:+74822777830">+7 (4822) 77-78-30</Link>
          </InfoRow>
        </SimpleCell>
        <SimpleCell before={<Icon28PhoneOutline />} multiline>
          <InfoRow header="Email">
            <Link href="mailto:tver@myhistorypark.ru">tver@myhistorypark.ru</Link>
          </InfoRow>
        </SimpleCell>
        <SimpleCell before={<Icon28PlaceOutline />} multiline>
          <InfoRow header="Сайт">
            <Link href="https://myhistorypark.ru/tver/" target="_blank">myhistorypark.ru/tver</Link>
          </InfoRow>
        </SimpleCell>
      </Group>

      <Group header={<Header>Цены и льготы</Header>}>
        <SimpleCell before={<Icon28MoneyCircleOutline />} multiline>
          <InfoRow header="Взрослый билет (1 экспозиция)">400 ₽</InfoRow>
        </SimpleCell>
        <SimpleCell before={<Icon28MoneyCircleOutline />} multiline>
          <InfoRow header="Единый билет (все экспозиции)">900 ₽</InfoRow>
        </SimpleCell>
        <SimpleCell before={<Icon28MoneyCircleOutline />} multiline>
          <InfoRow header="Льготный (школьники, студенты, пенсионеры)">200 ₽</InfoRow>
        </SimpleCell>
        <SimpleCell before={<Icon28MoneyCircleOutline />} multiline>
          <InfoRow header="Дети до 7 лет">Бесплатно</InfoRow>
        </SimpleCell>
        <Box style={{ padding: '0 16px 12px' }}>
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            Льготы предоставляются при предъявлении документов. Ветераны ВОВ, инвалиды I и II группы — бесплатно. Организованные школьные группы по предварительной заявке — бесплатно.
          </Text>
        </Box>
      </Group>

      <Group header={<Header>Правила посещения</Header>}>
        <SimpleCell before={<Icon28DocumentOutline />} multiline>
          Не трогайте интерактивные панели мокрыми руками
        </SimpleCell>
        <SimpleCell before={<Icon28DocumentOutline />} multiline>
          Фото- и видеосъёмка разрешена без вспышки
        </SimpleCell>
        <SimpleCell before={<Icon28DocumentOutline />} multiline>
          Крупногабаритные вещи сдавайте в гардероб
        </SimpleCell>
        <SimpleCell before={<Icon28DocumentOutline />} multiline>
          Вход с едой и напитками в залы запрещён
        </SimpleCell>
        <SimpleCell before={<Icon28DocumentOutline />} multiline>
          С домашними животными вход запрещён
        </SimpleCell>
      </Group>

      <Group>
        <SimpleCell
          before={<Icon28QuestionOutline />}
          expandable="auto"
          onClick={() => routeNavigator.push('/faq')}
        >
          Часто задаваемые вопросы
        </SimpleCell>
      </Group>
    </>
  );
}

export default Info;
