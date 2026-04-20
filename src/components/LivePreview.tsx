import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

interface LivePreviewProps {
  code: string;
  viewportWidth?: number;
  onViewportChange?: (width: number) => void;
}

export function LivePreview({ code, viewportWidth = 1024, onViewportChange }: LivePreviewProps) {
  const viewports = [
    { name: '📱 모바일', width: 375 },
    { name: '📱 태블릿', width: 768 },
    { name: '🖥️ 데스크톱', width: 1024 },
  ];

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
        <div className="viewport-buttons">
          {viewports.map((vp) => (
            <button
              key={vp.width}
              className={`viewport-btn ${viewportWidth === vp.width ? 'viewport-btn--active' : ''}`}
              onClick={() => onViewportChange?.(vp.width)}
            >
              {vp.name}
            </button>
          ))}
        </div>
      </div>
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div className="preview-render" style={{ width: `${viewportWidth}px` }}>
            <ReactLivePreview />
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
