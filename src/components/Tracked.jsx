import { Link } from 'react-router-dom';
import { reachGoal } from '../utils/metrika';

export function TrackedExternalLink({ href, children, className, goalName, channel, ...props }) {
  const handleClick = () => {
    const g = goalName || (channel === 'vk' ? 'OPEN_VK_GROUP' : channel === 'telegram' ? 'OPEN_TELEGRAM' : channel === 'max' ? 'OPEN_MAX_CHANNEL' : null);
    if (g) reachGoal(g, { channel, href });
    if (channel) reachGoal('CONTACT_CHANNEL_CLICK', { channel, href });
  };
  return (
    <a href={href} className={className} onClick={handleClick} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

export function TrackedLink({ to, children, className, goal, ...props }) {
  const handleClick = () => { if (goal) reachGoal(goal, { to }); };
  return <Link to={to} className={className} onClick={handleClick} {...props}>{children}</Link>;
}

export function TrackedButton({ as: Tag = 'button', children, className, goal, onClick, ...props }) {
  const handleClick = (e) => { if (goal) reachGoal(goal); if (onClick) onClick(e); };
  return <Tag className={className} onClick={handleClick} {...props}>{children}</Tag>;
}