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
    Textarea,
    Button,
    Stack,
    SimpleGrid,
    Divider,
    Spinner,
    Center,
    useToast,
    Icon,
    HStack,
    IconButton,
} from '@chakra-ui/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Globe, Type, BarChart3, Mail, Share2, ListTree, Plus, Trash2, GitCompare } from 'lucide-react';
import api from '../../axios';
import { WEBSITE_SETTINGS } from '../../routes/apiRoutes';
import { DASHBOARD_PATH } from '../../routes/superAdminRoutes';
import useThemeColors from '../../hooks/useThemeColors';
import PageHeader from '../ui/PageHeader';

const Field = ({ label, register, error, helper, ...props }) => (
    <FormControl isInvalid={!!error}>
        <FormLabel fontSize="sm" fontWeight="600">
            {label}
        </FormLabel>
        {props.type === 'textarea' ? (
            <Textarea rows={3} {...register} {...props} />
        ) : (
            <Input {...register} {...props} />
        )}
        {helper && <FormHelperText fontSize="xs">{helper}</FormHelperText>}
    </FormControl>
);

const SectionCard = ({ icon, title, subtitle, children, colors }) => (
    <Card bg={colors.bgCard} border="1px solid" borderColor={colors.borderSubtle} borderRadius="xl" shadow="sm" mb={6}>
        <CardHeader borderBottom="1px solid" borderColor={colors.borderSubtle} pb={4}>
            <HStack spacing={3}>
                <Box
                    p={2.5}
                    borderRadius="lg"
                    bg="teal.50"
                    _dark={{ bg: 'teal.900' }}
                >
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
        <CardBody>
            {children}
        </CardBody>
    </Card>
);

const WebsiteSettings = () => {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const toast = useToast();
    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm();
    const [loading, setLoading] = useState(true);

    const { fields: comparisonFields, append: comparisonAppend, remove: comparisonRemove } = useFieldArray({
        control,
        name: 'comparison_rows',
    });

    useEffect(() => {
        let active = true;
        api.get(WEBSITE_SETTINGS)
            .then((res) => {
                if (active) reset(res.data?.data || {});
            })
            .catch(() => {
                if (active) {
                    toast({
                        title: t('Failed to load settings'),
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    });
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (values) => {
        try {
            await api.put(WEBSITE_SETTINGS, values);
            toast({
                title: t('Settings saved'),
                description: t('The public website has been updated.'),
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
                title="Front Website"
                subtitle="Edit the content shown on the public landing page."
                breadcrumbs={[
                    { label: t('dashboard'), path: DASHBOARD_PATH },
                    { label: t('Front Website'), isCurrent: true },
                ]}
            />

            <form onSubmit={handleSubmit(onSubmit)}>
                <SectionCard
                    icon={Globe}
                    title={t('Branding')}
                    subtitle={t('Your restaurant brand shown in the navbar and footer.')}
                    colors={colors}
                >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Field
                            label={t('Site Name')}
                            register={register('site_name', { required: true })}
                            error={errors.site_name}
                            type="text"
                        />
                        <Field
                            label={t('Site Tagline')}
                            register={register('site_tagline')}
                            type="text"
                        />
                        <Field
                            label={t('Logo URL')}
                            register={register('site_logo')}
                            helper={t('Optional image URL for the navbar logo.')}
                            type="text"
                        />
                    </SimpleGrid>
                </SectionCard>

                <SectionCard
                    icon={Type}
                    title={t('Hero Section')}
                    subtitle={t('The headline area visitors see first.')}
                    colors={colors}
                >
                    <Stack spacing={6}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Field
                                label={t('Hero Badge')}
                                register={register('hero_badge')}
                                type="text"
                            />
                            <Field
                                label={t('Hero Image URL')}
                                register={register('hero_image')}
                                helper={t('Optional hero image shown beside the headline.')}
                                type="text"
                            />
                        </SimpleGrid>
                        <Field
                            label={t('Hero Title')}
                            register={register('hero_title')}
                            type="text"
                        />
                        <Field
                            label={t('Hero Subtitle')}
                            register={register('hero_subtitle')}
                            type="textarea"
                        />
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Field
                                label={t('Primary Button Text')}
                                register={register('hero_primary_cta_text')}
                                type="text"
                            />
                            <Field
                                label={t('Primary Button URL')}
                                register={register('hero_primary_cta_url')}
                                helper={t('e.g. /register or an external link.')}
                                type="text"
                            />
                            <Field
                                label={t('Secondary Button Text')}
                                register={register('hero_secondary_cta_text')}
                                type="text"
                            />
                            <Field
                                label={t('Secondary Button URL')}
                                register={register('hero_secondary_cta_url')}
                                type="text"
                            />
                        </SimpleGrid>
                    </Stack>
                </SectionCard>

                <SectionCard
                    icon={BarChart3}
                    title={t('Hero Stats')}
                    subtitle={t('Four key metrics displayed under the hero.')}
                    colors={colors}
                >
                    <Stack spacing={6}>
                        {[1, 2, 3, 4].map((num) => (
                            <SimpleGrid key={num} columns={{ base: 1, md: 2 }} spacing={4}>
                                <Field
                                    label={t(`Stat ${num} Value`)}
                                    register={register(`stat_${num}_value`)}
                                    type="text"
                                />
                                <Field
                                    label={t(`Stat ${num} Label`)}
                                    register={register(`stat_${num}_label`)}
                                    type="text"
                                />
                            </SimpleGrid>
                        ))}
                    </Stack>
                </SectionCard>

                <SectionCard
                    icon={GitCompare}
                    title={t('Comparison Table')}
                    subtitle={t('The feature comparison table shown on the public landing page.')}
                    colors={colors}
                >
                    <Stack spacing={4}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Field
                                label={t('Platform Label')}
                                register={register('comparison_platform_label')}
                                helper={t('Column header for your platform.')}
                                type="text"
                            />
                            <Field
                                label={t('Competitor Label')}
                                register={register('comparison_others_label')}
                                helper={t('Column header for competitors.')}
                                type="text"
                            />
                        </SimpleGrid>

                        <Text fontSize="xs" color={colors.textMuted} mt={4}>
                            {t('Comparison rows')}
                        </Text>

                        {comparisonFields.map((row, index) => (
                            <HStack key={row.id} spacing={4} align="flex-start">
                                <FormControl isInvalid={!!errors.comparison_rows?.[index]?.feature} flex={3}>
                                    <FormLabel fontSize="xs" fontWeight="600">
                                        {t('Feature')}
                                    </FormLabel>
                                    <Input
                                        {...register(`comparison_rows.${index}.feature`, { required: true })}
                                        placeholder={t('Feature name')}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        size="sm"
                                    />
                                </FormControl>
                                <FormControl isInvalid={!!errors.comparison_rows?.[index]?.us} flex={2}>
                                    <FormLabel fontSize="xs" fontWeight="600">
                                        {t('Our platform')}
                                    </FormLabel>
                                    <Input
                                        {...register(`comparison_rows.${index}.us`)}
                                        placeholder={t('e.g. Yes, 0%, Included')}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        size="sm"
                                    />
                                </FormControl>
                                <FormControl isInvalid={!!errors.comparison_rows?.[index]?.competitors} flex={2}>
                                    <FormLabel fontSize="xs" fontWeight="600">
                                        {t('Others')}
                                    </FormLabel>
                                    <Input
                                        {...register(`comparison_rows.${index}.competitors`)}
                                        placeholder={t('e.g. Varies, 2.9%')}
                                        bg={colors.bgInput}
                                        border="1px solid"
                                        borderColor={colors.borderInput}
                                        size="sm"
                                    />
                                </FormControl>
                                <FormControl mt={6} flex={0} align="flex-start">
                                    <FormLabel fontSize="xs" fontWeight="600" visibility="hidden">
                                        x
                                    </FormLabel>
                                    <IconButton
                                        aria-label={t('Remove row')}
                                        icon={<Trash2 size={14} />}
                                        colorScheme="red"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => comparisonRemove(index)}
                                        isDisabled={comparisonFields.length <= 1}
                                        mt={0}
                                    />
                                </FormControl>
                            </HStack>
                        ))}

                        <Button
                            leftIcon={<Icon as={Plus} boxSize={4} />}
                            size="sm"
                            variant="outline"
                            colorScheme="teal"
                            onClick={() =>
                                comparisonAppend({ feature: '', us: '', competitors: '' })
                            }
                        >
                            {t('Add Row')}
                        </Button>
                    </Stack>
                </SectionCard>

                <SectionCard
                    icon={Mail}
                    title={t('Contact')}
                    subtitle={t('Contact details shown in the footer.')}
                    colors={colors}
                >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Field
                            label={t('Contact Email')}
                            register={register('contact_email')}
                            type="email"
                        />
                        <Field
                            label={t('Contact Phone')}
                            register={register('contact_phone')}
                            type="text"
                        />
                        <Field
                            label={t('Contact Address')}
                            register={register('contact_address')}
                            type="text"
                        />
                    </SimpleGrid>
                </SectionCard>

                <SectionCard
                    icon={Share2}
                    title={t('Social Links')}
                    subtitle={t('Optional social profiles shown in the footer.')}
                    colors={colors}
                >
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Field label={t('Facebook')} register={register('social_facebook')} type="text" />
                        <Field label={t('Twitter')} register={register('social_twitter')} type="text" />
                        <Field label={t('Instagram')} register={register('social_instagram')} type="text" />
                        <Field label={t('LinkedIn')} register={register('social_linkedin')} type="text" />
                        <Field label={t('YouTube')} register={register('social_youtube')} type="text" />
                    </SimpleGrid>
                </SectionCard>

                <SectionCard
                    icon={ListTree}
                    title={t('Footer')}
                    subtitle={t('Footer about text and copyright line.')}
                    colors={colors}
                >
                    <Stack spacing={6}>
                        <Field
                            label={t('Footer About')}
                            register={register('footer_about')}
                            type="textarea"
                        />
                        <Field
                            label={t('Copyright Text')}
                            register={register('copyright_text')}
                            type="text"
                        />
                    </Stack>
                </SectionCard>

                <Divider mb={6} />

                <HStack justify="flex-end" spacing={4} pb={6}>
                    <Button
                        variant="outline"
                        colorScheme="teal"
                        onClick={() => reset()}
                    >
                        {t('Reset')}
                    </Button>
                    <Button
                        type="submit"
                        colorScheme="teal"
                        isLoading={isSubmitting}
                        loadingText={t('Saving')}
                        px={8}
                    >
                        {t('Save Changes')}
                    </Button>
                </HStack>
            </form>
        </Box>
    );
};

export default WebsiteSettings;
