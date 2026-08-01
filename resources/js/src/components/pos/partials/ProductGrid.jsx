import React from 'react';
import {
  Box, Text, Grid, GridItem, Card, CardBody, HStack, VStack, Image,
  AspectRatio, Center, useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import useThemeColors from '../../../hooks/useThemeColors';

export default function ProductGrid({ filteredItems, addToCart }) {
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const colors = useThemeColors();
  const itemBg = colors.productBg;
  const itemBorder = colors.productBorder;
  const emptyColor = colors.textMuted;
  const softShadow = useColorModeValue('soft', 'softDark');

  return (
    <Box flex="1" overflowY="auto" px={3} py={2}>
      {filteredItems.length === 0 ? (
        <Center h="100%" flexDirection="column">
          <Box p={8} borderRadius="2xl" bg={colors.bgSubtle} mb={4}>
            <Package size={64} color={emptyColor} strokeWidth={1} />
          </Box>
          <Text color={colors.textSecondary} fontSize="lg" fontWeight="600">{t('No products match filters')}</Text>
          <Text color={colors.textMuted} fontSize="sm" mt={1}>{t('Try a different search or category')}</Text>
        </Center>
      ) : (
        <Grid
          templateColumns={{
            base: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(5, 1fr)',
          }}
          gap={2.5}
        >
          {filteredItems.map(item => (
            <GridItem key={item.id}>
              <Card
                cursor="pointer"
                onClick={() => addToCart(item)}
                _hover={{ transform: 'translateY(-2px)', shadow: softShadow, borderColor: 'brand.400' }}
                transition="all 0.15s"
                bg={itemBg}
                border="1px solid"
                borderColor={itemBorder}
                borderRadius="lg"
                overflow="hidden"
                size="sm"
              >
                <AspectRatio ratio={16 / 9}>
                  <Box bg={colors.bgSubtle} display="flex" alignItems="center" justifyContent="center">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} objectFit="cover" w="100%" h="100%" />
                    ) : (
                      <Package size={28} color={emptyColor} strokeWidth={1.2} />
                    )}
                  </Box>
                </AspectRatio>
                <CardBody p={2}>
                  <Text fontWeight="700" fontSize="sm" color={colors.textPrimary} noOfLines={1} mb={0.5}>
                    {item.name}
                  </Text>
                  <HStack justify="space-between" align="center">
                    <Text color="brand.500" fontWeight="800" fontSize="sm">
                      {formatAmount(parseFloat(item.price || 0))}
                    </Text>
                    {item.sku && (
                      <Text fontSize="xs" color={colors.textMuted}>{item.sku}</Text>
                    )}
                  </HStack>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      )}
    </Box>
  );
}
