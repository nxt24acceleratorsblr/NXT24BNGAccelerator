import './ProgressTracker.css';
import type { AgentTask } from '../types';

interface ProgressTrackerProps {
  tasks: AgentTask[];
  currentStep: number;
}

const ProgressTracker = ({ tasks, currentStep }: ProgressTrackerProps) => {
  const getStatusIcon = (status: AgentTask['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'running':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  const getStatusClass = (status: AgentTask['status']) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'running':
        return 'running';
      case 'error':
        return 'error';
      default:
        return 'pending';
    }
  };

  return (
    <div className="progress-tracker">
      <h3 className="progress-title">Campaign Generation Progress</h3>
      <div className="tasks-list">
        {tasks.map((task) => (
          <div key={task.id} className={`task-item ${getStatusClass(task.status)}`}>
            <div className="task-header">
              <span className="task-icon">{getStatusIcon(task.status)}</span>
              <div className="task-info">
                <h4 className="task-name">{task.name}</h4>
                <p className="task-description">{task.description}</p>
              </div>
              <span className="task-status">{task.status}</span>
            </div>
            {task.status === 'running' && (
              <div className="task-progress-bar">
                <div className="task-progress-fill"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
