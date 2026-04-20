import { useState } from 'react';
import type { GeneratedComponent } from '../types';
import { LivePreview } from './LivePreview';
import { CodeView } from './CodeView';

interface ComponentCardProps {
  component: GeneratedComponent;
  onRemove: (id: string) => void;
  onRegenerate: (prompt: string) => void;
  isLoading: boolean;
}

type Tab = 'preview' | 'code';
type ViewportSize = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTHS: Record<ViewportSize, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
};

export function ComponentCard({ component, onRemove, onRegenerate, isLoading }: ComponentCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [previewKey, setPreviewKey] = useState(0);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');

  return (
    <div className="component-card">
      <div className="card-header">
        <p className="card-prompt">{component.prompt}</p>
        <div className="card-actions">
          <button
            className="btn-refresh"
            onClick={() => setPreviewKey((k) => k + 1)}
            title="미리보기 새로고침"
          >
            ↻
          </button>
          <button
            className="btn-regenerate"
            onClick={() => onRegenerate(component.prompt)}
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '재생성'}
          </button>
          <button
            className="btn-remove"
            onClick={() => onRemove(component.id)}
          >
            삭제
          </button>
        </div>
      </div>
      <div className="card-tabs">
        <button
          className={`tab ${activeTab === 'preview' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          미리보기
        </button>
        <button
          className={`tab ${activeTab === 'code' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          코드
        </button>
        {activeTab === 'preview' && (
          <div className="viewport-controls">
            {(['mobile', 'tablet', 'desktop'] as const).map((size) => (
              <button
                key={size}
                className={`viewport-btn ${viewportSize === size ? 'viewport-btn--active' : ''}`}
                onClick={() => setViewportSize(size)}
                title={`${size === 'mobile' ? '375px' : size === 'tablet' ? '768px' : '1024px'}`}
              >
                {size === 'mobile' ? '📱' : size === 'tablet' ? '📱' : '🖥️'}
                <span>{size === 'mobile' ? 'Mobile' : size === 'tablet' ? 'Tablet' : 'Desktop'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="card-content">
        {activeTab === 'preview' ? (
          <LivePreview
            key={previewKey}
            code={component.code}
            viewportWidth={VIEWPORT_WIDTHS[viewportSize]}
            onViewportChange={(width) => {
              const sizeKey = Object.entries(VIEWPORT_WIDTHS).find(([_, w]) => w === width)?.[0];
              if (sizeKey) setViewportSize(sizeKey as ViewportSize);
            }}
          />
        ) : (
          <CodeView code={component.code} />
        )}
      </div>
    </div>
  );
}
