import { WarningFilled } from '@ant-design/icons';
import { Typography } from 'antd';
import React from 'react';
import './block.less';

interface AlertInfoProps {
  type: 'danger' | 'warning';
  message: string;
  rows?: number;
  icon?: React.ReactNode;
  ellipsis?: boolean;
  style?: React.CSSProperties;
  title?: React.ReactNode;
}

const AlertInfo: React.FC<AlertInfoProps> = (props) => {
  const { message, type, rows = 1, ellipsis, style, title } = props;

  return (
    <>
      {message ? (
        <Typography.Paragraph
          className="alert-info-block"
          ellipsis={
            ellipsis !== undefined
              ? ellipsis
              : {
                  rows: rows,
                  tooltip: message
                }
          }
          style={{
            textAlign: 'center',
            borderRadius: 'var(--border-radius-base)',
            margin: 0,
            border: `1px solid ${type === 'danger' ? 'var(--ant-color-error-border)' : 'var(--ant-color-warning-border)'}`,
            backgroundColor:
              type === 'danger'
                ? 'var(--ant-color-error-bg)'
                : 'var(--ant-color-warning-bg)',
            ...style
          }}
        >
          <div
            className="title"
            style={{
              backgroundColor:
                type === 'danger'
                  ? 'var(--ant-color-error-bg-hover)'
                  : 'var(--ant-color-warning-bg-hover)'
            }}
          >
            <WarningFilled
              className="m-r-8"
              style={{
                color:
                  type === 'danger'
                    ? 'var(--ant-color-error)'
                    : 'var(--ant-color-warning)'
              }}
            />
            <span className="text">{title}</span>
          </div>
          {message}
        </Typography.Paragraph>
      ) : null}
    </>
  );
};

export default React.memo(AlertInfo);
