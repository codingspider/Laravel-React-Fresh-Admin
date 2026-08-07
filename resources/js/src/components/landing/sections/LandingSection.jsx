import React from 'react';
import { Box, Container, Text, Heading, Badge, Stack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

export default function LandingSection({
    id,
    badge,
    title,
    subtitle,
    children,
    maxW = '1200px',
}) {
    return (
        <Box id={id} py={{ base: 16, md: 24 }}>
            <Container maxW={maxW} px={{ base: 4, md: 8 }}>
                <MotionBox
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    textAlign="center"
                    mb={{ base: 10, md: 16 }}
                >
                    {badge && (
                        <Badge
                            colorScheme="teal"
                            variant="subtle"
                            px={4}
                            py={1.5}
                            mb={4}
                            fontSize="sm"
                            fontWeight="600"
                            letterSpacing="wide"
                        >
                            {badge}
                        </Badge>
                    )}
                    <Heading
                        as="h2"
                        size={{ base: 'xl', md: '2xl' }}
                        fontWeight="800"
                        letterSpacing="tight"
                        lineHeight="1.15"
                    >
                        {title}
                    </Heading>
                    {subtitle && (
                        <Text
                            mt={4}
                            fontSize={{ base: 'md', md: 'lg' }}
                            color="gray.500"
                            _dark={{ color: 'gray.400' }}
                            maxW="640px"
                            mx="auto"
                        >
                            {subtitle}
                        </Text>
                    )}
                </MotionBox>
                {children}
            </Container>
        </Box>
    );
}
