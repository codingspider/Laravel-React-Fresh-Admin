import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, SimpleGrid, VStack, HStack, Text, Badge, useToast,
  Spinner, Center, Avatar, Divider, Stat, StatLabel, StatNumber,
} from '@chakra-ui/react';
import { FiEdit2, FiArrowLeft, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader';
import api from '../../axios';
import useThemeColors from '../../hooks/useThemeColors';

const statusColors = { active: 'green', inactive: 'red', suspended: 'yellow' };

export default function RestaurantView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();
  const bg = colors.bgCard;
  const borderColor = colors.borderDefault;
  const pageBg = colors.bgPage;
  const cardBg = colors.bgCard;
  const headerBorderColor = colors.borderSubtle;
  const headingColor = colors.textPrimary;
  const textColor = colors.textSecondary;
  const labelColor = colors.textLabel;
  const fieldBg = colors.bgSubtle;
  const fieldHoverBorder = colors.borderInput;

  useEffect(() => {
    api.get(`/v1/restaurants/${id}`).then((res) => {
      setRestaurant(res.data.data);
      setLoading(false);
    }).catch(() => {
      toast({ title: t('Error loading restaurant'), status: 'error' });
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Center py={10}><Spinner size="lg" color="teal.500" /></Center>;
  if (!restaurant) return <Center py={10}><Text>{t('Restaurant not found')}</Text></Center>;

  return (
    <Box>
      <PageHeader
        title={restaurant.name}
        subtitle={t('Restaurant Details')}
        breadcrumbs={[{ label: t('Dashboard'), link: '/dashboard' }, { label: t('Restaurants'), link: '/restaurant/list' }, { label: restaurant.name }]}
      >
        <Button leftIcon={<FiEdit2 />} colorScheme="teal" onClick={() => navigate(`/restaurant/edit/${id}`)}>
          {t('Edit')}
        </Button>
      </PageHeader>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        <Box bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor} p={6} gridColumn={{ lg: 'span 1' }}>
          <VStack spacing={4} align="center">
            <Avatar size="2xl" name={restaurant.name} src={restaurant.logo} />
            <Text fontWeight="700" fontSize="xl">{restaurant.name}</Text>
            <Badge colorScheme={statusColors[restaurant.status]} textTransform="capitalize" size="lg">{t(restaurant.status)}</Badge>
            <Text color={textColor} fontSize="sm">{restaurant.slug}</Text>
          </VStack>
        </Box>

        <Box bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor} p={6} gridColumn={{ lg: 'span 2' }}>
          <Text fontWeight="600" fontSize="lg" mb={4}>{t('Information')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <HStack><FiMail color="gray" /><Text color={textColor}>{restaurant.email || t('Not set')}</Text></HStack>
            <HStack><FiPhone color="gray" /><Text color={textColor}>{restaurant.phone || t('Not set')}</Text></HStack>
            <HStack><FiMapPin color="gray" /><Text color={textColor}>{restaurant.full_address || t('Not set')}</Text></HStack>
            <HStack><Text color={textColor}>{restaurant.currency} ({restaurant.currency_symbol})</Text></HStack>
          </SimpleGrid>

          <Divider my={4} />

          <Text fontWeight="600" mb={3}>{t('Tax Settings')}</Text>
          <SimpleGrid columns={3} spacing={4}>
            <Stat><StatLabel>{t('Tax Rate')}</StatLabel><StatNumber>{restaurant.tax_rate}%</StatNumber></Stat>
            <Stat><StatLabel>{t('Tax Name')}</StatLabel><StatNumber>{restaurant.tax_name}</StatNumber></Stat>
            <Stat><StatLabel>{t('Tax Inclusive')}</StatLabel><StatNumber>{restaurant.tax_inclusive ? t('Yes') : t('No')}</StatNumber></Stat>
          </SimpleGrid>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
