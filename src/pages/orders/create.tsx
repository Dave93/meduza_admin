import {
  Calendar,
  Col,
  Create,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  useForm,
} from "@pankod/refine-antd";
import { useGetIdentity, useTranslate } from "@pankod/refine-core";

import { ICustomers, IOrderStatus, IOrganization } from "interfaces";
import { Colorpicker } from "antd-colorpicker";
import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import DebounceSelect from "components/select/customerSelect";
import dayjs from "dayjs";

export const OrdersCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IOrderStatus>({
    metaData: {
      fields: [
        "id",
        "delivery_type",
        "created_at",
        "order_price",
        "order_number",
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
    },
  });

  const [organizations, setOrganizations] = useState<IOrganization[]>([]);

  const fetchOrganizations = async () => {
    const query = gql`
      query {
        cachedOrganizations {
          id
          name
        }
      }
    `;

    const { cachedOrganizations } = await client.request<{
      cachedOrganizations: IOrganization[];
    }>(query);
    setOrganizations(cachedOrganizations);
  };

  const fetchCustomer = async (queryText: string) => {
    const query = gql`
        query {
          customers(where: {
            OR: [{
              name: {
                contains: "${queryText}"
              }
            }, {
              phone: {
                contains: "${queryText}"
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

  const onPanelChange = (value: dayjs.Dayjs) => {
    console.log(value.format("YYYY-MM-DD"));
  };

  useEffect(() => {
    fetchOrganizations();
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
          <Col span={12}>
            <Form.Item
              label="Организация"
              name="organization_id"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select showSearch optionFilterProp="children">
                {organizations.map((organization) => (
                  <Select.Option key={organization.id} value={organization.id}>
                    {organization.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="День доставки"
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
              label="Время доставки"
              name="delivery_time"
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
          <Col span={4}>
            <Form.Item
              label="Сортировка"
              name="sort"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Цвет" name="color">
              <Colorpicker popup />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Завершающий"
              name="finish"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Отменяющий" name="cancel" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Ожидающий" name="waiting" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
