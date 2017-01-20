import React, { PropTypes } from 'react';

import SessionTileView from '../SessionTileView';

import SessionMap from '../../components/SessionMap';
import LoadingMessage from '../../components/LoadingMessage';
import PagedList from '../../components/PagedList';
import Button from '../../components/Button';
import Checkbox from '../../components/Fields/Checkbox';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

const toDate = date => date.toISOString().substr(0, 10);

export default class ListSessions extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    notify: PropTypes.func,
    store: PropTypes.object,
    router: PropTypes.object
  };
  static propTypes = {
    location: PropTypes.object,
    params: PropTypes.object
  };
  static fetchData(dispatch, query) {
    return apiModel.search('session', { ...query, state: 'published' }).then(result => {
      const { instances, error } = result;
      if (error) throw error;
      dispatch({ type: 'SESSION_LIST_LOADED', payload: instances });
    });
  }
  constructor(props) {
    super();
    this.state = { isLoading: false, showExpired: true, isMap: props.location.pathname.indexOf('map') !== -1 };
  }
  componentDidMount() {
    this.fetchData(this.context.store.dispatch, this.props.location.query);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      this.fetchData(this.context.store.dispatch, nextProps.location.query);
    }
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.setState({ isMap: nextProps.location.pathname.indexOf('map') !== -1 });
    }
  }
  fetchData(dispatch, query) {
    this.setState({ isLoading: true }); // eslint-disable-line react/no-did-mount-set-state
    this.constructor.fetchData(dispatch, query).then(() => {
      this.setState({ isLoading: false });
    }).catch(error => {
      this.context.notify(error, 'error');
    });
  }
  renderFilters() {
    const now = new Date();
    const filters = [
      { search: '', name: 'All' },
      { search: `?updatedAt=${toDate(now)}`, name: 'Updated today' },
      { search: `?updatedAt=${toDate(new Date((new Date()).setDate(now.getDate() - 1)))}`, name: 'Updated yesterday' },
      { search: `?updatedAt=${toDate(new Date((new Date()).setDate(now.getDate() - 7)))}:${toDate(now)}`, name: 'Updated within last week' }
    ];
    const { search } = this.props.location;
    const { showExpired, isMap } = this.state;
    return (<div className={styles.filters}>
      <p>Filters - {filters.map(filter => <Button to={`/sessions${filter.search}`} style={search === filter.search ? 'live' : false}>{filter.name}</Button>)}</p>
      {filters.some(filter => filter.search === search) ? null : (<p>
        Current filters - {search.slice(1).split('&').map(v => v.split('=')).map(([key, val]) => {
          const changeVal = () => {
            const newVal = prompt(`Change ${key}:`, val);
            if (newVal) this.context.router.push(`/sessions${search.replace(`${key}=${val}`, `${key}=${newVal}`)}`);
          };
          return <span>{key}: <Button style={['slim', 'live']} onClick={() => changeVal()}>{val}</Button> <Button style={['slim', 'danger']} to={`/sessions${search.replace(new RegExp(`[\?&]?${key}=${val}`), '')}`}>x</Button></span>;
        })}
      </p>)}
      <p>
        <Checkbox checked={showExpired} onChange={checked => this.setState({ showExpired: checked })} label="Show expired sessions" />
        &nbsp;&nbsp;<Checkbox checked={isMap} onChange={checked => this.setState({ isMap: checked })} label="View on map" />
      </p>
    </div>);
  }
  renderView() {
    const { params } = this.props;
    const { isLoading, isMap, showExpired } = this.state;
    let sessions = this.context.store.getState().get('sessionList');
    if (!showExpired) sessions = sessions.filter(session => session.sortedSchedule.length && (new Date(session.sortedSchedule[session.sortedSchedule.length - 1].start)).getTime() > Date.now());
    const page = (params && params.page) ? parseInt(params.page, 10) : 1;
    if (isLoading) return <LoadingMessage message="Loading sessions" ellipsis />;
    if (isMap) return <SessionMap sessions={sessions} />;
    return <PagedList items={sessions} page={page} newUrl={pg => `/sessions/${pg}${this.props.location.search}`} Component={SessionTileView} itemToProps={item => ({ session: item })} noneMessage={`No sessions ${this.props.location.search ? 'for this search' : ''}`} />;
  }
  render() {
    return (<div className={styles.list}>
      {this.renderFilters()}
      {this.renderView()}
    </div>);
  }
}
