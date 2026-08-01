import {
  Card, CardBody, Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Text,
  HStack,
  VStack,
  Heading,
} from '@chakra-ui/react';
import Chart from '../chart/Chart';
import Pie from '../chart/Pie';
import Stats from '../dashboard/Stats';
import RecentOrder from '../dashboard/RecentOrder';
import RecentPayment from '../dashboard/RecentPayment';
import PageHeader from '../ui/PageHeader';
import { useTranslation } from 'react-i18next';
import { usePermission } from '../../context/PermissionContext';
import { useState, useEffect } from 'react';
import api from '../../axios';

const SubscriptionAlert = () => {
  const { hasRole } = usePermission();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await api.get('/user');
        setUserData(res.data.data || res.data);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  if (loading || !hasRole('restaurant_owner')) {
    return null;
  }

  const now = new Date();

  if (!userData) return null;

  const sub = userData.subscription;
  const subscriptionStatus = userData.subscription_status || 'none';
  const trialEndsAt = userData.trial_ends_at
    ? new Date(userData.trial_ends_at)
    : sub?.trial_ends_at
      ? new Date(sub.trial_ends_at)
      : null;

  if (subscriptionStatus === 'expired') {
    return (
      <Alert status="error" borderRadius="lg" mb={6} py={4} px={6} variant="subtle">
        <AlertIcon boxSize={5} />
        <Box flex="1">
          <AlertTitle fontSize="md" fontWeight="600" mb={1}>
            {t('Subscription')} {t('status')}
          </AlertTitle>
          <AlertDescription fontSize="sm">
            {t('Your subscription has expired. Please renew to continue using all features.')}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (subscriptionStatus === 'none') {
    return (
      <Alert status="warning" borderRadius="lg" mb={6} py={4} px={6} variant="subtle">
        <AlertIcon boxSize={5} />
        <Box flex="1">
          <AlertTitle fontSize="md" fontWeight="600" mb={1}>
            {t('Subscription')} {t('status')}
          </AlertTitle>
          <AlertDescription fontSize="sm">
            {t('You do not have a subscription yet. Please subscribe to start using the system.')}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  const isTrial = sub?.is_trial || subscriptionStatus === 'trial';
  const endsAt = sub?.ends_at ? new Date(sub.ends_at) : null;

  let daysLeft = 0;
  let expiryDate = null;

  if (isTrial && trialEndsAt) {
    daysLeft = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));
    expiryDate = trialEndsAt;
  } else if (endsAt) {
    daysLeft = Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24));
    expiryDate = endsAt;
  }

  if (daysLeft < 0) {
    return (
      <Alert status="error" borderRadius="lg" mb={6} py={4} px={6} variant="subtle">
        <AlertIcon boxSize={5} />
        <Box flex="1">
          <AlertTitle fontSize="md" fontWeight="600" mb={1}>
            {t('Subscription')} {t('status')}
          </AlertTitle>
          <AlertDescription fontSize="sm">
            {t('Your subscription has expired. Please renew to continue using all features.')}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (!expiryDate) return null;

  const alertStatus = daysLeft <= 7 ? 'warning' : daysLeft <= 30 ? 'warning' : 'success';
  const badgeColor = daysLeft <= 7 ? 'orange' : daysLeft <= 30 ? 'yellow' : 'green';

  return (
    <Alert
      status={alertStatus}
      borderRadius="lg"
      mb={6}
      py={4}
      px={6}
      variant="subtle"
    >
      <AlertIcon boxSize={5} />
      <Box flex="1">
        <AlertTitle fontSize="md" fontWeight="600" mb={1}>
          {isTrial ? t('Trial') : t('Subscription')} {t('status')}
        </AlertTitle>
        <AlertDescription fontSize="sm">
          {isTrial
            ? t('Your trial period will expire in {{days}} days on {{date}}.', {
                days: daysLeft,
                date: expiryDate?.toLocaleDateString(),
              })
            : t('Your subscription will expire in {{days}} days on {{date}}.', {
                days: daysLeft,
                date: expiryDate?.toLocaleDateString(),
              })}
        </AlertDescription>
      </Box>
      <Badge colorScheme={badgeColor} variant="subtle" borderRadius="full" px={3} py={1}>
        {daysLeft} {t('days remaining')}
      </Badge>
    </Alert>
  );
};

export default function Dashboard() {
  const { t } = useTranslation();
  return (
    <Box className="form-dark-surface">
      {/* Breadcrumb */}
      <Card mb={5}>
        <CardBody>
          <Breadcrumb fontSize={{ base: 'sm', md: 'md' }}>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t('home')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t('dashboard')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">{t('stats')}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </CardBody>
      </Card>

      {/* Subscription Alert for Restaurant Owner */}
      <SubscriptionAlert />

      {/* Cards grid: auto-fill responsive columns */}
      <Stats></Stats>

      {/* Charts section: 1 col on phones, 2 on small screens & up */}
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={6}
        mt={5}
      >
        <Card>
          <CardBody>
            <Box h="300px">
              <Chart />
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Box h="300px">
              <Pie />
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Table with horizontal scroll on small screens */}
      <SimpleGrid
        mt={5}
        columns={{ base: 1, md: 2 }}   // 1 column on phones, 2 on md screens+
        spacing={6}
      >
        <Card>
          <CardBody>
            <RecentOrder></RecentOrder>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <RecentPayment></RecentPayment>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};
