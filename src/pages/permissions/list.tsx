import {
  List,
  DateField,
  Table,
  useTable,
  Switch,
  Space,
  EditButton,
  useDrawerForm,
  Drawer,
  Edit,
  Form,
  Input,
} from "@pankod/refine-antd";

import { IPermissions } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";

export const PermissionsList: React.FC = () => {
  const {
    drawerProps,
    formProps,
    show,
    saveButtonProps,
    deleteButtonProps,
    id,
  } = useDrawerForm<IPermissions>({
    action: "edit",
    metaData: {
      fields: ["id", "slug", "active", "created_at", "description"],
      pluralize: true,
    },
  });

  const { tableProps } = useTable<IPermissions>({
    initialSorter: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    metaData: {
      fields: ["id", "slug", "active", "created_at"],
      whereInputType: "permissionsWhereInput!",
      orderByInputType: "permissionsOrderByWithRelationInput!",
    },
  });
  return (
    <>
      <List title="Список разрешений">
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="active"
            title="Активность"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column dataIndex="slug" title="Код" />
          <Table.Column
            dataIndex="created_at"
            title="Дата создания"
            render={(value) => (
              <DateField
                format={defaultDateTimeFormat}
                value={value}
                locales="ru"
              />
            )}
          />
          <Table.Column<IPermissions>
            title="Действия"
            dataIndex="actions"
            render={(_text, record): React.ReactNode => {
              return (
                <Space>
                  <EditButton
                    size="small"
                    recordItemId={record.id}
                    onClick={() => show(record.id)}
                  />
                </Space>
              );
            }}
          />
        </Table>
      </List>
      <Drawer {...drawerProps}>
        <Edit
          saveButtonProps={saveButtonProps}
          deleteButtonProps={deleteButtonProps}
          recordItemId={id}
          title="Редактирование разрешения"
        >
          <Form {...formProps} layout="vertical">
            <Form.Item
              label="Активность"
              name="active"
              valuePropName="checked"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Код"
              name="slug"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Описание"
              name="description"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Edit>
      </Drawer>
    </>
  );
};