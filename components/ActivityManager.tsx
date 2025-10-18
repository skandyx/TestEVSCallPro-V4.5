import React, { useState } from 'react';
import type { Feature, ActivityType } from '../types.ts';
import { useI18n } from '../src/i18n/index.tsx';
import { useStore } from '../src/store/useStore.ts';

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; disabled?: boolean }> = ({ enabled, onChange, disabled }) => (
    <button type="button" onClick={() => !disabled && onChange(!enabled)} className={`${enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`} role="switch" aria-checked={enabled} disabled={disabled}>
        <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
    </button>
);

interface ActivityModalProps {
    activity: Partial<ActivityType> | null;
    onSave: (activity: Partial<ActivityType>) => void;
    onClose: () => void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ activity, onSave, onClose }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState<Partial<ActivityType>>(
        activity || { name: '', color: '#f97316', isActive: true }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b dark:border-slate-700">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{activity?.id ? t('activityManager.modal.editTitle') : t('activityManager.modal.newTitle')}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('activityManager.modal.name')}</label>
                        <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required className="mt-1 block w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-600"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('activityManager.modal.color')}</label>
                        <input type="color" value={formData.color || '#f97316'} onChange={e => setFormData(p => ({...p, color: e.target.value}))} className="mt-1 h-10 w-full p-1 border rounded-md" />
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 sm:flex sm:flex-row-reverse rounded-b-lg border-t dark:border-slate-700">
                    <button type="submit" className="inline-flex w-full justify-center rounded-md border bg-primary px-4 py-2 font-medium text-primary-text shadow-sm hover:bg-primary-hover sm:ml-3 sm:w-auto">{t('common.save')}</button>
                    <button type="button" onClick={onClose} className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:mt-0 sm:w-auto dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600">{t('common.cancel')}</button>
                </div>
            </form>
        </div>
    );
};

const ActivityManager: React.FC<{ feature: Feature }> = ({ feature }) => {
    const { t } = useI18n();
    const { activityTypes, saveOrUpdate, delete: deleteActivity, showConfirmation } = useStore(state => ({
        activityTypes: state.activityTypes,
        saveOrUpdate: state.saveOrUpdate,
        delete: state.delete,
        showConfirmation: state.showConfirmation,
    }));
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Partial<ActivityType> | null>(null);

    const handleSave = (activityData: Partial<ActivityType>) => {
        saveOrUpdate('activity-types', activityData);
        setIsModalOpen(false);
        setEditingActivity(null);
    };
    
    const handleDelete = (id: string) => {
        showConfirmation({
            title: t('alerts.confirmDeleteTitle'),
            message: t('activityManager.deleteConfirm'),
            onConfirm: () => deleteActivity('activity-types', id),
        });
    };

    const handleToggleActive = (activity: ActivityType) => {
        saveOrUpdate('activity-types', { ...activity, isActive: !activity.isActive });
    };

    return (
        <div className="h-full flex flex-col">
            {isModalOpen && <ActivityModal activity={editingActivity} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
            
            <header className="flex-shrink-0 mb-8">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t(feature.titleKey)}</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{t(feature.descriptionKey)}</p>
            </header>

             <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex-shrink-0 flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">{t('activityManager.title')}</h2>
                    <button onClick={() => { setEditingActivity(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-primary-text font-bold py-2 px-4 rounded-lg shadow-md inline-flex items-center">
                        <span className="material-symbols-outlined mr-2">add</span> {t('activityManager.addButton')}
                    </button>
                </div>
                
                 <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-white dark:bg-slate-800 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('activityManager.headers.status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('activityManager.headers.active')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{t('common.actions')}</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {activityTypes.map(activity => (
                                <tr key={activity.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: activity.color }}></span>
                                            <span className="font-medium text-slate-800 dark:text-slate-100">{activity.name}</span>
                                            {activity.isSystem && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full dark:bg-slate-700 dark:text-slate-300">{t('activityManager.systemStatus')}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <ToggleSwitch 
                                            enabled={activity.isActive ?? true} 
                                            onChange={() => handleToggleActive(activity)}
                                            disabled={activity.isSystem}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => { setEditingActivity(activity); setIsModalOpen(true); }} disabled={activity.isSystem} className="text-link hover:underline inline-flex items-center disabled:text-slate-400 disabled:cursor-not-allowed">
                                            <span className="material-symbols-outlined text-base mr-1">edit</span>{t('common.edit')}
                                        </button>
                                        <button onClick={() => handleDelete(activity.id)} disabled={activity.isSystem} className="text-red-600 hover:text-red-900 dark:hover:text-red-400 inline-flex items-center disabled:text-slate-400 disabled:cursor-not-allowed">
                                            <span className="material-symbols-outlined text-base mr-1">delete</span>{t('common.delete')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityManager;
