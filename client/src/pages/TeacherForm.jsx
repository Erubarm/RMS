import React, { useState } from 'react';
import {
  PanelHeader,
  PanelHeaderBack,
  Group,
  Header,
  FormItem,
  Input,
  Select,
  Button,
  Box,
  Spacing,
  Placeholder,
  Text,
} from '@vkontakte/vkui';
import { Icon28CheckCircleOutline } from '@vkontakte/icons';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useExpositions } from '../api/hooks';
import client from '../api/client';

const schema = yup.object({
  school: yup
    .string()
    .trim()
    .min(3, 'Минимум 3 символа')
    .required('Укажите название школы'),
  className: yup
    .string()
    .trim()
    .min(1, 'Укажите класс')
    .required('Укажите класс'),
  studentsCount: yup
    .number()
    .typeError('Введите число')
    .min(1, 'Минимум 1 ученик')
    .max(100, 'Максимум 100 учеников')
    .required('Укажите количество учеников'),
  expositionId: yup
    .string()
    .required('Выберите экспозицию'),
  preferredDate: yup
    .string()
    .required('Выберите дату')
    .test('future', 'Дата должна быть в будущем', (val) => {
      if (!val) return false;
      return new Date(val) >= new Date(new Date().toDateString());
    }),
  phone: yup
    .string()
    .trim()
    .matches(/^[\d\s\+\-\(\)]{7,18}$/, 'Введите корректный номер телефона')
    .required('Укажите телефон'),
});

function TeacherForm() {
  const routeNavigator = useRouteNavigator();
  const { expositions } = useExpositions();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      school: '',
      className: '',
      studentsCount: '',
      expositionId: '',
      preferredDate: '',
      phone: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      await client.post('/teacher-requests', {
        school: data.school,
        class: data.className,
        studentsCount: Number(data.studentsCount),
        expositionId: data.expositionId,
        preferredDate: data.preferredDate,
        phone: data.phone,
      });
      setSuccess(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Произошла ошибка при отправке заявки');
    }
  };

  if (success) {
    return (
      <>
        <PanelHeader>Заявка отправлена</PanelHeader>
        <Group>
          <Placeholder
            icon={<Icon28CheckCircleOutline width={56} height={56} fill="var(--vkui--color_accent_green)" />}
            header="Заявка успешно отправлена!"
            action={
              <Button size="l" mode="primary" onClick={() => routeNavigator.push('/')}>
                На главную
              </Button>
            }
          >
            Мы свяжемся с вами для подтверждения в ближайшее время.
          </Placeholder>
        </Group>
      </>
    );
  }

  return (
    <>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
        Заявка для учителей
      </PanelHeader>

      <Group header={<Header>Заполните форму</Header>}>
        <FormItem
          top="Название школы"
          status={errors.school ? 'error' : undefined}
          bottom={errors.school?.message}
        >
          <Input
            {...register('school')}
            placeholder="ГБОУ Школа № 123"
          />
        </FormItem>

        <FormItem
          top="Класс"
          status={errors.className ? 'error' : undefined}
          bottom={errors.className?.message}
        >
          <Input
            {...register('className')}
            placeholder="7А"
          />
        </FormItem>

        <FormItem
          top="Количество учеников"
          status={errors.studentsCount ? 'error' : undefined}
          bottom={errors.studentsCount?.message}
        >
          <Input
            type="number"
            {...register('studentsCount')}
            placeholder="25"
            min="1"
            max="100"
          />
        </FormItem>

        <FormItem
          top="Экспозиция"
          status={errors.expositionId ? 'error' : undefined}
          bottom={errors.expositionId?.message}
        >
          <Controller
            name="expositionId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Выберите экспозицию"
                options={expositions.map((expo) => ({
                  value: String(expo.id),
                  label: expo.title,
                }))}
              />
            )}
          />
        </FormItem>

        <FormItem
          top="Предпочтительная дата"
          status={errors.preferredDate ? 'error' : undefined}
          bottom={errors.preferredDate?.message}
        >
          <Input
            type="date"
            {...register('preferredDate')}
            min={new Date().toISOString().split('T')[0]}
          />
        </FormItem>

        <FormItem
          top="Контактный телефон"
          status={errors.phone ? 'error' : undefined}
          bottom={errors.phone?.message}
        >
          <Input
            type="tel"
            {...register('phone')}
            placeholder="+7 (999) 123-45-67"
          />
        </FormItem>

        {serverError && (
          <Box style={{ padding: '0 16px' }}>
            <Text style={{ color: 'var(--vkui--color_text_negative)' }}>{serverError}</Text>
            <Spacing size={8} />
          </Box>
        )}

        <Box style={{ padding: '0 16px 16px' }}>
          <Button
            size="l"
            mode="primary"
            stretched
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Отправить заявку
          </Button>
        </Box>
      </Group>
    </>
  );
}

export default TeacherForm;
