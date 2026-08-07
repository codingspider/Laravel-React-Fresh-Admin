import React from 'react';
import {
    Box,
    Flex,
    Text,
    HStack,
    VStack,
    Badge,
    SimpleGrid,
    Progress,
    Divider,
} from '@chakra-ui/react';
import {
    Search,
    ShoppingCart,
    CreditCard,
    TrendingUp,
    Users,
    Package,
    Circle,
    Table,
} from 'lucide-react';

const menuItems = [
    { name: 'Margherita Pizza', price: '$12.50', tag: 'Popular', color: 'teal' },
    { name: 'Classic Burger', price: '$9.90', tag: 'Best seller', color: 'blue' },
    { name: 'Caesar Salad', price: '$8.40', tag: 'Vegan', color: 'green' },
    { name: 'Iced Latte', price: '$4.75', tag: 'New', color: 'purple' },
];

export default function HeroMockup() {
    return (
        <Box
            maxW="1000px"
            mx="auto"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            _dark={{ borderColor: 'gray.700', bg: 'gray.800' }}
            boxShadow="0 40px 80px -20px rgba(0,0,0,0.25)"
            overflow="hidden"
            bg="white"
        >
            {/* Browser chrome */}
            <Flex
                align="center"
                justify="space-between"
                px={4}
                py={3}
                bg="gray.100"
                _dark={{ bg: 'gray.900', borderColor: 'gray.700' }}
                borderBottom="1px solid"
                borderColor="gray.200"
            >
                <HStack spacing={2}>
                    <Box w={3} h={3} borderRadius="full" bg="red.400" />
                    <Box w={3} h={3} borderRadius="full" bg="yellow.400" />
                    <Box w={3} h={3} borderRadius="full" bg="green.400" />
                </HStack>
                <Box
                    flex="1"
                    mx={4}
                    maxW="420px"
                    bg="white"
                    _dark={{ bg: 'gray.800' }}
                    borderRadius="md"
                    py={1.5}
                    px={4}
                    fontSize="xs"
                    color="gray.400"
                    textAlign="center"
                >
                    https://your-restaurant.pos
                </Box>
                <Badge colorScheme="green" variant="subtle">
                    Live
                </Badge>
            </Flex>

            <Flex direction={{ base: 'column', lg: 'row' }}>
                {/* Left: POS grid */}
                <Box flex="2" p={{ base: 4, md: 6 }}>
                    <Flex justify="space-between" align="center" mb={5}>
                        <Box>
                            <Text fontWeight="700" fontSize="lg">
                                Today's Menu
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                                24 categories · 180 items
                            </Text>
                        </Box>
                        <HStack spacing={2}>
                            <Box
                                bg="gray.100"
                                _dark={{ bg: 'gray.700' }}
                                p={2}
                                borderRadius="md"
                            >
                                <Search size={15} />
                            </Box>
                            <Box
                                bg="gray.100"
                                _dark={{ bg: 'gray.700' }}
                                p={2}
                                borderRadius="md"
                            >
                                <Table size={15} />
                            </Box>
                        </HStack>
                    </Flex>

                    <SimpleGrid columns={{ base: 2, md: 2 }} spacing={3} mb={5}>
                        {menuItems.map((item) => (
                            <Box
                                key={item.name}
                                p={4}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="gray.200"
                                _dark={{ borderColor: 'gray.700', bg: 'gray.700' }}
                                bg="gray.50"
                                _hover={{ borderColor: 'teal.400', cursor: 'pointer' }}
                                transition="all 0.2s"
                            >
                                <HStack justify="space-between" mb={2}>
                                    <Badge colorScheme={item.color} variant="subtle" fontSize="2xs">
                                        {item.tag}
                                    </Badge>
                                    <Box
                                        bg="teal.500"
                                        color="white"
                                        borderRadius="md"
                                        px={1.5}
                                        py={0.5}
                                        fontSize="xs"
                                    >
                                        +
                                    </Box>
                                </HStack>
                                <Text fontSize="sm" fontWeight="600">
                                    {item.name}
                                </Text>
                                <Text fontSize="sm" color="teal.500" fontWeight="700" mt={1}>
                                    {item.price}
                                </Text>
                            </Box>
                        ))}
                    </SimpleGrid>

                    <Box
                        borderRadius="lg"
                        p={4}
                        bg="gray.900"
                        _dark={{ bg: 'gray.900' }}
                        color="white"
                    >
                        <HStack justify="space-between" mb={3}>
                            <Text fontSize="sm" fontWeight="600">
                                Order #1042 — Table 4
                            </Text>
                            <Badge colorScheme="green" fontSize="2xs">
                                In kitchen
                            </Badge>
                        </HStack>
                        <SimpleGrid columns={3} spacing={3} opacity={0.9}>
                            <Box>
                                <Text fontSize="2xs" color="gray.400">Items</Text>
                                <Text fontWeight="700">6</Text>
                            </Box>
                            <Box>
                                <Text fontSize="2xs" color="gray.400">Total</Text>
                                <Text fontWeight="700">$54.20</Text>
                            </Box>
                            <Box>
                                <Text fontSize="2xs" color="gray.400">Time</Text>
                                <Text fontWeight="700">4:12</Text>
                            </Box>
                        </SimpleGrid>
                    </Box>
                </Box>

                {/* Right: cart + stats */}
                <Box
                    flex="1"
                    borderTop={{ base: '1px solid', lg: 'none' }}
                    borderLeft={{ base: 'none', lg: '1px solid' }}
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.700', bg: 'gray.900' }}
                    bg="gray.50"
                    p={{ base: 4, md: 6 }}
                    display={{ base: 'none', md: 'block' }}
                >
                    <VStack align="stretch" spacing={5}>
                        <HStack spacing={2}>
                            <ShoppingCart size={18} color="teal" />
                            <Text fontWeight="700" fontSize="md">
                                Current Order
                            </Text>
                        </HStack>
                        <VStack align="stretch" spacing={2.5}>
                            {[
                                { n: '2x Margherita Pizza', p: '$25.00' },
                                { n: '1x Classic Burger', p: '$9.90' },
                                { n: '1x Iced Latte', p: '$4.75' },
                            ].map((row) => (
                                <HStack key={row.n} justify="space-between" fontSize="sm">
                                    <Text color="gray.500" _dark={{ color: 'gray.400' }}>
                                        {row.n}
                                    </Text>
                                    <Text fontWeight="600">{row.p}</Text>
                                </HStack>
                            ))}
                        </VStack>
                        <Divider />
                        <HStack justify="space-between" fontSize="sm">
                            <Text color="gray.500" _dark={{ color: 'gray.400' }}>Subtotal</Text>
                            <Text fontWeight="600">$39.65</Text>
                        </HStack>
                        <HStack justify="space-between" fontSize="sm">
                            <Text color="gray.500" _dark={{ color: 'gray.400' }}>Tax (8%)</Text>
                            <Text fontWeight="600">$3.17</Text>
                        </HStack>
                        <HStack justify="space-between">
                            <Text fontWeight="700">Total</Text>
                            <Text fontWeight="800" color="teal.500" fontSize="lg">
                                $42.82
                            </Text>
                        </HStack>
                        <Box
                            bg="teal.500"
                            color="white"
                            borderRadius="lg"
                            py={3}
                            textAlign="center"
                            fontWeight="600"
                            fontSize="sm"
                        >
                            <HStack justify="center" spacing={2}>
                                <CreditCard size={16} />
                                <Text>Charge</Text>
                            </HStack>
                        </Box>
                    </VStack>

                    <Divider my={5} />

                    <SimpleGrid columns={2} spacing={3}>
                        <Box borderRadius="md" p={3} bg="white" _dark={{ bg: 'gray.800' }}>
                            <HStack spacing={2} mb={1}>
                                <TrendingUp size={14} color="teal.500" />
                                <Text fontSize="2xs" color="gray.400">Today</Text>
                            </HStack>
                            <Text fontWeight="700" fontSize="sm">$2,840</Text>
                        </Box>
                        <Box borderRadius="md" p={3} bg="white" _dark={{ bg: 'gray.800' }}>
                            <HStack spacing={2} mb={1}>
                                <Users size={14} color="blue.500" />
                                <Text fontSize="2xs" color="gray.400">Guests</Text>
                            </HStack>
                            <Text fontWeight="700" fontSize="sm">128</Text>
                        </Box>
                        <Box borderRadius="md" p={3} bg="white" _dark={{ bg: 'gray.800' }} colSpan={2}>
                            <HStack justify="space-between" mb={2}>
                                <HStack spacing={2}>
                                    <Package size={14} color="purple.500" />
                                    <Text fontSize="2xs" color="gray.400">Low stock alerts</Text>
                                </HStack>
                                <Text fontSize="xs" fontWeight="600" color="red.400">3 items</Text>
                            </HStack>
                            <Progress size="xs" colorScheme="red" value={68} borderRadius="full" />
                            <HStack justify="space-between" mt={1.5}>
                                <Text fontSize="2xs" color="gray.400">Tomatoes</Text>
                                <Circle size={6} fill="green.400" color="green.400" />
                            </HStack>
                        </Box>
                    </SimpleGrid>
                </Box>
            </Flex>
        </Box>
    );
}
