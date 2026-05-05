import { Presentation, ExternalLink } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gh-bg-secondary border-b border-gh-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gh-accent/20 rounded-lg flex items-center justify-center">
              <Presentation className="w-6 h-6 text-gh-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gh-text flex items-center gap-2">
                척척발표
                <span className="text-xs px-2 py-0.5 bg-gh-purple/20 text-gh-purple rounded-full">
                  v0.1
                </span>
              </h1>
              <p className="text-xs text-gh-text-muted">
                Slide-Speech Alignment Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-gh-border hover:bg-gh-border transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-gh-text-muted" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gh-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 py-2 text-sm">
            <span className="text-gh-text-muted">슬라이드와 발화의</span>
            <span className="text-gh-accent font-semibold">정합성 분석</span>
            <span className="text-gh-text-muted">— "왜 그건 설명 안 했어?"라는 질문을 미리 예방합니다</span>
          </div>
        </div>
      </div>
    </header>
  );
}
