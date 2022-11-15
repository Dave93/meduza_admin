import {
  Col,
  Edit,
  Form,
  Input,
  InputNumber,
  Row,
  Switch,
  useForm,
} from "@pankod/refine-antd";
import { useGetIdentity } from "@pankod/refine-core";

import { ICouriers, IOrderStatus, IOrganization } from "interfaces";
import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { Colorpicker } from "antd-colorpicker";

export const CouriersEdit: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps, id } = useForm<ICouriers>({
    metaData: {
      fields: ["id", "name", "active", "phone"],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Редактировать курьера">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Активность"
              name="active"
              rules={[
                {
                  required: true,
                },
              ]}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item
              label="Имя"
              name="name"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Тeлефон" name="phone">
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Пароль" name="password">
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
