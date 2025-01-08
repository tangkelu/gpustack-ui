import useOverlayScroller from '@/hooks/use-overlay-scroller';
import React, { useEffect, useRef } from 'react';
import '../style/column-wrapper.less';

const ScrollerWrapper: React.FC<any> = ({ children, footer, height }) => {
  const { initialize } = useOverlayScroller();
  const { initialize: initializeParams } = useOverlayScroller();
  const scroller = useRef<any>(null);
  const scroller2 = useRef<any>(null);

  useEffect(() => {
    if (scroller.current) {
      initialize(scroller.current);
    }
  }, [scroller.current, initialize]);

  useEffect(() => {
    if (scroller2.current) {
      initializeParams(scroller2.current);
    }
  }, [scroller2.current, initializeParams]);

  return (
    <>
      {footer ? (
        <div
          className="scroller-wrapper-footer"
          style={{ height: height || '100%' }}
        >
          <div ref={scroller} className="scroller">
            {children}
          </div>
          {<div className="footer">{footer}</div>}
        </div>
      ) : (
        <div className="column-wrapper" style={{ height: height || '100%' }}>
          <div className="scroller" ref={scroller2}>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default ScrollerWrapper;
