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
import LandingSection from './LandingSection';

const MotionBox = motion(Box);

const faqs = [
    {
        question: 'What is a restaurant POS system?',
        answer: 'A restaurant POS (Point of Sale) system handles every part of a transaction — taking orders, processing payments, sending orders to the kitchen and recording sales — all from one place. Ours adds real-time kitchen sync, inventory and analytics on top.',
    },
    {
        question: 'Does the platform charge transaction fees?',
        answer: 'No. Unlike many providers that take a percentage of every card payment, our plans include zero transaction fees on all orders, no matter how you accept payment.',
    },
    {
        question: 'Can I use it on my phone or tablet?',
        answer: 'Yes. The POS is fully responsive and works on desktops, tablets and phones. Waiters can take orders from a handheld device while the kitchen sees them instantly.',
    },
    {
        question: 'Can I manage multiple restaurant locations?',
        answer: 'Absolutely. The Pro and Enterprise plans support multi-location management, letting each branch keep its own menu, staff, tables and settings while you view consolidated reports.',
    },
    {
        question: 'How do real-time updates work?',
        answer: 'Orders placed at the counter are pushed to kitchen display screens instantly. Status changes like "preparing" or "ready" propagate to all connected devices automatically — no manual refresh needed.',
    },
    {
        question: 'Is there a free trial or demo mode?',
        answer: 'Yes. You can start a free trial without a credit card, and the demo mode lets you explore the entire platform with sample data before you commit.',
    },
];

export default function LandingFaq() {
    return (
        <Box bg="white" _dark={{ bg: 'gray.800' }} py={{ base: 16, md: 24 }}>
            <LandingSection
                id="faq"
                badge="FAQ"
                title="Frequently asked questions"
                subtitle="Everything you need to know before getting started. Still curious? Reach out any time."
            >
                <MotionBox
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.6 }}
                    maxW="760px"
                    mx="auto"
                >
                    <Accordion allowMultiple>
                        <Stack spacing={3}>
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={faq.question}
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
                </MotionBox>
            </LandingSection>
        </Box>
    );
}
