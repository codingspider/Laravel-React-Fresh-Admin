import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Text,
    Button,
    Badge,
    HStack,
    VStack,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useToast,
    Icon,
    Flex,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    List,
    ListItem,
    ListIcon,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { usePermission } from '../../context/PermissionContext';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';
import api from '../../axios';
import PageHeader from '../ui/PageHeader';
import useThemeColors from '../../hooks/useThemeColors';
import { DASHBOARD_PATH } from '../../routes/superAdminRoutes';
import {
    CreditCard,
    Check,
    Clock,
    AlertTriangle,
    RefreshCw,
    Zap,
    Star,
    Crown,
} from 'lucide-react';

const SUBSCRIPTION_RENEWAL_PATH = '/subscription/renew';

export default function SubscriptionRenewal() {
    const { t } = useTranslation();
    const { user, hasRole } = usePermission();
    const { formatAmount } = useCurrencyFormatter();
    const colors = useThemeColors();
    const toast = useToast();

    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPlan, setProcessingPlan] = useState(null);
    const [stripeConfig, setStripeConfig] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [confirming, setConfirming] = useState(false);

    // Check URL params for payment result
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const payment = params.get('payment');
        const sessionId = params.get('session_id');

        if (payment === 'success' && sessionId) {
            setConfirming(true);
            api.post('/v1/stripe/confirm-payment', { session_id: sessionId })
                .then((res) => {
                    setPaymentSuccess(true);
                    toast({
                        title: t('Payment Successful'),
                        description: t('Your subscription has been renewed successfully!'),
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                })
                .catch((err) => {
                    console.error('Payment confirmation failed:', err);
                    toast({
                        title: t('Payment Confirmation'),
                        description: err.response?.data?.message || t('Payment was received. Please refresh to see updated status.'),
                        status: 'warning',
                        duration: 5000,
                        isClosable: true,
                    });
                })
                .finally(() => {
                    setConfirming(false);
                    // Clean URL
                    window.history.replaceState({}, '', '/subscription/renew');
                });
        } else if (payment === 'cancelled') {
            window.history.replaceState({}, '', '/subscription/renew');
        }
    }, [t, toast]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const [plansRes, subRes, configRes] = await Promise.all([
                api.get('/v1/plans/pub'),
                api.get('/v1/subscriptions', { params: { per_page: 1, status: 'active' } }),
                api.get('/v1/stripe/config').catch(() => ({ data: { data: { enabled: false } } })),
            ]);

            const activePlans = (plansRes.data?.data || []).filter(
                (plan) => plan.is_active && plan.status === 'active'
            );
            setPlans(activePlans);

            const subs = subRes.data?.data || [];
            if (subs.length > 0) {
                setCurrentSubscription(subs[0]);
            }

            setStripeConfig(configRes.data?.data || { enabled: false });
        } catch (err) {
            console.error('Failed to load renewal data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRenew = async (plan) => {
        if (!stripeConfig?.enabled) {
            toast({
                title: t('Online Payments Not Available'),
                description: t('Stripe payments are not configured. Please contact support to renew your subscription.'),
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setSelectedPlan(plan);
        setProcessingPlan(plan.id);

        try {
            const res = await api.post('/v1/stripe/checkout-session', {
                plan_id: plan.id,
            });

            const { url } = res.data?.data || {};

            if (url) {
                // Redirect to Stripe Checkout
                window.location.href = url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err) {
            console.error('Checkout failed:', err);
            toast({
                title: t('Checkout Failed'),
                description: err.response?.data?.message || t('Failed to start payment. Please try again.'),
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setProcessingPlan(null);
            setSelectedPlan(null);
        }
    };

    const handleRetry = async () => {
        setPaymentSuccess(false);
        await fetchData();
    };

    if (loading || confirming) {
        return (
            <Center py={20}>
                <VStack spacing={4}>
                    <Spinner size="xl" color="teal.500" />
                    {confirming && (
                        <Text color={colors.textSecondary} fontSize="sm">
                            {t('Verifying your payment...')}
                        </Text>
                    )}
                </VStack>
            </Center>
        );
    }

    const isExpired = currentSubscription?.status === 'expired' ||
        (currentSubscription?.ends_at && new Date(currentSubscription.ends_at) < new Date());
    const daysLeft = currentSubscription?.ends_at
        ? Math.ceil((new Date(currentSubscription.ends_at) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;
    const isTrial = currentSubscription?.is_trial;

    return (
        <Box>
            <PageHeader
                title={t('Subscription Renewal')}
                subtitle={t('Renew your subscription to continue using all features.')}
                breadcrumbs={[
                    { label: t('dashboard'), path: DASHBOARD_PATH },
                    { label: t('Subscription Renewal'), isCurrent: true },
                ]}
            />

            {/* Payment Success Alert */}
            {paymentSuccess && (
                <Alert status="success" borderRadius="lg" mb={6} py={4} px={6} variant="subtle">
                    <AlertIcon boxSize={5} />
                    <Box flex="1">
                        <AlertTitle fontSize="md" fontWeight="600" mb={1}>
                            {t('Payment Successful')}
                        </AlertTitle>
                        <AlertDescription fontSize="sm">
                            {t('Your subscription has been renewed successfully!')}
                        </AlertDescription>
                    </Box>
                    <Button size="sm" colorScheme="green" variant="ghost" onClick={handleRetry}>
                        {t('Refresh')}
                    </Button>
                </Alert>
            )}

            {/* Current Subscription Status */}
            {currentSubscription && (
                <Card
                    bg={colors.bgCard}
                    border="1px solid"
                    borderColor={colors.borderDefault}
                    borderRadius="xl"
                    mb={6}
                >
                    <CardBody p={6}>
                        <HStack spacing={4} align="center">
                            <Box
                                p={3}
                                borderRadius="xl"
                                bg={isExpired ? 'red.50' : isTrial ? 'blue.50' : 'green.50'}
                                _dark={{
                                    bg: isExpired ? 'red.900' : isTrial ? 'blue.900' : 'green.900'
                                }}
                            >
                                <Icon
                                    as={isExpired ? AlertTriangle : isTrial ? Clock : Check}
                                    boxSize={6}
                                    color={isExpired ? 'red.500' : isTrial ? 'blue.500' : 'green.500'}
                                />
                            </Box>
                            <Box flex="1">
                                <HStack spacing={2} mb={1}>
                                    <Text fontWeight="bold" fontSize="lg" color={colors.textPrimary}>
                                        {currentSubscription.plan?.name || t('Current Plan')}
                                    </Text>
                                    <Badge
                                        colorScheme={isExpired ? 'red' : isTrial ? 'blue' : 'green'}
                                        borderRadius="full"
                                        px={2}
                                    >
                                        {isExpired ? t('Expired') : isTrial ? t('Trial') : t('Active')}
                                    </Badge>
                                </HStack>
                                <Text fontSize="sm" color={colors.textSecondary}>
                                    {isExpired
                                        ? t('Your subscription has expired. Choose a plan below to renew.')
                                        : isTrial
                                            ? t('Trial ends on {{date}}', {
                                                date: new Date(
                                                    currentSubscription.trial_ends_at || currentSubscription.ends_at
                                                ).toLocaleDateString()
                                            })
                                            : t('Valid until {{date}}', {
                                                date: new Date(currentSubscription.ends_at).toLocaleDateString()
                                            })}
                                </Text>
                                {!isExpired && daysLeft > 0 && (
                                    <Text fontSize="xs" color={daysLeft <= 7 ? 'red.500' : 'green.500'} mt={1}>
                                        {t('{{days}} days remaining', { days: daysLeft })}
                                    </Text>
                                )}
                            </Box>
                            {!isExpired && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="teal"
                                    leftIcon={<RefreshCw size={14} />}
                                    onClick={fetchData}
                                >
                                    {t('Refresh')}
                                </Button>
                            )}
                        </HStack>
                    </CardBody>
                </Card>
            )}

            {/* Plans Grid */}
            {plans.length === 0 ? (
                <Card
                    bg={colors.bgCard}
                    border="1px solid"
                    borderColor={colors.borderDefault}
                    borderRadius="xl"
                >
                    <CardBody py={16} textAlign="center">
                        <Icon as={CreditCard} boxSize={12} color={colors.textMuted} mb={4} />
                        <Text fontSize="lg" color={colors.textSecondary} fontWeight="500">
                            {t('No plans available')}
                        </Text>
                        <Text fontSize="sm" color={colors.textMuted} mt={2}>
                            {t('Please contact support for available plans.')}
                        </Text>
                    </CardBody>
                </Card>
            ) : (
                <Grid
                    templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                    gap={6}
                >
                    {plans.map((plan) => {
                        const isCurrentPlan = currentSubscription?.plan_id === plan.id;
                        const isPopular = plan.metadata?.popular;

                        return (
                            <Card
                                key={plan.id}
                                bg={colors.bgCard}
                                border="2px solid"
                                borderColor={isCurrentPlan ? 'teal.400' : isPopular ? 'purple.400' : colors.borderDefault}
                                borderRadius="xl"
                                position="relative"
                                overflow="hidden"
                                _hover={{
                                    borderColor: isCurrentPlan ? 'teal.500' : 'purple.400',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg',
                                }}
                                transition="all 0.2s"
                            >
                                {/* Popular Badge */}
                                {isPopular && (
                                    <Badge
                                        position="absolute"
                                        top={3}
                                        right={3}
                                        colorScheme="purple"
                                        borderRadius="full"
                                        px={2}
                                        py={0.5}
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        <HStack spacing={1}>
                                            <Icon as={Star} boxSize={3} />
                                            <Text>{t('Popular')}</Text>
                                        </HStack>
                                    </Badge>
                                )}

                                {/* Current Plan Badge */}
                                {isCurrentPlan && (
                                    <Badge
                                        position="absolute"
                                        top={3}
                                        left={3}
                                        colorScheme="teal"
                                        borderRadius="full"
                                        px={2}
                                        py={0.5}
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        {t('Current')}
                                    </Badge>
                                )}

                                <CardBody p={6}>
                                    <VStack spacing={4} align="stretch">
                                        {/* Plan Header */}
                                        <Box textAlign="center" pt={isPopular || isCurrentPlan ? 6 : 0}>
                                            <Icon
                                                as={Crown}
                                                boxSize={8}
                                                color={isPopular ? 'purple.500' : 'teal.500'}
                                                mb={2}
                                            />
                                            <Heading size="md" color={colors.textPrimary} fontWeight="bold">
                                                {plan.name}
                                            </Heading>
                                            {plan.description && (
                                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                                    {plan.description}
                                                </Text>
                                            )}
                                        </Box>

                                        {/* Price */}
                                        <Box textAlign="center" py={3}>
                                            <Text fontSize="3xl" fontWeight="bold" color={colors.textPrimary}>
                                                {formatAmount(plan.price)}
                                            </Text>
                                            <Text fontSize="sm" color={colors.textSecondary}>
                                                / {plan.billing_cycle}
                                            </Text>
                                        </Box>

                                        {/* Features */}
                                        <List spacing={2} flex="1">
                                            {plan.branch_limit && (
                                                <ListItem fontSize="sm" color={colors.textSecondary}>
                                                    <ListIcon as={Check} color="green.500" />
                                                    {t('Up to {{count}} branches', { count: plan.branch_limit })}
                                                </ListItem>
                                            )}
                                            {plan.user_limit && (
                                                <ListItem fontSize="sm" color={colors.textSecondary}>
                                                    <ListIcon as={Check} color="green.500" />
                                                    {t('Up to {{count}} users', { count: plan.user_limit })}
                                                </ListItem>
                                            )}
                                            {plan.trial_days > 0 && (
                                                <ListItem fontSize="sm" color={colors.textSecondary}>
                                                    <ListIcon as={Clock} color="blue.500" />
                                                    {t('{{days}} days trial', { days: plan.trial_days })}
                                                </ListItem>
                                            )}
                                            {plan.packages?.map((pkg) => (
                                                <ListItem key={pkg.id} fontSize="sm" color={colors.textSecondary}>
                                                    <ListIcon as={Zap} color="purple.500" />
                                                    {pkg.name}
                                                </ListItem>
                                            ))}
                                        </List>

                                        {/* CTA Button */}
                                        <Button
                                            size="lg"
                                            colorScheme={isCurrentPlan ? 'gray' : 'teal'}
                                            variant={isCurrentPlan ? 'outline' : 'solid'}
                                            isLoading={processingPlan === plan.id}
                                            loadingText={t('Processing...')}
                                            onClick={() => handleRenew(plan)}
                                            isDisabled={processingPlan !== null}
                                            fontWeight="600"
                                            borderRadius="lg"
                                            w="100%"
                                        >
                                            {isCurrentPlan
                                                ? t('Renew Current Plan')
                                                : t('Subscribe Now')}
                                        </Button>
                                    </VStack>
                                </CardBody>
                            </Card>
                        );
                    })}
                </Grid>
            )}

            {/* Stripe Not Configured Warning */}
            {stripeConfig && !stripeConfig.enabled && (
                <Alert status="info" borderRadius="lg" mt={6} py={4} px={6} variant="subtle">
                    <AlertIcon boxSize={5} />
                    <Box flex="1">
                        <AlertTitle fontSize="md" fontWeight="600" mb={1}>
                            {t('Online Payments Not Available')}
                        </AlertTitle>
                        <AlertDescription fontSize="sm">
                            {t('Stripe payments have not been configured yet. Please contact your administrator to enable online payments.')}
                        </AlertDescription>
                    </Box>
                </Alert>
            )}
        </Box>
    );
}
