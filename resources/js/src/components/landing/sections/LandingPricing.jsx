import React from 'react';
import {
    Box,
    SimpleGrid,
    Text,
    Heading,
    VStack,
    HStack,
    Button,
    Badge,
    List,
    ListItem,
    ListIcon,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LandingSection from './LandingSection';

const MotionBox = motion(Box);

export default function LandingPricing({ plans = [] }) {
    const { t } = useTranslation();

    if (!Array.isArray(plans) || plans.length === 0) {
        return null;
    }

    const formatPrice = (price, billingCycle) => {
        const numPrice = parseFloat(price || 0);
        if (numPrice === 0) {
            return t('Free');
        }
        return `$${numPrice}`;
    };

    const getPeriod = (billingCycle) => {
        if (billingCycle === 'yearly') {
            return t('/year');
        }
        return t('/month');
    };

    const isHighlighted = (plan, index) => {
        if (plan.metadata?.highlight !== undefined && plan.metadata?.highlight !== null) {
            return plan.metadata.highlight;
        }
        // Default: highlight the middle/premium plan
        return index === Math.floor(plans.length / 2);
    };

    const getFeatures = (plan) => {
        if (plan.metadata?.features && Array.isArray(plan.metadata.features) && plan.metadata.features.length > 0) {
            return plan.metadata.features;
        }

        const features = [];
        if (plan.branch_limit) {
            features.push(`${plan.branch_limit} ${t('branches')}`);
        }
        if (plan.user_limit) {
            features.push(`${plan.user_limit} ${t('users')}`);
        }
        if (plan.invoice_limit) {
            features.push(`${plan.invoice_limit} ${t('invoices/month')}`);
        }
        if (plan.trial_days > 0) {
            features.push(`${plan.trial_days} ${t('day free trial')}`);
        }

        // If no numeric features, fall back to package modules if available
        if (features.length === 0 && plan.packages && plan.packages.length > 0) {
            const modules = plan.packages.flatMap((pkg) => pkg.modules || []);
            if (modules.length > 0) {
                features.push(t('{count} modules included', { count: modules.length }));
            }
        }

        if (features.length === 0) {
            features.push(t('Full POS with all order types'));
        }

        return features;
    };

    return (
        <LandingSection
            id="pricing"
            badge={t('Simple, transparent pricing')}
            title={t('Plans that grow with your business')}
            subtitle={t('No hidden fees, no transaction charges, cancel anytime. Start free and upgrade when you are ready.')}
        >
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }} alignItems="stretch">
                {plans.map((plan, index) => {
                    const highlight = isHighlighted(plan, index);

                    return (
                        <MotionBox
                            key={plan.id ?? plan.slug ?? index}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.5, delay: index * 0.12 }}
                            h="100%"
                        >
                            <Box
                                h="100%"
                                p={8}
                                borderRadius="2xl"
                                position="relative"
                                bg={highlight ? 'teal.500' : 'white'}
                                _dark={{
                                    bg: highlight ? 'teal.500' : 'gray.800',
                                    borderColor: highlight ? 'teal.500' : 'gray.700',
                                }}
                                border="1px solid"
                                borderColor={highlight ? 'teal.500' : 'gray.200'}
                                boxShadow={highlight ? '0 30px 60px -15px rgba(13,148,136,0.4)' : 'lg'}
                                transform={highlight ? { md: 'scale(1.03)' } : undefined}
                            >
                                {highlight && (
                                    <Badge
                                        position="absolute"
                                        top={-4}
                                        left="50%"
                                        transform="translateX(-50%)"
                                        colorScheme="whiteAlpha"
                                        color="white"
                                        bg="teal.700"
                                        px={4}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="700"
                                    >
                                        <HStack spacing={1}>
                                            <Sparkles size={12} />
                                            <Text>{t('Most popular')}</Text>
                                        </HStack>
                                    </Badge>
                                )}

                                <VStack align="flex-start" spacing={5}>
                                    <Box>
                                        <Text
                                            fontSize="lg"
                                            fontWeight="700"
                                            color={highlight ? 'white' : undefined}
                                        >
                                            {plan.name}
                                        </Text>
                                        <HStack spacing={1} mt={1}>
                                            <Text
                                                fontSize="4xl"
                                                fontWeight="800"
                                                color={highlight ? 'white' : 'gray.800'}
                                                _dark={{ color: highlight ? 'white' : 'white' }}
                                            >
                                                {formatPrice(plan.price, plan.billing_cycle)}
                                            </Text>
                                            {parseFloat(plan.price || 0) > 0 && (
                                                <Text
                                                    fontSize="sm"
                                                    color={highlight ? 'whiteAlpha.800' : 'gray.500'}
                                                    _dark={{ color: highlight ? 'whiteAlpha.800' : 'gray.400' }}
                                                >
                                                    {getPeriod(plan.billing_cycle)}
                                                </Text>
                                            )}
                                        </HStack>
                                    </Box>

                                    <Text
                                        fontSize="sm"
                                        color={highlight ? 'whiteAlpha.900' : 'gray.500'}
                                        _dark={{ color: highlight ? 'whiteAlpha.900' : 'gray.400' }}
                                        lineHeight="1.6"
                                    >
                                        {plan.description}
                                    </Text>

                                    <List spacing={2.5}>
                                        {getFeatures(plan).map((feature, fIdx) => (
                                            <ListItem key={fIdx} display="flex" alignItems="flex-start">
                                                <ListIcon
                                                    as={Check}
                                                    color={highlight ? 'white' : 'teal.500'}
                                                    mt={0.5}
                                                />
                                                <Text
                                                    fontSize="sm"
                                                    color={highlight ? 'whiteAlpha.900' : 'gray.600'}
                                                    _dark={{ color: highlight ? 'whiteAlpha.900' : 'gray.300' }}
                                                >
                                                    {feature}
                                                </Text>
                                            </ListItem>
                                        ))}
                                    </List>

                                    <Button
                                        as={RouterLink}
                                        to="/register"
                                        w="100%"
                                        size="lg"
                                        mt="auto"
                                        colorScheme={highlight ? 'whiteAlpha' : 'teal'}
                                        variant={highlight ? 'solid' : 'outline'}
                                        color={highlight ? 'teal.600' : undefined}
                                        _hover={{ transform: 'translateY(-2px)' }}
                                    >
                                        {t('Get Started')}
                                    </Button>
                                </VStack>
                            </Box>
                        </MotionBox>
                    );
                })}
            </SimpleGrid>
        </LandingSection>
    );
}
