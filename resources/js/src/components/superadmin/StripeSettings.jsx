import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Text,
    FormControl,
    FormLabel,
    FormHelperText,
    Input,
    Button,
    SimpleGrid,
    Spinner,
    Center,
    useToast,
    Icon,
    HStack,
    Switch,
    VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CreditCard, Key, Globe, Shield } from 'lucide-react';
import api from '../../axios';
import { STRIPE_SETTINGS } from '../../routes/apiRoutes';
import { DASHBOARD_PATH } from '../../routes/superAdminRoutes';
import useThemeColors from '../../hooks/useThemeColors';
import PageHeader from '../ui/PageHeader';

const SectionCard = ({ icon, title, subtitle, children, colors }) => (
    <Card bg={colors.bgCard} border="1px solid" borderColor={colors.borderSubtle} borderRadius="xl" shadow="sm" mb={6}>
        <CardHeader borderBottom="1px solid" borderColor={colors.borderSubtle} pb={4}>
            <HStack spacing={3}>
                <Box p={2.5} borderRadius="lg" bg="teal.50" _dark={{ bg: 'teal.900' }}>
                    <Icon as={icon} boxSize={5} color="teal.500" />
                </Box>
                <Box>
                    <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                        {title}
                    </Heading>
                    {subtitle && (
                        <Text fontSize="sm" color={colors.textSecondary} mt={0.5}>
                            {subtitle}
                        </Text>
                    )}
                </Box>
            </HStack>
        </CardHeader>
        <CardBody>{children}</CardBody>
    </Card>
);

const StripeSettings = () => {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const toast = useToast();
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm();
    const [loading, setLoading] = useState(true);
    const testMode = watch('test_mode', true);

    useEffect(() => {
        let active = true;
        api.get(STRIPE_SETTINGS)
            .then((res) => {
                if (active) reset(res.data?.data || { test_mode: true });
            })
            .catch(() => {
                if (active) reset({ test_mode: true });
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const onSubmit = async (values) => {
        try {
            await api.put(STRIPE_SETTINGS, values);
            toast({
                title: t('Settings saved'),
                description: t('Stripe payment settings have been updated.'),
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: t('Failed to save settings'),
                description: error.response?.data?.message || t('Something went wrong. Please try again.'),
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        }
    };

    if (loading) {
        return (
            <Center py={20}>
                <Spinner size="xl" color="teal.500" />
            </Center>
        );
    }

    return (
        <Box>
            <PageHeader
                title={t('Stripe Payment Settings')}
                subtitle={t('Configure your Stripe payment gateway credentials.')}
                breadcrumbs={[
                    { label: t('dashboard'), path: DASHBOARD_PATH },
                    { label: t('Stripe Settings'), isCurrent: true },
                ]}
            />

            <form onSubmit={handleSubmit(onSubmit)}>
                <SectionCard
                    icon={CreditCard}
                    title={t('General')}
                    subtitle={t('Enable Stripe and choose your mode.')}
                    colors={colors}
                >
                    <FormControl display="flex" alignItems="center" gap={3}>
                        <Switch
                            id="test_mode"
                            colorScheme="teal"
                            {...register('test_mode')}
                            defaultChecked
                        />
                        <FormLabel htmlFor="test_mode" mb={0} fontWeight="500">
                            {t('Test Mode')}
                        </FormLabel>
                    </FormControl>
                    <Text fontSize="xs" color={colors.textMuted} mt={1} ml={12}>
                        {t('Use Stripe test environment for development.')}
                    </Text>
                </SectionCard>

                <SectionCard
                    icon={Key}
                    title={testMode ? t('Test API Keys') : t('Live API Keys')}
                    subtitle={testMode ? t('Enter your Stripe test mode credentials.') : t('Enter your Stripe live mode credentials.')}
                    colors={colors}
                >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isInvalid={!!errors.test_secret_key} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">
                                {testMode ? t('Test Secret Key') : t('Live Secret Key')}
                            </FormLabel>
                            <Input
                                type="password"
                                placeholder={testMode ? 'sk_test_...' : 'sk_live_...'}
                                {...register(testMode ? 'test_secret_key' : 'live_secret_key', { required: true })}
                            />
                            <FormHelperText fontSize="xs">
                                {t('Starts with sk_test_ or sk_live_')}
                            </FormHelperText>
                        </FormControl>

                        <FormControl isInvalid={!!errors.test_publishable_key} isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">
                                {testMode ? t('Test Publishable Key') : t('Live Publishable Key')}
                            </FormLabel>
                            <Input
                                type="password"
                                placeholder={testMode ? 'pk_test_...' : 'pk_live_...'}
                                {...register(testMode ? 'test_publishable_key' : 'live_publishable_key', { required: true })}
                            />
                            <FormHelperText fontSize="xs">
                                {t('Starts with pk_test_ or pk_live_')}
                            </FormHelperText>
                        </FormControl>
                    </SimpleGrid>
                </SectionCard>

                <SectionCard
                    icon={Globe}
                    title={t('Webhook Configuration')}
                    subtitle={t('Set up Stripe webhook endpoint.')}
                    colors={colors}
                >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">
                                {t('Webhook Secret')}
                            </FormLabel>
                            <Input
                                type="password"
                                placeholder="whsec_..."
                                {...register('webhook_secret')}
                            />
                            <FormHelperText fontSize="xs">
                                {t('From your Stripe webhook endpoint settings.')}
                            </FormHelperText>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">
                                {t('Webhook URL')}
                            </FormLabel>
                            <Input
                                type="text"
                                value={`${window.location.origin}/api/v1/stripe/webhook`}
                                isReadOnly
                                bg={colors.bgSubtle}
                            />
                            <FormHelperText fontSize="xs">
                                {t('Add this URL in your Stripe dashboard.')}
                            </FormHelperText>
                        </FormControl>
                    </SimpleGrid>
                </SectionCard>

                <SectionCard
                    icon={Shield}
                    title={t('Payment Settings')}
                    subtitle={t('Configure payment behavior.')}
                    colors={colors}
                >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl display="flex" alignItems="center" gap={3}>
                            <Switch
                                id="enabled"
                                colorScheme="teal"
                                {...register('enabled')}
                            />
                            <FormLabel htmlFor="enabled" mb={0} fontWeight="500">
                                {t('Enable Stripe Payments')}
                            </FormLabel>
                        </FormControl>

                        <FormControl display="flex" alignItems="center" gap={3}>
                            <Switch
                                id="capture_method"
                                colorScheme="teal"
                                {...register('capture_method')}
                            />
                            <FormLabel htmlFor="capture_method" mb={0} fontWeight="500">
                                {t('Capture Payment Automatically')}
                            </FormLabel>
                        </FormControl>
                    </SimpleGrid>
                </SectionCard>

                <Box display="flex" justifyContent="flex-end" mt={4}>
                    <Button
                        type="submit"
                        colorScheme="teal"
                        isLoading={isSubmitting}
                        loadingText={t('Saving...')}
                        size="md"
                        px={8}
                    >
                        {t('Save Settings')}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default StripeSettings;
