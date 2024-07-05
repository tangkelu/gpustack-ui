import ModalFooter from '@/components/modal-footer';
import SealAutoComplete from '@/components/seal-form/auto-complete';
import SealInput from '@/components/seal-form/seal-input';
import SealSelect from '@/components/seal-form/seal-select';
import { PageAction } from '@/config';
import { PageActionType } from '@/config/types';
import { convertFileSize } from '@/utils';
import { SearchOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Form, Input, Modal } from 'antd';
import _ from 'lodash';
import { memo, useEffect, useState } from 'react';
import {
  callHuggingfaceQuickSearch,
  queryHuggingfaceModelFiles
} from '../apis';
import { ollamaModelOptions } from '../config';
import { FormData, ListItem } from '../config/types';

type AddModalProps = {
  title: string;
  action: PageActionType;
  open: boolean;
  data?: ListItem;
  onOk: (values: FormData) => void;
  onCancel: () => void;
};

const sourceOptions = [
  { label: 'Hugging Face', value: 'huggingface', key: 'huggingface' },
  { label: 'Ollama Library', value: 'ollama_library', key: 'ollama_library' }
];

const AddModal: React.FC<AddModalProps> = (props) => {
  console.log('addmodel====');
  const { title, action, open, onOk, onCancel } = props || {};
  const [form] = Form.useForm();
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const modelSource = Form.useWatch('source', form);
  const [repoOptions, setRepoOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [fileOptions, setFileOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const initFormValue = () => {
    if (action === PageAction.CREATE && open) {
      form.setFieldsValue({
        source: 'huggingface',
        replicas: 1
      });
    }
    if (action === PageAction.EDIT && open) {
      form.setFieldsValue({
        ...props.data
      });
    }
  };

  useEffect(() => {
    initFormValue();
  }, [open]);

  const handleInputRepoChange = (value: string) => {};

  const fileNamLabel = (item: any) => {
    return (
      <span>
        {item.path}
        <span
          style={{ color: 'var(--ant-color-text-tertiary)', marginLeft: '4px' }}
        >
          ({convertFileSize(item.size)})
        </span>
      </span>
    );
  };
  const handleFetchModelFiles = async (repo: string) => {
    try {
      setLoading(true);
      const res = await queryHuggingfaceModelFiles({ repo });
      const list = _.filter(res, (file: any) => {
        return _.endsWith(file.path, '.gguf');
      }).map((item: any) => {
        return {
          label: fileNamLabel(item),
          value: item.path,
          size: item.size
        };
      });
      setFileOptions(list);
      setLoading(false);
    } catch (error) {
      setFileOptions([]);
      setLoading(false);
    }
  };

  const handleRepoOnBlur = (e: any) => {
    const repo = form.getFieldValue('huggingface_repo_id');
    handleFetchModelFiles(repo);
  };

  const handleOnSearchRepo = async (text: string) => {
    try {
      const params = {
        q: `${text}`,
        type: 'model'
      };
      const res = await callHuggingfaceQuickSearch(params);
      const list = _.map(res.models || [], (item: any) => {
        return {
          value: item.id,
          label: item.id
        };
      });
      setRepoOptions(list);
    } catch (error) {
      setRepoOptions([]);
    }
  };

  const debounceSearch = _.debounce((text: string) => {
    handleOnSearchRepo(text);
  }, 300);

  const renderHuggingfaceFields = () => {
    return (
      <>
        <Form.Item<FormData>
          name="huggingface_repo_id"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.input'
                },
                { name: intl.formatMessage({ id: 'models.form.repoid' }) }
              )
            }
          ]}
        >
          <SealAutoComplete
            label={intl.formatMessage({ id: 'models.form.repoid' })}
            required
            showSearch
            onBlur={handleRepoOnBlur}
            onSelect={handleRepoOnBlur}
            onChange={handleInputRepoChange}
            onSearch={debounceSearch}
            options={repoOptions}
            disabled={action === PageAction.EDIT}
            addAfter={
              <span style={{ position: 'relative', top: '2px' }}>
                <SearchOutlined></SearchOutlined>
              </span>
            }
            description={intl.formatMessage({ id: 'models.form.repoid.desc' })}
          >
            <Input></Input>
          </SealAutoComplete>
        </Form.Item>
        <Form.Item<FormData>
          name="huggingface_filename"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.input'
                },
                { name: intl.formatMessage({ id: 'models.form.filename' }) }
              )
            }
          ]}
        >
          <SealAutoComplete
            filterOption
            label={intl.formatMessage({ id: 'models.form.filename' })}
            required
            options={fileOptions}
            loading={loading}
            onFocus={handleRepoOnBlur}
            disabled={action === PageAction.EDIT}
          ></SealAutoComplete>
        </Form.Item>
      </>
    );
  };

  const renderS3Fields = () => {
    return (
      <>
        <Form.Item<FormData>
          name="s3_address"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.input'
                },
                { name: intl.formatMessage({ id: 'models.form.s3address' }) }
              )
            }
          ]}
        >
          <SealInput.Input
            label={intl.formatMessage({
              id: 'models.form.s3address'
            })}
            required
          ></SealInput.Input>
        </Form.Item>
      </>
    );
  };

  const renderOllamaModelFields = () => {
    return (
      <>
        <Form.Item<FormData>
          name="ollama_library_model_name"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.input'
                },
                { name: intl.formatMessage({ id: 'models.table.name' }) }
              )
            }
          ]}
        >
          <SealAutoComplete
            filterOption
            disabled={action === PageAction.EDIT}
            label={intl.formatMessage({ id: 'model.form.ollama.model' })}
            placeholder={intl.formatMessage({ id: 'model.form.ollamaholder' })}
            required
            options={ollamaModelOptions}
          ></SealAutoComplete>
        </Form.Item>
      </>
    );
  };

  const renderFieldsBySource = () => {
    switch (modelSource) {
      case 'huggingface':
        return renderHuggingfaceFields();
      case 'ollama_library':
        return renderOllamaModelFields();
      case 's3':
        return renderS3Fields();
      default:
        return null;
    }
  };

  const handleSourceChange = (value: string) => {
    console.log('source change', value);
  };
  const handleSumit = () => {
    form.submit();
  };
  const handleOnFinish = (values: FormData) => {
    console.log('onFinish', values);
    onOk(values);
  };
  return (
    <Modal
      title={title}
      open={open}
      onOk={handleSumit}
      onCancel={onCancel}
      destroyOnClose={true}
      closeIcon={false}
      maskClosable={false}
      keyboard={false}
      width={600}
      styles={{}}
      footer={
        <ModalFooter onCancel={onCancel} onOk={handleSumit}></ModalFooter>
      }
    >
      <Form name="addModalForm" form={form} onFinish={onOk} preserve={false}>
        <Form.Item<FormData>
          name="name"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.input'
                },
                { name: intl.formatMessage({ id: 'common.table.name' }) }
              )
            }
          ]}
        >
          <SealInput.Input
            label={intl.formatMessage({
              id: 'common.table.name'
            })}
            required
          ></SealInput.Input>
        </Form.Item>
        <Form.Item<FormData>
          name="source"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.select'
                },
                { name: intl.formatMessage({ id: 'models.form.source' }) }
              )
            }
          ]}
        >
          <SealSelect
            disabled={action === PageAction.EDIT}
            label={intl.formatMessage({
              id: 'models.form.source'
            })}
            options={sourceOptions}
            required
            onChange={handleSourceChange}
          ></SealSelect>
        </Form.Item>
        {renderFieldsBySource()}
        <Form.Item<FormData>
          name="replicas"
          rules={[
            {
              required: true,
              message: intl.formatMessage(
                {
                  id: 'common.form.rule.input'
                },
                { name: intl.formatMessage({ id: 'models.form.replicas' }) }
              )
            }
          ]}
        >
          <SealInput.Number
            style={{ width: '100%' }}
            label={intl.formatMessage({
              id: 'models.form.replicas'
            })}
            required
            min={0}
          ></SealInput.Number>
        </Form.Item>
        <Form.Item<FormData> name="description">
          <SealInput.TextArea
            label={intl.formatMessage({
              id: 'common.table.description'
            })}
          ></SealInput.TextArea>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default memo(AddModal);
