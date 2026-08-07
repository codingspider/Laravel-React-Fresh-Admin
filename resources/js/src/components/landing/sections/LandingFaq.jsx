import React from 'react';
import {
    Box,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Text,
    Stack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LandingSection from './LandingSection';

const MotionBox = motion(Box);

export default function LandingFaq({ faqs = [] }) {
    const { t } = useTranslation();

    return (
        <Box bg="white" _dark={{ bg: 'gray.800' }} py={{ base: 16, md: 24 }}>
            <LandingSection
                id="faq"
                badge={t('FAQ')}
                title={t('Frequently asked questions')}
                subtitle={t('Everything you need to know before getting started. Still curious? Reach out any time.')}
            >
                <MotionBox
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.6 }}
                    maxW="760px"
                    mx="auto"
                >
                    {faqs.length > 0 ? (
                        <Accordion allowMultiple>
                            <Stack spacing={3}>
                                {faqs.map((faq, index) => (
                                    <AccordionItem
                                        key={faq.id ?? index}
                                        border="1px solid"
                                        borderColor="gray.200"
                                        _dark={{ borderColor: 'gray.700', bg: 'gray.900' }}
                                        borderRadius="lg"
                                        overflow="hidden"
                                        bg="white"
                                    >
                                        {({ isExpanded }) => (
                                            <>
                                                <AccordionButton
                                                    py={4}
                                                    px={5}
                                                    _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }}
                                                >
                                                    <Box flex="1" textAlign="left">
                                                        <Text fontWeight="600" fontSize={{ base: 'sm', md: 'md' }}>
                                                            {index + 1}. {faq.question}
                                                        </Text>
                                                    </Box>
                                                    <AccordionIcon color={isExpanded ? 'teal.500' : 'gray.400'} />
                                                </AccordionButton>
                                                <AccordionPanel
                                                    pb={4}
                                                    px={5}
                                                    borderTop={isExpanded ? '1px solid' : 'none'}
                                                    borderColor="gray.100"
                                                    _dark={{ borderColor: 'gray.700' }}
                                                >
                                                    <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }} lineHeight="1.7">
                                                        {faq.answer}
                                                    </Text>
                                                </AccordionPanel>
                                            </>
                                        )}
                                    </AccordionItem>
                                ))}
                            </Stack>
                        </Accordion>
                    ) : (
                        <Text textAlign="center" color="gray.500" _dark={{ color: 'gray.400' }}>
                            {t('No frequently asked questions yet.')}
                        </Text>
                    )}
                </MotionBox>
            </LandingSection>
        </Box>
    );
}