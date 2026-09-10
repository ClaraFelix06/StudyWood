import React from 'react';
import { Palette, MoveUp, MoveDown, Eye, EyeOff, RotateCcw, Check, Sparkles } from 'lucide-react';
import { WidgetConfig, ThemeConfig } from '../types';

interface WidgetCustomizerProps {
  widgets: WidgetConfig[];
  theme: ThemeConfig;
  onToggleWidget: (id: string) => void;
  onMoveWidget: (index: number, direction: 'up' | 'down') => void;
  onResetWidgets: () => void;
}

export const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({
  widgets,
  theme,
  onToggleWidget,
  onMoveWidget,
  onResetWidgets,
}) => {
  const isDark = theme.mode === 'dark';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div 
        className="p-5 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? '#1c241e' : '#ffffff',
          borderColor: isDark ? '#2a382d' : '#e5e7eb',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-emerald-300">
              Personalização de Widgets da Tela Inicial
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Escolha quais blocos aparecem no seu painel principal e reordene os widgets conforme seu fluxo diário de estudos.
          </p>
        </div>

        <button
          onClick={onResetWidgets}
          className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Padrão</span>
        </button>
      </div>

      {/* Widget List for Reordering and Toggling */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {widgets.map((widget, index) => {
          return (
            <div
              key={widget.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 shadow-xs ${
                widget.enabled
                  ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                  : 'bg-stone-100/70 dark:bg-stone-950/60 border-stone-200/60 dark:border-stone-900 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-700 dark:text-stone-400">
                  {index + 1}
                </span>

                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {widget.title}
                  </h3>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    {widget.enabled ? 'Exibido no painel inicial' : 'Oculto na tela inicial'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                {/* Reorder Buttons */}
                <button
                  disabled={index === 0}
                  onClick={() => onMoveWidget(index, 'up')}
                  className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 transition-colors text-stone-600 dark:text-stone-400"
                  title="Mover para cima"
                >
                  <MoveUp className="w-4 h-4" />
                </button>

                <button
                  disabled={index === widgets.length - 1}
                  onClick={() => onMoveWidget(index, 'down')}
                  className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 transition-colors text-stone-600 dark:text-stone-400"
                  title="Mover para baixo"
                >
                  <MoveDown className="w-4 h-4" />
                </button>

                {/* Visibility Toggle */}
                <button
                  onClick={() => onToggleWidget(widget.id)}
                  className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold ${
                    widget.enabled
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                  title={widget.enabled ? 'Ocultar widget' : 'Ativar widget'}
                >
                  {widget.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="hidden sm:inline">{widget.enabled ? 'Ativo' : 'Oculto'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
