import React from 'react';
import { Link } from 'react-router';

import { apiFetch } from '../../utils/api';

import SessionTileView from '../SessionTileView';

import styles from './styles.css';

export default class OrganizerView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    organizer: React.PropTypes.object,
    params: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.state = {
      organizer: props.organizer || null,
    };
  }
  componentDidMount() {
    const self = this;
    let uuid;
    if (this.props.params && this.props.params.uuid) {
      uuid = this.props.params.uuid;
      apiFetch(`/api/organizer/${uuid}`).then((res) => {
        self.setState({ organizer: res.instance });
      });
    }
  }
  renderSessions() {
    const organizer = this.state.organizer;
    if (!organizer) return null;
    if (!organizer.Sessions.length) return <p>No sessions</p>;
    return (<ol className={styles.sessionsList}>
      {organizer.Sessions.map((session) => (<li key={session.uuid}><SessionTileView session={session} /></li>))}
    </ol>);
  }
  renderOrganizer() {
    const organizer = this.state.organizer;
    if (!organizer) return null;
    return (<div>
      <h1 className={styles.title}>Organizer: <Link to={organizer.href}>{organizer.name}</Link></h1>
    </div>);
  }
  render() {
    return (
      <div className={styles.container}>
        {this.renderOrganizer()}
        {this.renderSessions()}
      </div>
    );
  }
}
