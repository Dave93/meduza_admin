import {
  List,
  Table,
  useTable,
  Switch,
  Space,
  EditButton,
} from "@pankod/refine-antd";
import { useGetIdentity } from "@pankod/refine-core";

import { ICouriers, IOrderStatus } from "interfaces";

export const CouriersList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { tableProps } = useTable<ICouriers>({
    initialSorter: [
      {
        field: "name",
        order: "asc",
      },
    ],
    metaData: {
      fields: ["id", "name", "active", "phone"],
      whereInputType: "couriersWhereInput!",
      orderByInputType: "couriersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });
  return (
    <>
      <List title="Курьеры">
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="active"
            title="Активный"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column dataIndex="name" title="Имя" />
          <Table.Column dataIndex="phone" title="Телефон" />
          <Table.Column<ICouriers>
            title="Actions"
            dataIndex="actions"
            render={(_text, record): React.ReactNode => {
              return (
                <Space>
                  <EditButton size="small" recordItemId={record.id} hideText />
                </Space>
              );
            }}
          />
        </Table>
      </List>
    </>
  );
};
