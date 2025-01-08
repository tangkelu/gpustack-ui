import AlertBlockInfo from '@/components/alert-info/block';
import ModalFooter from '@/components/modal-footer';
import { PageActionType } from '@/config/types';
import { createAxiosToken } from '@/hooks/use-chunk-request';
import { CloseOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Drawer } from 'antd';
import _ from 'lodash';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { queryCatalogItemSpec } from '../apis';
import {
  backendOptionsMap,
  modelCategoriesMap,
  modelSourceMap
} from '../config';
import { CatalogSpec, FormData, ListItem } from '../config/types';
import DataForm from './data-form';
import ScrollerWrapper from './scroller-wrapper';

type AddModalProps = {
  title: string;
  action: PageActionType;
  open: boolean;
  data?: ListItem;
  source: string;
  width?: string | number;
  current?: any;
  onOk: (values: FormData) => void;
  onCancel: () => void;
};

const backendOptions = [
  {
    label: `llama-box`,
    value: backendOptionsMap.llamaBox
  },
  {
    label: 'vLLM',
    value: backendOptionsMap.vllm
  },
  {
    label: 'vox-box',
    value: backendOptionsMap.voxBox
  }
];

const defaultQuant = ['Q4_K_M'];
const EmbeddingRerankFirstQuant = ['FP16'];
const AddModal: React.FC<AddModalProps> = (props) => {
  const {
    title,
    open,
    onOk,
    onCancel,
    source,
    action,
    current,
    width = 600
  } = props || {};

  const form = useRef<any>({});
  const intl = useIntl();

  const [modelSpec, setModelSpec] = useState<CatalogSpec>(null as any);
  const [isGGUF, setIsGGUF] = useState<boolean>(false);
  const [sourceList, setSourceList] = useState<any[]>([]);
  const [backendList, setBackendList] = useState<any[]>([]);
  const [sizeOptions, setSizeOptions] = useState<any[]>([]);
  const [quantizationOptions, setQuantizationOptions] = useState<any[]>([]);
  const sourceGroupMap = useRef<any>({});
  const axiosToken = useRef<any>(null);
  const selectSpecRef = useRef<CatalogSpec>({} as CatalogSpec);
  const sizeOptionsRef = useRef<any[]>([]);
  const quantizationOptionsRef = useRef<any[]>([]);
  const backendOptionsRef = useRef<any[]>([]);
  const modelSpecListRef = useRef<CatalogSpec[]>([]);
  const [specList, setSpecList] = useState<CatalogSpec[]>([]);

  const [sizeDataList, setSizeDataList] = useState<any[]>([]);
  const [quantizationDataList, setQuantizationDataList] = useState<any[]>([]);
  const [backendDataList, setBackendDataList] = useState<any[]>([]);

  const handleSumit = () => {
    form.current?.submit?.();
  };

  const setFinalList = ({
    sizeList,
    quantizationList,
    backendList,
    size,
    quantization,
    backend
  }: {
    sizeList: any[];
    quantizationList: any[];
    backendList: any[];
    size: number;
    quantization: string;
    backend: string;
  }) => {
    console.log('isCamptible===sizeDataList=', {
      size,
      quantization,
      backend
    });
    const sizeDataList = _.map(sizeList, (item: any) => {
      const isCamptible = _.find(
        modelSpecListRef.current,
        (spec: CatalogSpec) => {
          return (
            spec.size === item.value &&
            spec.quantization === quantization &&
            spec.backend === backend &&
            spec.compatibility
          );
        }
      );

      return {
        ...item,
        key: item.value,
        isCamptible: isCamptible,
        extra: isCamptible ? '' : 'May be not comptiable on your worker',
        label: isCamptible ? (
          item.label
        ) : (
          <span>
            <span>{item.label}</span>
            <span style={{ color: 'var(--ant-color-warning)' }}>
              {' '}
              (May be not comptiable on your worker)
            </span>
          </span>
        )
      };
    });

    const quantizationDataList = _.map(quantizationList, (item: any) => {
      const isCamptible = _.find(
        modelSpecListRef.current,
        (spec: CatalogSpec) => {
          return (
            spec.quantization === item.value &&
            spec.size === size &&
            spec.backend === backend &&
            spec.compatibility
          );
        }
      );
      console.log('isCamptible====', isCamptible);
      return {
        ...item,
        isCamptible: isCamptible,
        key: item.value,
        extra: isCamptible ? '' : 'May be not comptiable on your worker',
        label: isCamptible ? (
          item.label
        ) : (
          <span>
            <span>{item.label}</span>
            <span style={{ color: 'var(--ant-color-warning)' }}>
              {' '}
              (May be not comptiable on your worker)
            </span>
          </span>
        )
      };
    });

    const backendDataList = _.map(backendList, (item: any) => {
      const isCamptible = _.find(
        modelSpecListRef.current,
        (spec: CatalogSpec) => {
          return (
            spec.backend === item.value &&
            spec.size === size &&
            spec.quantization === quantization &&
            spec.compatibility
          );
        }
      );
      return {
        ...item,
        key: item.value,
        isCamptible: isCamptible,
        extra: isCamptible ? '' : 'May be not comptiable on your worker',
        label: isCamptible ? (
          item.label
        ) : (
          <span>
            <span>{item.label}</span>
            <span style={{ color: 'var(--ant-color-warning)' }}>
              {' '}
              (May be not comptiable on your worker)
            </span>
          </span>
        )
      };
    });

    setSizeDataList(_.uniqBy(sizeDataList, 'value'));
    setQuantizationDataList(_.uniqBy(quantizationDataList, 'value'));
    setBackendDataList(_.uniqBy(backendDataList, 'value'));
  };

  const generateSizeOptions = ({
    backend,
    quantization
  }: {
    backend: string;
    quantization: string;
  }) => {
    const list = _.filter(sizeOptionsRef.current, (item: any) => {
      return item.backend === backend && item.quantization === quantization;
    });
    setSizeOptions(list);
    return list;
  };

  const generateQuantizationOptions = ({
    backend,
    size
  }: {
    backend: string;
    size: number;
  }) => {
    const list = _.filter(quantizationOptionsRef.current, (item: any) => {
      return item.backend === backend && item.size === size;
    });
    const resultList = _.uniqBy(list, 'value');
    setQuantizationOptions(resultList);
    console.log('quantizaList====', resultList);
    return resultList;
  };

  const generateBackendOptions = ({
    size,
    quantization
  }: {
    size: number;
    quantization: string;
  }) => {
    const list = _.filter(backendOptionsRef.current, (item: any) => {
      return item.size === size;
    });
    const resultList = _.uniqBy(list, 'value');

    setBackendList(resultList);
    console.log('backend====', resultList);
    return resultList;
  };

  const getDefaultQuant = (data: { category: string; quantOption: string }) => {
    if (
      data.category === modelCategoriesMap.embedding ||
      data.category === modelCategoriesMap.reranker
    ) {
      return EmbeddingRerankFirstQuant.includes(data.quantOption);
    }
    return defaultQuant.includes(data.quantOption);
  };

  const getModelFile = (spec: CatalogSpec) => {
    let modelInfo = {};
    if (spec.source === modelSourceMap.huggingface_value) {
      modelInfo = {
        huggingface_repo_id: spec?.huggingface_repo_id,
        huggingface_filename: spec?.huggingface_filename
      };
    }

    if (spec.source === modelSourceMap.modelscope_value) {
      modelInfo = {
        model_scope_model_id: spec?.model_scope_model_id,
        model_scope_file_path: spec?.model_scope_file_path
      };
    }

    if (spec.source === modelSourceMap.ollama_library_value) {
      modelInfo = {
        ollama_library_model_name: spec?.ollama_library_model_name
      };
    }

    if (spec.source === modelSourceMap.local_path_value) {
      modelInfo = {
        local_path: spec?.local_path
      };
    }
    return modelInfo;
  };

  const findDefaultSpec = (
    data: {
      source: string;
      backend: string;
      size: number;
      quantization: string;
    },
    item: CatalogSpec
  ) => {
    if (data.size && data.quantization) {
      return (
        item.size === data.size &&
        item.backend === data.backend &&
        item.quantization === data.quantization
      );
    }
    if (data.size) {
      return item.size === data.size && item.backend === data.backend;
    }
    if (data.quantization) {
      return (
        item.quantization === data.quantization && item.backend === data.backend
      );
    }
    return item.backend === data.backend;
  };
  const getModelSpec = (data: {
    source: string;
    backend: string;
    size: number;
    quantization: string;
  }) => {
    const groupList = _.filter(
      modelSpecListRef.current,
      (item: CatalogSpec) => {
        return item.compatibility;
      }
    );
    let spec = _.find(groupList, (item: CatalogSpec) => {
      return findDefaultSpec(data, item);
    });

    if (!spec) {
      spec = _.find(modelSpecListRef.current, (item: CatalogSpec) => {
        return findDefaultSpec(data, item);
      });
    }

    selectSpecRef.current = spec;
    setModelSpec(spec);
    return {
      ..._.omit(spec, ['name']),
      categories: _.get(current, 'categories.0', null)
    };
  };

  const handlSpecChange = (value: string) => {
    const spec = _.find(specList, (item: any) => item.value === value);
    form.current.setFieldsValue({
      ...spec,
      categories: _.get(current, 'categories.0', null),
      name: _.toLower(current.name).replace(/\s/g, '-')
    });

    if (spec.backend === backendOptionsMap.vllm) {
      setIsGGUF(false);
    }

    if (spec.backend === backendOptionsMap.llamaBox) {
      setIsGGUF(true);
    }
  };

  const initFormDataBySource = (data: CatalogSpec) => {
    selectSpecRef.current = data;
    form.current?.setFieldsValue({
      ..._.omit(data, ['name']),
      categories: _.get(current, 'categories.0', null)
    });
  };

  const handleSetSizeOptions = (data: { source: string; backend: string }) => {
    const groupList = sourceGroupMap.current[source];
    const list = _.filter(groupList, (item: CatalogSpec) => item.size);
    const sizeGroup = _.groupBy(
      _.filter(list, (item: CatalogSpec) => {
        return item.backend === data.backend;
      }),
      'size'
    );

    const sizeList = _.keys(sizeGroup).map((size: string) => {
      return {
        label: `${size}B`,
        value: _.toNumber(size)
      };
    });
    setSizeOptions(sizeList);
    return sizeList;
  };

  const handleSetQuantizationOptions = (data: {
    source: string;
    size: number;
    backend: string;
  }) => {
    const groupList = sourceGroupMap.current[data.source];
    console.log('groupList====', data, groupList);
    const sizeGroup = _.filter(groupList, (item: CatalogSpec) => {
      return item.size === data.size && item.backend === data.backend;
    });

    const quantizationList = _.map(sizeGroup, (item: CatalogSpec) => {
      return {
        label: item.quantization,
        value: item.quantization
      };
    });
    setQuantizationOptions(quantizationList);
    return quantizationList;
  };

  const handleSetBackendOptions = (source: string) => {
    const groupList = sourceGroupMap.current[source];
    const backendGroup = _.groupBy(groupList, 'backend');

    const backendList = _.filter(backendOptions, (item: any) => {
      return backendGroup[item.value];
    });
    setBackendList(backendList);
    return backendList;
  };

  const handleSourceChange = (source: string) => {
    const defaultSpec = _.get(sourceGroupMap.current, `${source}.0`, {});
    console.log('source====', source, defaultSpec);
    initFormDataBySource(defaultSpec);
    handleSetSizeOptions({
      source: source,
      backend: defaultSpec.backend
    });
    handleSetQuantizationOptions({
      source: source,
      size: defaultSpec.size,
      backend: defaultSpec.backend
    });
    // set form value
    initFormDataBySource(defaultSpec);
  };

  const handleBackendChange = (backend: string) => {
    if (backend === backendOptionsMap.vllm) {
      setIsGGUF(false);
    }

    if (backend === backendOptionsMap.llamaBox) {
      setIsGGUF(true);
    }

    const quantizaList = generateQuantizationOptions({
      size: form.current.getFieldValue('size'),
      backend: backend
    });

    const data = getModelSpec({
      source: form.current.getFieldValue('source'),
      backend: backend,
      size: form.current.getFieldValue('size'),
      quantization:
        _.find(
          quantizaList,
          (item: any) =>
            item.value === form.current.getFieldValue('quantization')
        )?.value ||
        _.find(quantizaList, (item: { label: string; value: string }) =>
          getDefaultQuant({
            category: _.get(current, 'categories.0', ''),
            quantOption: item.value
          })
        )?.value ||
        _.get(quantizaList, '0.value', '')
    });
    console.log(
      'getModelSpec====',
      data,
      quantizaList,
      _.cloneDeep(quantizaList)
    );

    setFinalList({
      sizeList: sizeOptionsRef.current,
      quantizationList: quantizationOptionsRef.current,
      backendList: backendOptionsRef.current,
      size: data.size,
      quantization: data.quantization,
      backend: data.backend
    });
    form.current.setFieldsValue({
      ...data
    });
  };
  useEffect(() => {
    console.log('backendDataList====', backendDataList);
  }, [backendDataList]);

  const fetchSpecData = async () => {
    try {
      axiosToken.current?.cancel?.();
      axiosToken.current = createAxiosToken();
      const res: any = await queryCatalogItemSpec(
        {
          id: current.id
        },
        {
          token: axiosToken.current.token
        }
      );
      sizeOptionsRef.current = _.uniqBy(
        _.map(res.items || [], (item: CatalogSpec) => {
          return {
            value: item.size,
            label: `${item.size}B`,
            key: item.size,
            ..._.pick(item, [
              'source',
              'backend',
              'size',
              'quantization',
              'compatibility',
              'compatibility_message'
            ])
          };
        }).filter((item: any) => item.value),
        'value'
      );

      quantizationOptionsRef.current = _.map(
        res.items || [],
        (item: CatalogSpec) => {
          return {
            value: item.quantization,
            label: item.quantization,
            key: item.quantization,
            ..._.pick(item, [
              'source',
              'backend',
              'size',
              'quantization',
              'compatibility',
              'compatibility_message'
            ])
          };
        }
      );

      backendOptionsRef.current = _.map(
        res.items || [],
        (item: CatalogSpec) => {
          return {
            value: item.backend,
            label: item.backend,
            key: item.backend,
            ..._.pick(item, [
              'size',
              'source',
              'backend',
              'quantization',
              'compatibility',
              'compatibility_message'
            ])
          };
        }
      );

      modelSpecListRef.current = res.items || [];

      const list = _.filter(
        res.items,
        (item: CatalogSpec) => item.compatibility
      );

      let defaultSpec = _.find(list, (item: CatalogSpec) => {
        return getDefaultQuant({
          category: _.get(current, 'categories.0', ''),
          quantOption: item.quantization
        });
      });

      if (!defaultSpec) {
        defaultSpec = _.find(res.items, (item: CatalogSpec) => {
          return getDefaultQuant({
            category: _.get(current, 'categories.0', ''),
            quantOption: item.quantization
          });
        });
      }

      if (!defaultSpec) {
        defaultSpec = _.get(list, '0', {});
      }

      setSpecList(
        _.map(res.items, (item: CatalogSpec) => {
          return {
            ...item,
            sizeLable: `${item.size}B`,
            value: `${item.size}_${item.quantization}_${item.backend}`,
            label: `${item.size}B-${item.quantization}-${item.backend}`
          };
        })
      );

      initFormDataBySource(defaultSpec);
      form.current.setFieldValue(
        'name',
        _.toLower(current.name).replace(/\s/g, '-') || ''
      );
      console.log('setSizeOptions====', defaultSpec, sizeOptionsRef.current);
      // setSizeOptions(sizeOptionsRef.current);
      // generateBackendOptions({
      //   size: defaultSpec.size,
      //   quantization: defaultSpec.quantization
      // });
      // generateQuantizationOptions({
      //   backend: defaultSpec.backend,
      //   size: defaultSpec.size
      // });

      setFinalList({
        sizeList: sizeOptionsRef.current,
        quantizationList: quantizationOptionsRef.current,
        backendList: backendOptionsRef.current,
        size: defaultSpec.size,
        quantization: defaultSpec.quantization,
        backend: defaultSpec.backend
      });
      if (defaultSpec.backend === backendOptionsMap.vllm) {
        setIsGGUF(false);
      }

      if (defaultSpec.backend === backendOptionsMap.llamaBox) {
        setIsGGUF(true);
      }
    } catch (error) {
      // ignore
    }
  };

  // quantization change
  const handleOnQuantizationChange = (val: string) => {
    const backendList = generateBackendOptions({
      size: form.current.getFieldValue('size'),
      quantization: val
    });

    const data = getModelSpec({
      source: form.current.getFieldValue('source'),
      backend:
        _.find(
          backendList,
          (item: any) => item.value === form.current.getFieldValue('backend')
        )?.value || _.get(backendList, '0.value', ''),
      size: form.current.getFieldValue('size'),
      quantization: val
    });

    setFinalList({
      sizeList: sizeOptionsRef.current,
      quantizationList: quantizationOptionsRef.current,
      backendList: backendOptionsRef.current,
      size: data.size,
      quantization: data.quantization,
      backend: data.backend
    });
    form.current.setFieldsValue({
      ...data
    });
  };

  // size change
  const handleOnSizeChange = (val: number) => {
    const backendList = generateBackendOptions({
      size: val,
      quantization: form.current.getFieldValue('quantization')
    });

    const quantList = generateQuantizationOptions({
      backend: form.current.getFieldValue('backend'),
      size: val
    });

    const data = getModelSpec({
      source: form.current.getFieldValue('source'),
      backend:
        _.find(
          backendList,
          (item: any) => item.value === form.current.getFieldValue('backend')
        )?.value || _.get(backendList, '0.value', ''),
      size: val,
      quantization:
        _.find(
          quantList,
          (item: any) =>
            item.value === form.current.getFieldValue('quantization')
        )?.value ||
        _.find(quantList, (item: { label: string; value: string }) =>
          getDefaultQuant({
            category: _.get(current, 'categories.0', ''),
            quantOption: item.value
          })
        )?.value ||
        _.get(quantList, '0.value', '')
    });

    // set form data
    setFinalList({
      sizeList: sizeOptionsRef.current,
      quantizationList: quantizationOptionsRef.current,
      backendList: backendOptionsRef.current,
      size: data.size,
      quantization: data.quantization,
      backend: data.backend
    });
    form.current.setFieldsValue({
      ...data
    });
  };

  const handleOk = (values: FormData) => {
    onOk({
      ...values,
      ...getModelFile(selectSpecRef.current),
      source: _.get(selectSpecRef.current, 'source', '')
    });
  };

  const handleCancel = useCallback(() => {
    onCancel?.();
    axiosToken.current?.cancel?.();
  }, [onCancel]);

  useEffect(() => {
    if (open) {
      fetchSpecData();
    } else {
      setModelSpec(null as any);
      setSizeDataList([]);
      setQuantizationDataList([]);
      setBackendDataList([]);
    }
    return () => {
      axiosToken.current?.cancel?.();
    };
  }, [open, current]);

  return (
    <Drawer
      title={
        <div className="flex-between flex-center">
          <span
            style={{
              color: 'var(--ant-color-text)',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--font-size-middle)'
            }}
          >
            {title}
          </span>
          <Button type="text" size="small" onClick={handleCancel}>
            <CloseOutlined></CloseOutlined>
          </Button>
        </div>
      }
      open={open}
      onClose={handleCancel}
      destroyOnClose={true}
      closeIcon={false}
      maskClosable={false}
      keyboard={false}
      styles={{
        body: {
          height: 'calc(100vh - 57px)',
          padding: '16px 0',
          overflowX: 'hidden'
        },
        content: {
          borderRadius: '6px 0 0 6px'
        }
      }}
      width={width}
      footer={false}
    >
      <div style={{ display: 'flex', height: '100%' }}>
        <ScrollerWrapper
          footer={
            <div>
              {modelSpec && !modelSpec.compatibility && (
                <div style={{ paddingInline: 16, paddingTop: 16 }}>
                  <AlertBlockInfo
                    rows={3}
                    style={{ textAlign: 'left' }}
                    title="Compatibility Warning"
                    message={modelSpec.compatibility_message || ''}
                    type="warning"
                  ></AlertBlockInfo>
                </div>
              )}
              <ModalFooter
                onCancel={handleCancel}
                onOk={handleSumit}
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              ></ModalFooter>
            </div>
          }
        >
          <>
            <DataForm
              fields={[]}
              source={source}
              action={action}
              selectedModel={{}}
              onOk={handleOk}
              ref={form}
              isGGUF={isGGUF}
              specList={specList}
              byBuiltIn={true}
              sourceDisable={false}
              backendOptions={backendDataList}
              sourceList={sourceList}
              quantizationOptions={quantizationDataList}
              sizeOptions={sizeDataList}
              onSpecChange={handlSpecChange}
              onBackendChange={handleBackendChange}
              onSourceChange={handleSourceChange}
              onQuantizationChange={handleOnQuantizationChange}
              onSizeChange={handleOnSizeChange}
            ></DataForm>
          </>
        </ScrollerWrapper>
      </div>
    </Drawer>
  );
};

export default memo(AddModal);
