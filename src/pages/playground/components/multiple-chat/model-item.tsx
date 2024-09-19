import IconFont from '@/components/icon-font';
import { fetchChunkedData, readStreamData } from '@/utils/fetch-chunk-data';
import {
  ClearOutlined,
  CloseOutlined,
  MoreOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Checkbox, Dropdown, Popover, Select, Spin } from 'antd';
import _ from 'lodash';
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { CHAT_API } from '../../apis';
import { Roles } from '../../config';
import CompareContext from '../../config/compare-context';
import { MessageItem, ModelSelectionItem } from '../../config/types';
import '../../style/model-item.less';
import ParamsSettings from '../params-settings';
import ReferenceParams from '../reference-params';
import ViewCodeModal from '../view-code-modal';
import MessageContent from './message-content';
import SystemMessage from './system-message';

interface ModelItemProps {
  model: string;
  modelList: ModelSelectionItem[];
  instanceId: symbol;
  ref: any;
}

const ModelItem: React.FC<ModelItemProps> = forwardRef(
  ({ model, modelList, instanceId }, ref) => {
    const {
      spans,
      globalParams,
      setGlobalParams,
      setLoadingStatus,
      handleDeleteModel,
      loadingStatus
    } = useContext(CompareContext);
    const intl = useIntl();
    const isApplyToAllModels = useRef(false);
    const [systemMessage, setSystemMessage] = useState<string>('');
    const [params, setParams] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const messageId = useRef<number>(0);
    const [messageList, setMessageList] = useState<MessageItem[]>([]);
    const [tokenResult, setTokenResult] = useState<any>(null);
    const [show, setShow] = useState(false);
    const contentRef = useRef<any>('');
    const controllerRef = useRef<any>(null);
    const currentMessageRef = useRef<MessageItem>({} as MessageItem);

    const setMessageId = () => {
      messageId.current = messageId.current + 1;
    };
    const maxHeight = useMemo(() => {
      console.log('spans==========', spans);
      const total = 72 + 110 + 46 + 16 + 32;
      if (spans.count < 4) {
        return `calc(100vh - ${total}px)`;
      }
      return `calc(100vh - ${total * 2 + 16}px)`;
    }, [spans.count]);

    const abortFetch = () => {
      controllerRef.current?.abort?.();
      setLoadingStatus(instanceId, false);
    };

    const joinMessage = (chunk: any) => {
      if (!chunk) {
        return;
      }
      if (_.get(chunk, 'choices.0.finish_reason')) {
        setTokenResult({
          ...chunk?.usage
        });
        return;
      }
      contentRef.current =
        contentRef.current + _.get(chunk, 'choices.0.delta.content', '');
      console.log('currentMessage==========5', messageList);
      setMessageList([
        ...messageList,
        {
          role: Roles.Assistant,
          content: contentRef.current,
          uid: messageId.current
        }
      ]);
    };

    const submitMessage = async (currentParams: {
      parameters: Record<string, any>;
      currentMessage: { role: string; content: string };
    }) => {
      console.log('currentMessage==========3', currentParams);
      const { parameters, currentMessage } = currentParams;
      if (!parameters.model) return;
      try {
        setLoadingStatus(instanceId, true);
        setMessageId();

        controllerRef.current?.abort?.();
        controllerRef.current = new AbortController();
        const signal = controllerRef.current.signal;
        currentMessageRef.current = {
          ...currentMessage,
          uid: messageId.current
        };
        setMessageList((preList) => {
          return [
            ...preList,
            {
              ...currentMessageRef.current
            }
          ];
        });
        console.log('currentMessage==========4', messageList);
        const messages = _.map(
          [
            ...messageList,
            {
              ...currentMessageRef.current
            }
          ],
          (item: MessageItem) => {
            return {
              role: item.role,
              content: item.content,
              imgs: item.imgs || []
            };
          }
        );

        contentRef.current = '';
        // ====== payload =================
        const formatMessages = _.map(messages, (item: MessageItem) => {
          return {
            role: item.role,
            content: [
              {
                type: 'text',
                text: item.content
              },
              ..._.map(
                item.imgs,
                (img: { uid: string | number; dataUrl: string }) => {
                  return {
                    type: 'image_url',
                    image_url: {
                      url: img.dataUrl
                    }
                  };
                }
              )
            ]
          };
        });
        const chatParams = {
          messages: systemMessage
            ? [
                {
                  role: Roles.System,
                  content: [
                    {
                      type: 'text',
                      text: systemMessage
                    }
                  ]
                },
                ...formatMessages
              ]
            : [...formatMessages],
          ...parameters,
          stream: true
        };
        // ============== payload end ================
        const result = await fetchChunkedData({
          data: chatParams,
          url: CHAT_API,
          signal
        });

        if (!result) {
          return;
        }
        setMessageId();
        const { reader, decoder } = result;
        await readStreamData(reader, decoder, (chunk: any) => {
          joinMessage(chunk);
        });
        setLoadingStatus(instanceId, false);
      } catch (error) {
        setLoadingStatus(instanceId, false);
      }
    };
    const handleDropdownAction = useCallback(({ key }: { key: string }) => {
      if (key === 'clear') {
        setMessageList([]);
        setSystemMessage('');
      }
      if (key === 'viewCode') {
        setShow(true);
      }
    }, []);

    const handleSubmit = (currentMessage: {
      role: string;
      content: string;
    }) => {
      console.log('currentMessage==========2', currentMessage);
      submitMessage({ parameters: params, currentMessage });
    };

    const handleApplyToAllModels = (e: any) => {
      console.log('checkbox change:', e.target.checked);
      isApplyToAllModels.current = e.target.checked;
      if (e.target.checked) {
        setGlobalParams({
          ...params
        });
      }
    };

    const handleOnValuesChange = (
      changeValues: any,
      allValues: Record<string, any>
    ) => {
      console.log('value:', allValues, isApplyToAllModels.current);
      if (isApplyToAllModels.current) {
        setParams({
          ...params,
          ...allValues
        });
        setGlobalParams({
          ...allValues
        });
      } else {
        setParams({
          ...params,
          ...changeValues
        });
      }
    };

    const handleClearMessage = () => {
      setMessageList([]);
      setTokenResult(null);
      setSystemMessage('');
      currentMessageRef.current = {} as MessageItem;
      console.log('clear message', systemMessage);
    };

    const handleCloseViewCode = () => {
      setShow(false);
    };

    const handleModelChange = (value: string) => {
      setParams({
        ...params,
        model: value
      });
      handleClearMessage();
    };

    const handlePresetMessageList = (list: MessageItem[]) => {
      currentMessageRef.current = {} as MessageItem;
      const messages = _.map(
        list,
        (item: { role: string; content: string }) => {
          setMessageId();
          return {
            role: item.role,
            content: item.content,
            uid: messageId.current
          };
        }
      );
      setTokenResult(null);
      setMessageList(messages);
    };

    const handleDelete = () => {
      handleDeleteModel(instanceId);
    };

    const modelOptions = useMemo(() => {
      return modelList.filter((item) => {
        return item.type !== 'empty';
      });
    }, [modelList]);

    useEffect(() => {
      console.log('globalParams:', globalParams.model, globalParams);
      setParams({
        ...params,
        model: model,
        ...globalParams
      });
    }, [globalParams, model]);

    useEffect(() => {
      return () => {
        abortFetch();
      };
    }, []);

    useImperativeHandle(ref, () => {
      return {
        submit: handleSubmit,
        abortFetch,
        setMessageList,
        clear: handleClearMessage,
        presetPrompt: handlePresetMessageList,
        setSystemMessage,
        loading
      };
    });

    return (
      <div className="model-item">
        <div className="header">
          <span className="title">
            <Select
              style={{ minWidth: '100px' }}
              variant="borderless"
              options={modelOptions}
              onChange={handleModelChange}
              value={params.model}
            ></Select>
          </span>
          <ReferenceParams usage={tokenResult}></ReferenceParams>
          <span className="action">
            <Dropdown
              menu={{
                items: [
                  {
                    label: intl.formatMessage({ id: 'common.button.clear' }),
                    key: 'clear',
                    icon: <ClearOutlined />,
                    onClick: () => {
                      handleDropdownAction({ key: 'clear' });
                    }
                  },
                  {
                    label: intl.formatMessage({ id: 'playground.viewcode' }),
                    key: 'viewcode',
                    icon: <IconFont type="icon-code" />,
                    onClick: () => {
                      handleDropdownAction({ key: 'viewCode' });
                    }
                  }
                ]
              }}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined style={{ fontSize: '14px' }} />}
                size="small"
              ></Button>
            </Dropdown>
            <Popover
              content={
                <ParamsSettings
                  showModelSelector={false}
                  setParams={setParams}
                  globalParams={globalParams}
                  onValuesChange={handleOnValuesChange}
                />
              }
              trigger={['click']}
              arrow={false}
              fresh={true}
              title={
                <div>
                  <Checkbox onChange={handleApplyToAllModels}>
                    Apply to all models
                  </Checkbox>
                </div>
              }
            >
              <Button
                type="text"
                icon={<SettingOutlined />}
                size="small"
              ></Button>
            </Popover>
            {modelList.length > 2 && (
              <Button
                type="text"
                icon={<CloseOutlined />}
                size="small"
                onClick={handleDelete}
              ></Button>
            )}
          </span>
        </div>
        <SystemMessage
          systemMessage={systemMessage}
          setSystemMessage={setSystemMessage}
        ></SystemMessage>
        <SimpleBar style={{ maxHeight: maxHeight }}>
          <div className="content">
            <MessageContent
              spans={spans}
              messageList={messageList}
              setMessageList={setMessageList}
              editable={true}
            />
            <Spin
              spinning={!!loadingStatus[instanceId]}
              size="small"
              style={{ width: '100%' }}
            />
          </div>
        </SimpleBar>
        <ViewCodeModal
          open={show}
          systemMessage={systemMessage}
          messageList={messageList}
          parameters={params}
          onCancel={handleCloseViewCode}
          title={intl.formatMessage({ id: 'playground.viewcode' })}
        ></ViewCodeModal>
      </div>
    );
  }
);

export default React.memo(ModelItem);
