import { Link } from 'react-router-dom';
import Icon from './Icon';

/**
 * Consistent back navigation for every sub-page. `to` is the parent route and
 * `label` names it, so the control says where it goes ("Course", "Home").
 * `tone="dark"` is for placing it on a dark header.
 */
export default function BackLink({ to, label, tone = 'light' }) {
  return (
    <Link className={'pageback' + (tone === 'dark' ? ' pageback--dark' : '')} to={to}>
      <Icon name="arrow-left" size={15} />
      <span>{label}</span>
    </Link>
  );
}
