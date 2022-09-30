import { Button, Modal, Select, Tooltip } from "@pankod/refine-antd";
import { EditOutlined } from "@ant-design/icons";
import { FC, useState } from "react";
import { IUsers } from "interfaces";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { useGetIdentity } from "@pankod/refine-core";

interface ChangeOrderProps {
  id?: string;
  terminal_id?: string;
}

const { Option } = Select;

export const ChangeOrdersCouirer: FC<ChangeOrderProps> = ({
  id,
  terminal_id,
}) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [couriers, setCouriers] = useState<IUsers[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string>();

  const changeCourier = () => {
    setConfirmLoading(true);
    const query = gql`
      mutation changeOrderCourier($orderId: String!, $courierId: String!) {
        changeOrderCourier(orderId: $orderId, courierId: $courierId) {
          id
        }
      }
    `;
    client
      .request(
        query,
        {
          orderId: id,
          courierId: selectedCourier,
        },
        {
          Authorization: `Bearer ${identity?.token.accessToken}`,
        }
      )
      .then(() => {
        setIsModalOpen(false);
        setConfirmLoading(false);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const loadCouriers = async () => {
    const query = gql`
        query {
            getCouriersForOrder(terminalId: "${terminal_id}") {
                id
                first_name
                last_name
            }
        }
    `;
    const { getCouriersForOrder } = await client.request<{
      getCouriersForOrder: IUsers[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setCouriers(getCouriersForOrder);
  };

  const showModal = () => {
    setIsModalOpen(true);
    loadCouriers();
  };

  return (
    <>
      <Tooltip title="Изменить">
        <Button
          shape="circle"
          icon={<EditOutlined />}
          size="small"
          danger
          onClick={showModal}
        />
      </Tooltip>
      <Modal
        title="Изменить курьера"
        visible={isModalOpen}
        okText="Изменить"
        cancelText="Отмена"
        onOk={changeCourier}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Select
          showSearch
          placeholder="Выберите курьера"
          optionFilterProp="children"
          onChange={(value) => setSelectedCourier(value)}
          filterOption={(input, option) =>
            (option!.children as unknown as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {couriers.map((courier) => (
            <Option key={courier.id} value={courier.id}>
              {courier.first_name} {courier.last_name}
            </Option>
          ))}
        </Select>
      </Modal>
    </>
  );
};
