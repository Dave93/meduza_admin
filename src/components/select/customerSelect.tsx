import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  useForm,
} from "@pankod/refine-antd";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd/es/select";
import { client } from "graphConnect";
import { gql } from "graphql-request";
import { ICustomers } from "interfaces";
import debounce from "lodash/debounce";
import React, { useMemo, useRef, useState, FC } from "react";

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, "options" | "children"> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

function DebounceSelect<
  ValueType extends {
    key?: string;
    label: React.ReactNode;
    value: string | number;
  } = any
>({
  fetchOptions,
  debounceTimeout = 800,
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);
  const { formProps, form } = useForm<ICustomers>();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const createCustomer = async (values: any) => {
    console.log(values);

    if (values.type === "click") {
      values = await form.getFieldsValue();
    }

    if (!values.name && !values.phone) {
      return;
    }
    setConfirmLoading(true);
    const query = gql`
      mutation createCustomer($data: customersUncheckedCreateInput!) {
        customerCreate(data: $data) {
          id
          name
          phone
        }
      }
    `;
    const { createCustomer } = await client.request<{
      createCustomer: ICustomers;
    }>(query, {
      data: {
        name: values.name,
        phone: values.phone,
      },
    });
    setConfirmLoading(false);
    setOpen(false);
    return createCustomer;
  };

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const onOpenModal = () => {
    setOpen(true);
  };

  return (
    <>
      <Select
        showSearch
        filterOption={false}
        onSearch={debounceFetcher}
        notFoundContent={
          fetching ? (
            <Spin size="small" />
          ) : (
            <span>
              <CreateCustomerForm onOpenModal={onOpenModal} />
            </span>
          )
        }
        {...props}
        options={options}
      />
      <Modal
        title="Добавить клиента"
        visible={open}
        onOk={createCustomer}
        confirmLoading={confirmLoading}
        onCancel={() => setOpen(false)}
      >
        <Form {...formProps} layout="vertical" onFinish={createCustomer}>
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
          <Form.Item
            label="Телефон"
            name="phone"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

interface ICreateCustomerForm {
  onOpenModal: () => void;
}

export const CreateCustomerForm: FC<ICreateCustomerForm> = ({
  onOpenModal,
}) => {
  return (
    <div>
      <Alert message="Клиент не найден. Добавьте его ниже" type="warning" />
      <Row>
        <Col span={8} offset={8}>
          <Button type="primary" onClick={() => onOpenModal()}>
            Добавить
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default DebounceSelect;
