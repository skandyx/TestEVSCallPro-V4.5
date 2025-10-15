// FIX: Create content for ScriptFeature.tsx to resolve module error.
import React, { useState } from 'react';
import type { Feature, SavedScript } from '../types.ts';
// FIX: Corrected module import path by adding the '.ts' extension.
import { useStore } from '../src/store/useStore.ts';
import { useI18n } from '../src/i18n/index.tsx';
import ScriptBuilder from './ScriptBuilder.tsx';
import AgentPreview from './AgentPreview.tsx';

const ScriptFeature: React.FC<{ feature: Feature }> = ({ feature }) => {
    const { t } = useI18n();
    const { savedScripts, campaigns, saveOrUpdate, delete: deleteEntity, duplicate } = useStore(state => ({
        savedScripts: state.savedScripts,
        campaigns: state.campaigns,
        saveOrUpdate: state.saveOrUpdate,
        delete: state.delete,
        duplicate: state.duplicate,
    }));

    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingScript, setEditingScript] = useState<SavedScript | null>(null);
    const [previewScript, setPreviewScript] = useState<SavedScript | null>(null);

    const handleAddNew = () => {
        const newScript: SavedScript = {
            id: `script-${Date.now()}`,
            name: 'Nouveau Script',
            pages: [{ id: `page-${Date.now()}`, name: 'Page 1', blocks: [] }],
            startPageId: `page-${Date.now()}`,
            backgroundColor: '#f1f5f9',
        };
        setEditingScript(newScript);
        setIsBuilderOpen(true);
    };

    const handleEdit = (script: SavedScript) => {
        setEditingScript(script);
        setIsBuilderOpen(true);
    };

    const handleSave = (script: SavedScript) => {
        saveOrUpdate('scripts', script);
        setIsBuilderOpen(false);
        setEditingScript(null);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm(t('scriptFeature.confirmDelete'))) {
            deleteEntity('scripts', id);
        }
    };
    
    const handleDuplicate = (id: string) => {
        duplicate('scripts', id);
    };

    if (previewScript) {
        return <AgentPreview script={previewScript} onClose={() => setPreviewScript(null)} />;
    }
    
    if (isBuilderOpen && editingScript) {
        return <ScriptBuilder script={editingScript} onSave={handleSave} onClose={() => setIsBuilderOpen(false)} onPreview={setPreviewScript} />;
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t(feature.titleKey)}</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{t(feature.descriptionKey)}</p>
                </div>
                <button onClick={handleAddNew} className="bg-primary hover:bg-primary-hover text-primary-text font-bold py-2 px-4 rounded-lg shadow-md inline-flex items-center">
                    <span className="material-symbols-outlined mr-2">add</span>
                    {t('scriptFeature.addScript')}
                </button>
            </header>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <ul className="space-y-3">
                    {savedScripts.map(script => {
                        const assignedCampaigns = campaigns.filter(c => c.scriptId === script.id);
                        const isAssigned = assignedCampaigns.length > 0;
                        return (
                            <li key={script.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{script.name}</p>
                                    {isAssigned && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            <span className="font-semibold">{t('scriptFeature.usedBy')} </span>
                                            {assignedCampaigns.map(c => c.name).join(', ')}
                                        </p>
                                    )}
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => handleDuplicate(script.id)} title={t('common.duplicate')} className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"><span className="material-symbols-outlined">content_copy</span></button>
                                    <button onClick={() => handleEdit(script)} title={t('common.edit')} className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"><span className="material-symbols-outlined">edit</span></button>
                                    <button 
                                        onClick={() => handleDelete(script.id)} 
                                        title={isAssigned ? t('scriptFeature.deleteDisabledTooltip') : t('common.delete')} 
                                        className={`p-2 text-slate-500 ${isAssigned ? 'cursor-not-allowed text-slate-300 dark:text-slate-600' : 'hover:text-red-600 dark:hover:text-red-400'}`}
                                        disabled={isAssigned}
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
};

export default ScriptFeature;