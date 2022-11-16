import {
  Button,
  Calendar,
  Col,
  Create,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  useForm,
  Table,
} from "@pankod/refine-antd";
import { useGetIdentity, useTranslate } from "@pankod/refine-core";
import type { ColumnsType } from "antd/es/table";

import {
  ICustomers,
  IOrderDateTime,
  IOrderItems,
  IOrderStatus,
  IOrganization,
} from "interfaces";
import { Colorpicker } from "antd-colorpicker";
import { useEffect, useMemo, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import DebounceSelect from "components/select/customerSelect";
import dayjs from "dayjs";
import LocationSelectorInput from "components/location_selector";

export const OrdersCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [times, setTimes] = useState<IOrderDateTime[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const { formProps, saveButtonProps, form } = useForm<IOrderStatus>({
    metaData: {
      fields: [
        "id",
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
      pluralize: true,
      operation: "createNewOrder",
      variableType: "CreateOrderInput",
    },
  });

  const loadTimesToDate = async () => {
    const query = gql`
      query {
        getTimesForDate(date: "${dayjs().format("YYYY-MM-DD")}") {
          value
        }
      }
    `;
    const { getTimesForDate } = await client.request<{
      getTimesForDate: IOrderDateTime[];
    }>(query);
    setTimes(getTimesForDate);
  };

  const fetchCustomer = async (queryText: string) => {
    const query = gql`
        query {
          customers(where: {
            OR: [{
              name: {
                contains: "${queryText}",
                mode: insensitive
              }
            }, {
              phone: {
                contains: "${queryText}",
                mode: insensitive
              }
            }]
          }) {
            id
            name
            phone
          }
        }
    `;
    const { customers } = await client.request<{
      customers: ICustomers[];
    }>(
      query,
      {},
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );

    return customers.map((customer) => ({
      key: customer.id,
      value: customer.id,
      label: `${customer.name} (${customer.phone})`,
    }));
  };

  const onPanelChange = (value: any) => {
    setSelectedDate(value.format("YYYY-MM-DD"));
  };

  const selectTime = (value: string) => {
    setSelectedTime(value);
    console.log(`${selectedDate} ${value}`);
    let currentSelectedDate = dayjs(`${selectedDate} ${value}`);
    console.log(currentSelectedDate.toISOString());
    form.setFieldsValue({ delivery_time: currentSelectedDate.toDate() });
  };

  const onSelectAddress = (delivery_address: string) => {
    form.setFieldsValue({ delivery_address });
  };

  const columns: ColumnsType<IOrderItems> = [
    {
      title: "Наименование",
      dataIndex: "product_id",
    },
    {
      title: "Цена",
      dataIndex: "price",
    },
    {
      title: "Кол-во",
      dataIndex: "quantity",
    },
    {
      title: "Сумма",
      dataIndex: "total_price",
    },
  ];

  const selectedProducts = useMemo(() => {
    return [];
  }, []);

  useEffect(() => {
    loadTimesToDate();
  }, []);

  return (
    <Create saveButtonProps={saveButtonProps} title="Добавить заказ">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Клиент"
              name="customer_id"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DebounceSelect
                fetchOptions={fetchCustomer}
                showSearch
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="День мойки"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Calendar
                fullscreen={false}
                onPanelChange={onPanelChange}
                mode="month"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Время мойки"
              name="delivery_time"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Space>
                {times.map((time) => (
                  <Button
                    key={time.value}
                    size="small"
                    type={selectedTime === time.value ? "primary" : "default"}
                    onClick={() => selectTime(time.value)}
                  >
                    {time.value}
                  </Button>
                ))}
              </Space>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Локация"
              name="location"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              {/* @ts-ignore */}
              <LocationSelectorInput onSetAddress={onSelectAddress} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Адрес"
              name="delivery_address"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Способ оплаты"
              name="payment_type"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select>
                <Select.Option value="cash">Наличными</Select.Option>
                <Select.Option value="card">Картой</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Divider orientation="left">Состав заказа</Divider>
        <Table
          columns={columns}
          dataSource={selectedProducts}
          pagination={false}
          bordered
        />
      </Form>
    </Create>
  );
};
