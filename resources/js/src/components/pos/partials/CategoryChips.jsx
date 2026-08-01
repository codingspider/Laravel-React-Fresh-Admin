import React from 'react';
import { Box, HStack, Tag, TagLabel } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useThemeColors from '../../../hooks/useThemeColors';

export default function CategoryChips({ categories, selectedCategory, setSelectedCategory }) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Box px={4} py={1.5} bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderDefault}>
      <Box overflowX="auto" pb={0.5} sx={{
        '&::-webkit-scrollbar': { height: '4px' },
        '&::-webkit-scrollbar-thumb': { bg: 'gray.300', borderRadius: 'full' },
      }}>
        <HStack spacing={2} minW="max-content">
          <Tag
            size="sm" variant="solid" cursor="pointer"
            bg={selectedCategory === null ? colors.chipActiveBg : colors.chipBg}
            color={selectedCategory === null ? colors.chipActiveColor : colors.chipColor}
            borderRadius="full" fontWeight="600" px={3.5} py={1}
            onClick={() => setSelectedCategory(null)}
            _hover={{ transform: 'scale(1.02)' }} transition="all 0.15s"
          >
            <TagLabel>{t('All Categories')}</TagLabel>
          </Tag>
          {categories.map(cat => (
            <Tag
              key={cat.id} size="sm" variant="solid" cursor="pointer"
              bg={selectedCategory === cat.id ? colors.chipActiveBg : colors.chipBg}
              color={selectedCategory === cat.id ? colors.chipActiveColor : colors.chipColor}
              borderRadius="full" fontWeight="600" px={3.5} py={1}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              _hover={{ transform: 'scale(1.02)' }} transition="all 0.15s" whiteSpace="nowrap"
            >
              <TagLabel>{cat.name}</TagLabel>
            </Tag>
          ))}
        </HStack>
      </Box>
    </Box>
  );
}
