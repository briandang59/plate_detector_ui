import { Card, Table, Button, Tag } from 'antd';
import { MoreHorizontal } from 'lucide-react';

interface Transaction {
  key: string;
  time: string;
  lane: string;
  lpn: string;
  duration: string;
  status: string;
}

interface Props {
  data: Transaction[];
}

export default function TransactionTable({ data }: Props) {
  const columns = [
    { title: 'Time', dataIndex: 'time', key: 'time' },
    { title: 'Lane', dataIndex: 'lane', key: 'lane' },
    { title: 'LPN', dataIndex: 'lpn', key: 'lpn' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color: 'success' | 'processing' | 'warning' | 'default' = 'default';
        if (status === 'Allowed') color = 'success';
        if (status === 'Paid') color = 'processing';
        if (status === 'Manual Review') color = 'warning';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button type="text" icon={<MoreHorizontal size={16} />} />,
    },
  ];

  return (
    <Card
      title="Recent Transaction Logs"
      extra={<Button type="link">View All</Button>}
    >
      <Table columns={columns} dataSource={data} pagination={false} />
    </Card>
  );
}