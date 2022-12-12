import {
  CrudFilters,
  HttpError,
  useGetIdentity,
  useNavigation,
} from "@pankod/refine-core";
import { FC } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
import {
  Button,
  EditButton,
  ShowButton,
  Space,
  Table,
  Tag,
  useTable,
} from "@pankod/refine-antd";
import { IOrders } from "interfaces";

interface CustomerOrdersProps {
  customerId: string;
}

var weekday = require("dayjs/plugin/weekday");
dayjs.locale("ru");
dayjs.extend(weekday);
dayjs.extend(duration);

const CustomerOrders: FC<CustomerOrdersProps> = ({ customerId }) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { show } = useNavigation();

  const { tableProps, searchFormProps, filters, sorter, setFilters } = useTable<
    IOrders,
    HttpError,
    {
      organization_id: string;
      customer_id: string;
    }
  >({
    initialSorter: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    resource: "orders",
    metaData: {
      fields: [
        "id",
        // "number",
        "delivery_type",
        "created_at",
        "order_price",
        "duration",
        "delivery_price",
        "payment_type",
        {
          orders_couriers: ["id", "name"],
        },
        {
          orders_customers: ["id", "name", "phone"],
        },
        {
          orders_order_status: ["id", "name", "color"],
        },
      ],
      whereInputType: "ordersWhereInput!",
      orderByInputType: "ordersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
    initialFilter: [
      {
        field: "customer_id",
        operator: "contains",
        value: {
          custom: {
            equals: customerId,
          },
        },
      },
    ],
    onSearch: async (params) => {
      const filters: CrudFilters = [];
      const { organization_id, customer_id } = params;
      console.log("is filtering", filters);

      if (organization_id) {
        filters.push({
          field: "organization_id",
          operator: "contains",
          value: {
            custom: {
              equals: organization_id,
            },
          },
        });
      }
      if (customer_id) {
        filters.push({
          field: "customer_id",
          operator: "contains",
          value: {
            custom: {
              equals: customer_id,
            },
          },
        });
      }
      console.log("is filtering ready", filters);
      return filters;
    },
  });

  const goToCustomer = (id: string) => {
    show(`customers`, id);
  };

  const goToCourier = (id: string) => {
    show(`users`, id);
  };
  return (
    <div>
      <Table
        {...tableProps}
        rowKey="id"
        bordered
        size="small"
        onRow={(record: any) => ({
          onDoubleClick: () => {
            show("orders", record.id);
          },
        })}
      >
        <Table.Column dataIndex="id" title="№" />
        <Table.Column
          dataIndex="created_at"
          title="Дата заказа"
          render={(record: any) => (
            <span>{dayjs(record).format("DD.MM.YYYY HH:mm")}</span>
          )}
        />
        <Table.Column
          dataIndex="order_status_id"
          title="Статус"
          render={(value: any, record: any) => (
            <Tag color={record.orders_order_status.color}>
              {record.orders_order_status.name}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="orders_couriers.name"
          title="Мойщик"
          render={(value: any, record: IOrders) =>
            record.orders_couriers ? (
              <Button
                type="link"
                size="small"
                onClick={() => goToCourier(record.orders_couriers.id)}
              >
                {`${record.orders_couriers.name}`}
              </Button>
            ) : (
              <span>Не назначен</span>
            )
          }
        />
        <Table.Column
          dataIndex="orders_customers.name"
          title="ФИО"
          render={(value: any, record: IOrders) => (
            <Button
              type="link"
              size="small"
              onClick={() => goToCustomer(record.orders_customers.id)}
            >
              {record.orders_customers.name}
            </Button>
          )}
        />
        <Table.Column
          dataIndex="orders_customers.phone"
          title="Телефон"
          render={(value: any, record: IOrders) => (
            <Button
              type="link"
              size="small"
              onClick={() => goToCustomer(record.orders_customers.id)}
            >
              {record.orders_customers.phone}
            </Button>
          )}
        />
        <Table.Column
          dataIndex="order_price"
          title="Цена"
          render={(value: any, record: IOrders) => (
            <span>
              {new Intl.NumberFormat("ru").format(record.order_price)} сум
            </span>
          )}
        />
        <Table.Column dataIndex="payment_type" title="Тип оплаты" />
        <Table.Column<IOrders>
          title="Actions"
          dataIndex="actions"
          render={(_text, record): React.ReactNode => {
            return (
              <Space>
                <EditButton size="small" recordItemId={record.id} hideText />
                <ShowButton size="small" recordItemId={record.id} hideText />
              </Space>
            );
          }}
        />
      </Table>
    </div>
  );
};

export default CustomerOrders;
