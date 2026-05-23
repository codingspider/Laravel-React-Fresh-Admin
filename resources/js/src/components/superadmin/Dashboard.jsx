import { Card, CardBody, Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  Box,
 } from '@chakra-ui/react';
import Chart from '../chart/Chart';
import Pie from '../chart/Pie';
import Stats from '../dashboard/Stats';
import RecentOrder from '../dashboard/RecentOrder';
import RecentPayment from '../dashboard/RecentPayment';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  return (
    <Box className="form-dark-surface">
      {/* Breadcrumb */}
      <Card mb={5}>
        <CardBody>
          <Breadcrumb fontSize={{ base: 'sm', md: 'md' }}>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t('home')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t('dashboard')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">{t('stats')}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </CardBody>
      </Card>

      {/* Cards grid: auto-fill responsive columns */}
      <Stats></Stats>

      {/* Charts section: 1 col on phones, 2 on small screens & up */}
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={6}
        mt={5}
      >
        <Card>
          <CardBody>
            <Box h="300px">
              <Chart />
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Box h="300px">
              <Pie />
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Table with horizontal scroll on small screens */}
    <SimpleGrid
      mt={5}
      columns={{ base: 1, md: 2 }}   // 1 column on phones, 2 on md screens+
      spacing={6}
    >
      <Card>
        <CardBody>
          <RecentOrder></RecentOrder>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <RecentPayment></RecentPayment>
        </CardBody>
      </Card>
    </SimpleGrid>
    </Box>
  );
};

export default Dashboard
