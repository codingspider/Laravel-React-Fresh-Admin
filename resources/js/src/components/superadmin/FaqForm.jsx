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
    Spinner,
    Center,
    Switch,
    useToast,
    Icon,
    HStack,
    VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { HelpCircle, Save, ArrowLeft } from 'lucide-react';
import api from '../../axios';
import { FAQS_API, FAQ_API } from '../../routes/apiRoutes';
import { FAQ_LIST_PATH, DASHBOARD_PATH } from '../../routes/superAdminRoutes';
import useThemeColors from '../../hooks/useThemeColors';
import PageHeader from '../ui/PageHeader';

const FaqForm = () => {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm();
    const [loading, setLoading] = useState(isEdit);

    const isActive = watch('is_active', true);

    useEffect(() => {
        if (!isEdit) {
            reset({ question: '', answer: '', sort_order: 0, is_active: true });
            return;
        }

        let active = true;
        api.get(FAQ_API(id))
            .then((res) => {
                if (active && res.data?.data) {
                    reset({
                        question: res.data.data.question || '',
                        answer: res.data.data.answer || '',
                        sort_order: res.data.data.sort_order ?? 0,
                        is_active: res.data.data.is_active ?? true,
                    });
                }
            })
            .catch((error) => {
                if (active) {
                    toast({
                        title: t('Failed to load FAQ'),
                        description: error.response?.data?.message || t('Something went wrong. Please try again.'),
                        status: 'error',
                        duration: 4000,
                        isClosable: true,
                    });
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const onSubmit = async (values) => {
        try {
            if (isEdit) {
                await api.put(FAQ_API(id), values);
            } else {
                await api.post(FAQS_API, values);
            }
            toast({
                title: isEdit ? t('FAQ updated') : t('FAQ created'),
                description: t('Changes saved successfully.'),
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            navigate(FAQ_LIST_PATH);
        } catch (error) {
            toast({
                title: isEdit ? t('Failed to update FAQ') : t('Failed to create FAQ'),
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
                title={isEdit ? t('Edit FAQ') : t('Add FAQ')}
                subtitle={t('Manage the frequently asked questions shown on the public website.')}
                breadcrumbs={[
                    { label: t('dashboard'), path: DASHBOARD_PATH },
                    { label: t('FAQs'), path: FAQ_LIST_PATH },
                    { label: isEdit ? t('Edit FAQ') : t('Add FAQ'), isCurrent: true },
                ]}
            />

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card bg={colors.bgCard} border="1px solid" borderColor={colors.borderSubtle} borderRadius="xl" shadow="sm" mb={6}>
                    <CardHeader borderBottom="1px solid" borderColor={colors.borderSubtle} pb={4}>
                        <HStack spacing={3}>
                            <Box p={2.5} borderRadius="lg" bg="teal.50" _dark={{ bg: 'teal.900' }}>
                                <Icon as={HelpCircle} boxSize={5} color="teal.500" />
                            </Box>
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                    {t('FAQ Details')}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={0.5}>
                                    {t('The question and answer shown in the FAQ section.')}
                                </Text>
                            </Box>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={6} align="stretch">
                            <FormControl isInvalid={!!errors.question}>
                                <FormLabel fontSize="sm" fontWeight="600">
                                    {t('Question')}
                                </FormLabel>
                                <Input
                                    {...register('question', { required: t('Question is required') })}
                                    placeholder={t('Enter the question')}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                />
                            </FormControl>

                            <FormControl isInvalid={!!errors.answer}>
                                <FormLabel fontSize="sm" fontWeight="600">
                                    {t('Answer')}
                                </FormLabel>
                                <Textarea
                                    rows={5}
                                    {...register('answer', { required: t('Answer is required') })}
                                    placeholder={t('Enter the answer')}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                />
                            </FormControl>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="600">
                                        {t('Sort Order')}
                                    </FormLabel>
                                    <Input
                                        type="number"
                                        min={0}
                                        {...register('sort_order', { valueAsNumber: true })}
                                        bg={colors.bgInput}
                                        borderColor={colors.borderInput}
                                    />
                                    <FormHelperText fontSize="xs">
                                        {t('Lower values appear first.')}
                                    </FormHelperText>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="600">
                                        {t('Active')}
                                    </FormLabel>
                                    <HStack spacing={3}>
                                        <Switch
                                            colorScheme="teal"
                                            isChecked={isActive}
                                            onChange={(e) => setValue('is_active', e.target.checked, { shouldValidate: true })}
                                        />
                                        <Text fontSize="sm" color={colors.textSecondary}>
                                            {isActive ? t('Visible on the website') : t('Hidden from the website')}
                                        </Text>
                                    </HStack>
                                </FormControl>
                            </SimpleGrid>
                        </VStack>
                    </CardBody>
                </Card>

                <HStack justify="flex-end" spacing={4} pb={6}>
                    <Button
                        variant="outline"
                        colorScheme="teal"
                        leftIcon={<ArrowLeft size={16} />}
                        onClick={() => navigate(FAQ_LIST_PATH)}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        type="submit"
                        colorScheme="teal"
                        leftIcon={<Save size={16} />}
                        isLoading={isSubmitting}
                        loadingText={t('Saving')}
                        px={8}
                    >
                        {isEdit ? t('Update FAQ') : t('Create FAQ')}
                    </Button>
                </HStack>
            </form>
        </Box>
    );
};

export default FaqForm;
