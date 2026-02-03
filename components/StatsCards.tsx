import { Row, Col, Card, Statistic, Progress, Badge } from 'antd';
import { Typography } from 'antd';
interface Stats {
  occupancy: number;
  available: number;
  volume: number;
}

interface Props {
  stats: Stats;
}
const { Text } = Typography;
export default function StatsCards({ stats }: Props) {
  const { occupancy, available, volume } = stats;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Current Occupancy"
            value={occupancy}
            suffix="%"
            valueStyle={{ color: occupancy > 80 ? '#f5222d' : '#52c41a' }}
            prefix={<Badge status="processing" />}
          />
          <Progress
            percent={occupancy}
            status={occupancy > 90 ? 'exception' : 'active'}
            showInfo={false}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Available Slots"
            value={available}
            suffix="slots"
            valueStyle={{ color: '#52c41a' }}
          />
          <Text type="secondary">Level B2 Open</Text>
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Today's Volume"
            value={volume}
            valueStyle={{ color: '#faad14' }}
          />
          <Text type="success">+12% Daily Avg</Text>
        </Card>
      </Col>
    </Row>
  );
}