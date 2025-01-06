import PageTools from '@/components/page-tools';
import { PageAction } from '@/config';
import breakpoints from '@/config/breakpoints';
import { SyncOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useNavigate } from '@umijs/max';
import {
  Button,
  Col,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  message
} from 'antd';
import _ from 'lodash';
import ResizeObserver from 'rc-resize-observer';
import React, { useCallback, useEffect, useState } from 'react';
import { createModel, queryCatalogList } from './apis';
import CatalogItem from './components/catalog-item';
import CatalogSkelton from './components/catalog-skelton';
import DelopyBuiltInModal from './components/deploy-builtin-modal';
import { modelCategories, modelSourceMap } from './config';
import { CatalogItem as CatalogItemType, FormData } from './config/types';

const Catalog: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [span, setSpan] = React.useState(8);
  const [activeId, setActiveId] = React.useState(-1);
  const [isFirst, setIsFirst] = React.useState(true);
  const [dataSource, setDataSource] = useState<{
    dataList: CatalogItemType[];
    loading: boolean;
    total: number;
  }>({
    dataList: [],
    loading: false,
    total: 0
  });
  const [queryParams, setQueryParams] = useState({
    page: 1,
    perPage: 100,
    search: '',
    categories: []
  });
  const [openDeployModal, setOpenDeployModal] = useState<any>({
    show: false,
    width: 600,
    current: {},
    source: modelSourceMap.huggingface_value
  });
  const cacheData = React.useRef<CatalogItemType[]>([]);

  const categoryOptions = [...modelCategories.filter((item) => item.value)];

  const filterData = (data: { search: string; categories: string[] }) => {
    const { search, categories } = data;
    const dataList = cacheData.current.filter((item) => {
      if (search && categories.length > 0) {
        return (
          _.toLower(item.name).includes(search) &&
          categories.some((category) => item.categories.includes(category))
        );
      }
      if (search) {
        return _.toLower(item.name).includes(search);
      }
      if (categories.length > 0) {
        return categories.some((category) =>
          item.categories.includes(category)
        );
      }
      return true;
    });
    return dataList;
  };

  const fetchData = useCallback(async () => {
    setDataSource((pre) => {
      pre.loading = true;
      return { ...pre };
    });
    try {
      const params = {
        ..._.pick(queryParams, ['page', 'perPage'])
      };
      const res: any = await queryCatalogList(params);

      cacheData.current = res.items || [];
      setDataSource({
        dataList: res.items,
        loading: false,
        total: res.pagination.total
      });
    } catch (error) {
      cacheData.current = [];
      setDataSource({
        dataList: [],
        loading: false,
        total: dataSource.total
      });
      console.log('error', error);
    } finally {
      setIsFirst(false);
    }
  }, [queryParams]);

  const handleDeployModalCancel = () => {
    setOpenDeployModal({
      ...openDeployModal,
      show: false
    });
    setActiveId(-1);
  };

  const handleResize = useCallback(
    _.throttle((size: { width: number; height: number }) => {
      const { width } = size;
      if (width < breakpoints.xs) {
        setSpan(24);
      } else if (width < breakpoints.sm) {
        setSpan(24);
      } else if (width < breakpoints.md) {
        setSpan(12);
      } else if (width < breakpoints.lg) {
        setSpan(12);
      } else {
        setSpan(8);
      }
    }, 100),
    []
  );

  const handleOnDeploy = useCallback((item: CatalogItemType) => {
    setActiveId(item.id);
    setOpenDeployModal({
      show: true,
      source: modelSourceMap.huggingface_value,
      current: item,
      width: 600
    });
  }, []);

  const handleCreateModel = useCallback(
    async (data: FormData) => {
      try {
        console.log('data:', data, openDeployModal);

        const modelData = await createModel({
          data: {
            ..._.omit(data, ['size', 'quantization'])
          }
        });
        setOpenDeployModal({
          ...openDeployModal,
          show: false
        });
        message.success(intl.formatMessage({ id: 'common.message.success' }));
        navigate('/models/list');
      } catch (error) {}
    },
    [openDeployModal]
  );

  const handleOnPageChange = useCallback(
    (page: number, pageSize?: number) => {
      setQueryParams({
        ...queryParams,
        page,
        perPage: pageSize || 10
      });
    },
    [queryParams]
  );

  const handleSearch = (e: any) => {
    fetchData();
  };

  const handleNameChange = _.debounce((e: any) => {
    const dataList = filterData({
      search: e.target.value,
      categories: queryParams.categories
    });

    setQueryParams({
      ...queryParams,
      page: 1,
      search: e.target.value
    });

    setDataSource({
      dataList,
      loading: false,
      total: dataSource.total
    });
  }, 200);

  const handleCategoryChange = (value: any) => {
    const dataList = filterData({
      search: queryParams.search,
      categories: value
    });
    setQueryParams({
      ...queryParams,
      page: 1,
      categories: value
    });
    setDataSource({
      dataList,
      loading: false,
      total: dataSource.total
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageContainer
      ghost
      header={{
        title: intl.formatMessage({ id: 'menu.modelCatalog' }),
        breadcrumb: {}
      }}
      extra={[]}
    >
      <PageTools
        marginBottom={22}
        left={
          <Space>
            <Input
              placeholder={intl.formatMessage({ id: 'common.filter.name' })}
              style={{ width: 200 }}
              size="large"
              allowClear
              onClear={() =>
                handleNameChange({
                  target: {
                    value: ''
                  }
                })
              }
              onChange={handleNameChange}
            ></Input>
            <Select
              allowClear
              placeholder={intl.formatMessage({ id: 'models.filter.category' })}
              style={{ width: 240 }}
              size="large"
              mode="multiple"
              maxTagCount={1}
              onChange={handleCategoryChange}
              options={categoryOptions}
            ></Select>
            <Button
              type="text"
              style={{ color: 'var(--ant-color-text-tertiary)' }}
              icon={<SyncOutlined></SyncOutlined>}
              onClick={handleSearch}
            ></Button>
          </Space>
        }
      ></PageTools>
      <div className="relative" style={{ width: '100%' }}>
        <ResizeObserver onResize={handleResize}>
          <Row gutter={[16, 16]}>
            {dataSource.dataList.map((item: CatalogItemType, index) => {
              return (
                <Col span={span} key={item.id}>
                  <CatalogItem
                    onClick={handleOnDeploy}
                    activeId={activeId}
                    data={item}
                  ></CatalogItem>
                </Col>
              );
            })}
          </Row>
          {dataSource.loading && (
            <div
              style={{
                width: '100%',
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                top: 0,
                left: 0,
                height: 400,
                right: 0
              }}
            >
              <Spin
                spinning={dataSource.loading}
                style={{ width: '100%' }}
                wrapperClassName="skelton-wrapper"
              >
                {isFirst && <CatalogSkelton span={span}></CatalogSkelton>}
              </Spin>
            </div>
          )}
        </ResizeObserver>
      </div>
      <div style={{ marginBlock: '32px 16px' }}>
        <Pagination
          hideOnSinglePage={queryParams.perPage === 100}
          align="end"
          defaultCurrent={1}
          total={dataSource.total}
          pageSize={queryParams.perPage}
          showSizeChanger
          onChange={handleOnPageChange}
        />
      </div>
      <DelopyBuiltInModal
        open={openDeployModal.show}
        action={PageAction.CREATE}
        title={intl.formatMessage({ id: 'models.button.deploy' })}
        source={openDeployModal.source}
        width={openDeployModal.width}
        current={openDeployModal.current}
        onCancel={handleDeployModalCancel}
        onOk={handleCreateModel}
      ></DelopyBuiltInModal>
    </PageContainer>
  );
};

export default React.memo(Catalog);
