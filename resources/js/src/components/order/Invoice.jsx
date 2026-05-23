import React from "react";
import {
  Box,
  Text,
  Flex,
  Divider,
  VStack,
  HStack,
} from "@chakra-ui/react";

const Row = ({ label, value, bold = false }) => (
  <Flex justify="space-between" align="flex-start" w="100%">
    <Text fontWeight={bold ? "700" : "500"}>{label}</Text>
    <Text textAlign="right">{value}</Text>
  </Flex>
);

const Item = ({ name, price }) => (
  <Box w="100%">
    <Flex justify="space-between" fontWeight="600">
      <Text>{name}</Text>
      <Text>{price}</Text>
    </Flex>

    <Text fontSize="12px" color="gray.600">
      (Cheese Deep)
    </Text>

    <Text fontSize="12px" color="gray.600">
      Add Some Extra cheese in pizza
    </Text>
  </Box>
);

const Invoice = () => {
  return (
    <Flex justify="center" bg="gray.200" minH="100vh" py={10}>
      <Box
        bg="white"
        w="320px"
        p={4}
        fontFamily="Arial, sans-serif"
        color="black"
        fontSize="14px"
        boxShadow="md"
      >
        {/* Header */}
        <VStack spacing={1}>
          <Text fontSize="28px" fontWeight="700">
            Kacchi Dine
          </Text>

          <Text fontSize="13px">Bogura, Bangladesh</Text>

          <Text fontSize="13px">
            Phone Number: +1 (505)-520-2213
          </Text>
        </VStack>

        <Divider borderStyle="dashed" my={3} />

        {/* Customer Info */}
        <VStack spacing={1} align="stretch">
          <Row label="Customer Name:" value="John Doe" />
          <Row
            label="Customer Email:"
            value="john.doe@example.com"
          />
          <Row label="Customer Phone:" value="+1 555-1234" />
          <Row label="Notes:" value="Extra cheese, no olives." />
        </VStack>

        <Divider borderStyle="dashed" my={3} />

        {/* Order Info */}
        <Flex justify="space-between" mb={2}>
          <VStack align="start" spacing={0}>
            <Text>Order ID</Text>
            <Text>Order type</Text>
            <Text>Order Date & Time</Text>
            <Text>Order Source</Text>
          </VStack>

          <VStack align="end" spacing={0}>
            <Text>INV00001</Text>
            <Text>Dine-in</Text>
            <Text>22-05-2026 08:26</Text>
            <Text>POS</Text>
          </VStack>
        </Flex>

        <Divider borderStyle="dashed" my={3} />

        {/* Items Header */}
        <Flex justify="space-between" fontWeight="700" mb={2}>
          <Text>Item Name</Text>

          <HStack spacing={10}>
            <Text>Quantity</Text>
            <Text>Price</Text>
          </HStack>
        </Flex>

        {/* Items */}
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between">
            <Box>
              <Item name="Margherita Pizza" />
            </Box>

            <HStack align="start" spacing={8}>
              <Text>1</Text>
              <Text>$400.00</Text>
            </HStack>
          </Flex>

          <Flex justify="space-between">
            <Box>
              <Item name="Coke" />
            </Box>

            <HStack align="start" spacing={8}>
              <Text>1</Text>
              <Text>$100.00</Text>
            </HStack>
          </Flex>

          <Flex justify="space-between">
            <Box>
              <Item name="Garlic Bread" />
            </Box>

            <HStack align="start" spacing={8}>
              <Text>1</Text>
              <Text>$100.00</Text>
            </HStack>
          </Flex>
        </VStack>

        <Divider borderStyle="dashed" my={4} />

        {/* Totals */}
        <VStack spacing={1} align="stretch">
          <Row label="Sub Total" value="$656.00/-" />
          <Row label="Discount (10%)" value="- $65.60/-" />
          <Row label="Tax (10%)" value="$59.04/-" />
          <Row label="Delivery Fee" value="$10.00/-" />

          <Flex
            justify="space-between"
            fontWeight="700"
            fontSize="24px"
            mt={2}
          >
            <Text>Grand Total</Text>
            <Text>$749.44/-</Text>
          </Flex>
        </VStack>

        <Divider borderStyle="dashed" my={4} />

        {/* Payment */}
        <Text fontWeight="700" fontSize="22px" mb={3}>
          Payment Methods
        </Text>

        <VStack spacing={1} align="stretch">
          <Row label="Payment Date:" value="30 Jul, 10:58 AM" />
          <Row label="Payment method:" value="Credit Card" />
          <Row label="Transaction Id:" value="TXN789654321" />
          <Row label="Paid Amount:" value="$977.14" />
          <Row label="Tip Amount:" value="$2" />
          <Row label="Total Paid Amount:" value="$979.14" />
        </VStack>

        <Text textAlign="center" fontSize="12px" mt={5}>
          By using this service, you agree to our terms and
          conditions.
        </Text>

        <Divider borderStyle="dashed" my={4} />

        <Text textAlign="center" fontSize="13px">
          Refunds are processed within 30 days.
        </Text>

        <Divider borderStyle="dashed" my={4} />

        <Text
          textAlign="center"
          fontWeight="700"
          fontSize="22px"
        >
          Thank you for dining with us!
        </Text>
      </Box>
    </Flex>
  );
};

export default Invoice;