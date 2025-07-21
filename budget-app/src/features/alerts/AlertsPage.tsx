import React, { useState } from 'react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { AlertRule } from '../../types/alerts';
import { deleteAlertRule } from '../../services/api';
import AlertRuleForm from './AlertRuleForm';
import NotificationPreferences from './NotificationPreferences';
import Skeleton from '../../components/Skeleton';

const AlertsPage: React.FC = () => {
  const { snapshot: rulesSnapshot, loading } = useFirestoreCollection('alertRules');
  const alertRules: AlertRule[] = rulesSnapshot ? rulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlertRule)) : [];

  const [editingRule, setEditingRule] = useState<AlertRule | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingRule(undefined);
    setIsFormOpen(true);
  };

  const handleFormSave = () => {
    setIsFormOpen(false);
    setEditingRule(undefined);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this alert rule?')) {
      await deleteAlertRule(id);
    }
  };

  return (
    <div>
      <h1>Alerts & Notifications</h1>

      <NotificationPreferences />

      <div className="card">
        <h2>Alert Rules</h2>
        <button onClick={handleAddNew}>Add New Rule</button>
        {loading ? (
          <ul className="mt-4">
            <li className="mb-2"><Skeleton className="h-8 w-full" /></li>
            <li className="mb-2"><Skeleton className="h-8 w-full" /></li>
            <li><Skeleton className="h-8 w-full" /></li>
          </ul>
        ) : (
          <ul>
            {alertRules.map((rule) => (
              <li key={rule.id}>
                <span>{rule.alertType} - {rule.isEnabled ? 'Enabled' : 'Disabled'}</span>
                <button onClick={() => handleEdit(rule)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(rule.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isFormOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsFormOpen(false)}>&times;</span>
            <AlertRuleForm rule={editingRule} onSave={handleFormSave} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;