import {
  List,
  Table,
  useTable,
  Space,
  ShowButton,
  Button,
  Form,
  Select,
  Col,
  Row,
  DatePicker,
  Tag,
  EditButton,
} from "@pankod/refine-antd";
import {
  CrudFilters,
  HttpError,
  useGetIdentity,
  useNavigation,
} from "@pankod/refine-core";
import { client } from "graphConnect";
import { gql } from "graphql-request";

import { IOrders, IOrderStatus, ITerminals } from "interfaces";
import { chain } from "lodash";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";

var weekday = require("dayjs/plugin/weekday");
dayjs.locale("ru");
dayjs.extend(weekday);
dayjs.extend(duration);

const { RangePicker } = DatePicker;

export const OrdersList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);

  const { show } = useNavigation();

  const { tableProps, searchFormProps } = useTable<
    IOrders,
    HttpError,
    {
      organization_id: string;
      created_at: [dayjs.Dayjs, dayjs.Dayjs];
      terminal_id: string;
      order_status_id: string;
    }
  >({
    initialSorter: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
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
          orders_couriers: ["id", "first_name", "last_name"],
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
        field: "created_at",
        operator: "gte",
        value: dayjs().startOf("d").toDate(),
      },
      {
        field: "created_at",
        operator: "lte",
        value: dayjs().endOf("d").toDate(),
      },
    ],
    onSearch: async (params) => {
      const filters: CrudFilters = [];
      const { created_at } = params;

      filters.push(
        {
          field: "created_at",
          operator: "gte",
          value: created_at ? created_at[0].toISOString() : undefined,
        },
        {
          field: "created_at",
          operator: "lte",
          value: created_at ? created_at[1].toISOString() : undefined,
        }
      );

      return filters;
    },
  });

  const getAllFilterData = async () => {
    const query = gql`
      query {
        cachedOrderStatuses {
          id
          name
          color
        }
      }
    `;
    const { cachedOrderStatuses } = await client.request<{
      cachedOrderStatuses: IOrderStatus[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setOrderStatuses(cachedOrderStatuses);
  };

  const goToCustomer = (id: string) => {
    show(`customers`, id);
  };

  const goToCourier = (id: string) => {
    show(`users`, id);
  };

  useEffect(() => {
    getAllFilterData();
  }, []);
  return (
    <>
      <List title="Список заказов">
        <Form
          layout="horizontal"
          {...searchFormProps}
          initialValues={{
            created_at: [dayjs().startOf("d"), dayjs().endOf("d")],
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Дата заказа" name="created_at">
                <RangePicker format={"DD.MM.YYYY"} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="order_status_id" label="Статус">
                <Select showSearch optionFilterProp="children" allowClear>
                  {orderStatuses.map((terminal: any) => (
                    <Select.Option key={terminal.id} value={terminal.id}>
                      {terminal.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              Фильтровать
            </Button>
          </Form.Item>
        </Form>
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
            dataIndex="orders_couriers.first_name"
            title="Курьер"
            render={(value: any, record: IOrders) =>
              record.orders_couriers ? (
                <Button
                  type="link"
                  size="small"
                  onClick={() => goToCourier(record.orders_couriers.id)}
                >
                  {`${record.orders_couriers.first_name} ${record.orders_couriers.last_name}`}
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
      </List>
    </>
  );
};
