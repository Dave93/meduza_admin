import {
  Card,
  Form,
  Input,
  Layout,
  PageHeader,
  Space,
  Spin,
  Table,
  TimePicker,
  useTable,
  Button,
} from "@pankod/refine-antd";
import { useGetIdentity } from "@pankod/refine-core";
import dayjs from "dayjs";
import * as gql from "gql-query-builder";
import { client } from "graphConnect";
import { ISystemConfigs } from "interfaces";
import moment from "moment";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

export const SystemConfigsList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    console.log(data);
    setIsLoading(true);
    let formData = [];
    for (const key in data) {
      if (typeof data[key].toISOString !== "undefined") {
        formData.push({
          name: key,
          value: data[key].toISOString(),
        });
      } else {
        formData.push({
          name: key,
          value: data[key],
        });
      }
    }

    console.log(formData);
    const { query, variables } = gql.mutation({
      operation: "createSystemConfig",
      variables: {
        data: {
          value: { items: formData },
          type: "CreateSystemConfigInput",
          required: true,
        },
      },
      fields: ["name", "value"],
    });
    const response = await client.request(query, variables, {
      Authorization: `Bearer ${identity?.token.accessToken}`,
    });

    setIsLoading(false);
  };

  return (
    <div>
      <PageHeader title="Системные настройки" ghost={false}>
        <Spin spinning={isLoading}>
          <Form onFinish={handleSubmit(onSubmit)}>
            <Card
              bordered={false}
              actions={[
                <Space key="save-btn">
                  <Button type="primary" htmlType="submit">
                    Сохранить
                  </Button>
                </Space>,
              ]}
            >
              <Form.Item
                label="Время начала заказа"
                rules={[
                  { required: true, message: "Обязательно для заполнения" },
                ]}
              >
                <Controller
                  name="order_start_time"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TimePicker format="HH:mm" {...field} />
                  )}
                />
              </Form.Item>
            </Card>
          </Form>
        </Spin>
      </PageHeader>
    </div>
  );
};
