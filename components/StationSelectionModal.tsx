import React, { useState, useMemo } from 'react';
import type { Site, User } from '../types.ts';
import { useStore } from '../src/store/useStore.ts';
import { useI18n } from '../src/i18n/index.tsx';

interface StationSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (station: string) => void;
}

const StationSelectionModal: React.FC<StationSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
    const { t } = useI18n();
    const { currentUser, sites } = useStore(state => ({
        currentUser: state.currentUser!,
        sites: state.sites,
    }));

    const agentSite = useMemo(() => sites.find(s => s.id === currentUser.siteId), [sites, currentUser.siteId]);
    const availableExtensions = agentSite?.physicalExtensions || [];

    const [selectedStation, setSelectedStation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStation) {
            onSelect(selectedStation);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm">
                <div className="p-6 border-b dark:border-slate-700">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Sélectionner votre poste</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choisissez le poste que vous utiliserez pour cette session.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        {availableExtensions.map(ext => (
                            <label key={ext.number} className={`flex items-center p-3 rounded-md border-2 cursor-pointer ${selectedStation === ext.number ? 'border-primary bg-indigo-50 dark:bg-indigo-900/50' : 'border-slate-300 dark:border-slate-600'}`}>
                                <input type="radio" name="station" value={ext.number} checked={selectedStation === ext.number} onChange={e => setSelectedStation(e.target.value)} className="h-4 w-4 text-primary focus:ring-primary"/>
                                <span className="ml-3 font-medium text-slate-800 dark:text-slate-200">Poste {ext.number}</span>
                            </label>
                        ))}
                         {currentUser.useMobileAsStation && (
                            <label className={`flex items-center p-3 rounded-md border-2 cursor-pointer ${selectedStation === 'mobile' ? 'border-primary bg-indigo-50 dark:bg-indigo-900/50' : 'border-slate-300 dark:border-slate-600'}`}>
                                <input type="radio" name="station" value="mobile" checked={selectedStation === 'mobile'} onChange={e => setSelectedStation(e.target.value)} className="h-4 w-4 text-primary focus:ring-primary"/>
                                <span className="ml-3 font-medium text-slate-800 dark:text-slate-200">Poste Mobile ({currentUser.mobileNumber})</span>
                            </label>
                        )}
                    </div>
                    {availableExtensions.length === 0 && !currentUser.useMobileAsStation && (
                        <p className="text-center text-sm text-slate-500 italic">Aucune extension configurée pour votre site.</p>
                    )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 flex justify-end gap-2 rounded-b-lg border-t dark:border-slate-700">
                    <button type="button" onClick={onClose} className="border border-slate-300 bg-white px-4 py-2 rounded-md hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600">{t('common.cancel')}</button>
                    <button type="submit" disabled={!selectedStation} className="bg-primary text-primary-text px-4 py-2 rounded-md hover:bg-primary-hover disabled:opacity-50">Confirmer</button>
                </div>
            </form>
        </div>
    );
};

export default StationSelectionModal;