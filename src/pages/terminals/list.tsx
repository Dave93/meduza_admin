import {
  List,
  DateField,
  Table,
  useTable,
  Switch,
  Space,
  EditButton,
  ShowButton,
  Form,
  Select,
  Button,
} from "@pankod/refine-antd";
import { CrudFilters, HttpError, useGetIdentity } from "@pankod/refine-core";
import { client } from "graphConnect";
import { gql } from "graphql-request";

import { IOrganization, ITerminals } from "interfaces";
import { defaultDateTimeFormat } from "localConstants";
import { useEffect, useState } from "react";

export const TerminalsList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);

  const { tableProps, searchFormProps } = useTable<
    ITerminals,
    HttpError,
    { organization_id: string }
  >({
    initialSorter: [
      {
        field: "name",
        order: "asc",
      },
      {
        field: "organization_id",
        order: "asc",
      },
    ],
    metaData: {
      fields: [
        "id",
        "name",
        "active",
        "created_at",
        "organization_id",
        "phone",
        "latitude",
        "longitude",
        "external_id",
        {
          organization: ["id", "name"],
        },
      ],
      whereInputType: "terminalsWhereInput!",
      orderByInputType: "terminalsOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
    onSearch: async (params) => {
      const filters: CrudFilters = [];
      const { organization_id } = params;

      if (organization_id) {
        filters.push({
          field: "organization_id",
          operator: "eq",
          value: {
            equals: organization_id,
          },
        });
      }
      return filters;
    },
  });

  const loadOrganizations = async () => {
    const query = gql`
      query {
        cachedOrganizations {
          id
          name
        }
      }
    `;
    const { cachedOrganizations } = await client.request(
      query,
      {},
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );
    setOrganizations(cachedOrganizations);
  };

  const loadTerminals = async () => {
    const query = gql`
      mutation {
        loadTerminals
      }
    `;
    await client.request(
      query,
      {},
      {
        authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  return (
    <>
      <List
        title="???????????? ????????????????"
        headerButtons={({ defaultButtons }) => (
          <>
            {defaultButtons}
            <Button type="primary" onClick={loadTerminals}>
              ?????????????????? ??????????????
            </Button>
          </>
        )}
      >
        <Form layout="horizontal" {...searchFormProps}>
          <Form.Item name="organization_id" label="??????????????????????">
            <Select
              options={organizations.map((org) => ({
                label: org.name,
                value: org.id,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              ??????????????????????
            </Button>
          </Form.Item>
        </Form>
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="active"
            title="????????????????????"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column dataIndex="name" title="????????????????" />
          <Table.Column
            dataIndex="organization.name"
            title="??????????????????????"
            render={(value: any, record: ITerminals) =>
              record.organization.name
            }
          />
          <Table.Column dataIndex="phone" title="??????????????" />
          <Table.Column dataIndex="external_id" title="?????????????? ??????????????????????????" />
          <Table.Column dataIndex="latitude" title="????????????" />
          <Table.Column dataIndex="longitude" title="??????????????" />
          <Table.Column
            dataIndex="created_at"
            title="???????? ????????????????"
            render={(value) => (
              <DateField
                format={defaultDateTimeFormat}
                value={value}
                locales="ru"
              />
            )}
          />
          <Table.Column<ITerminals>
            title="????????????????"
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
