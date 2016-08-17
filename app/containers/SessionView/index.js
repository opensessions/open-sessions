import React from 'react';
import { parseSchedule } from 'utils/postgres';

import GoogleMapLoader from 'react-google-maps/lib/GoogleMapLoader';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';

import SocialShareIcons from 'components/SocialShareIcons';
import LoadingMessage from 'components/LoadingMessage';
import Sticky from 'components/Sticky';

import { Link } from 'react-router';

import { apiModel } from '../../utils/api';

import styles from './styles.css';

export default class SessionView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    user: React.PropTypes.object,
  }
  static propTypes = {
    params: React.PropTypes.object,
  }
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    this.fetchData();
  }
  getPrice() {
    let { price } = this.state.session;
    if (!price) return 'Free';
    if (price !== Math.floor(price)) {
      const minor = `0${Math.ceil((price % 1) * 100)}`.slice(-2);
      const major = Math.floor(price);
      price = `${major}.${minor}`;
    }
    return `£${price}`;
  }
  getState() {
    let { state } = this.state.session;
    if (state !== 'published') return <span className={styles.state}>({state})</span>;
    return null;
  }
  getTitle() {
    const { session } = this.state;
    return `${session.title ? session.title : '(Untitled)'}`;
  }
  fetchData = () => {
    apiModel.get('session', this.props.params.uuid).then((result) => {
      if (result.error) this.setState({ error: result.error });
      if (result.instance) this.setState({ session: result.instance });
    });
  }
  renderDate() {
    const { session } = this.state;
    const data = parseSchedule(session);
    if (!(data.date || data.time)) {
      return null;
    }
    let duration = null;
    if (data.duration) {
      duration = <span className={styles.duration}><img src="/images/clock.svg" role="presentation" />{data.duration}</span>;
    }
    return (<div className={styles.dateDetail}>
      <img src="/images/calendar.svg" role="presentation" />
      <span className={styles.detailText}>
        {data.date}
        <span className={styles.timespan}>at {data.time}</span>
        {duration}
      </span>
    </div>);
  }
  renderActions() {
    const user = this.context ? this.context.user : false;
    const session = this.state.session || {};
    const actions = [];
    if (user && user.user_id === session.owner) {
      actions.push(<Link to={`/session/${session.uuid}/edit`} className={styles.previewButton}>{session.state === 'published' ? 'Unpublish and edit' : 'Continue editing'}</Link>);
    }
    if (!actions.length) return null;
    return (<Sticky>
      <div className={styles.titleBar}>
        <div className={styles.titleInner}>
          <div>
            <h2>{session.state === 'published' ? 'Published session' : 'Preview'}</h2>
          </div>
          {actions}
        </div>
      </div>
    </Sticky>);
  }
  renderDetails() {
    const { session } = this.state;
    let organizerButton = null;
    if (session.Organizer) {
      organizerButton = <div className={styles.contactButton}><Link to={session.Organizer.href}>View organiser</Link></div>;
    }
    let locationDetail = null;
    if (session.location) {
      const locationPieces = session.location.split(',');
      let location = session.location;
      if (locationPieces.length > 1) {
        const firstLine = locationPieces.shift();
        location = <span className={styles.detailText}>{firstLine}<br />{locationPieces.join(',')}</span>;
      }
      locationDetail = (<div className={styles.locationDetail}>
        <img src="/images/map-pin.svg" role="presentation" />
        {location}
      </div>);
    }
    return (<div className={styles.detailsSection}>
      <div className={styles.detailsImg}>
        <img src="/images/placeholder.png" role="presentation" />
      </div>
      <div className={styles.detailsText}>
        <h1>{this.getTitle()}{this.getState()}</h1>
        {locationDetail}
        {this.renderDate()}
        <div className={styles.detailPrice}>
          <img src="/images/tag.svg" role="presentation" />
          <b>{this.getPrice()}</b>
        </div>
        {organizerButton}
      </div>
    </div>);
  }
  renderDescription() {
    const { session } = this.state;
    let meetingPoint = null;
    if (session.meetingPoint) {
      meetingPoint = (<div className={styles.infoSection}>
        <h3>Session meeting point</h3>
        <div className={styles.description}>
          {session.meetingPoint}
        </div>
      </div>);
    }
    let preparation = null;
    if (session.preparation) {
      preparation = (<div className={styles.infoSection}>
        <h3>What you'll need</h3>
        <div className={styles.description}>
          {session.preparation}
        </div>
      </div>);
    }
    return (<div className={styles.descriptionSection}>
      <div className={styles.mainCol}>
        <h2>Description</h2>
        <div className={styles.description}>
          {session.description || <i>This session has no description</i>}
        </div>
        {meetingPoint}
        {preparation}
      </div>
      <div className={styles.sideCol}>
        <div className={styles.info}>
          <h3>Pricing</h3>
          <div className={`${styles.floatingInfo} ${styles.pricing}`}>
            <span className={styles.label}>{session.attendanceType || 'General'}</span>
            <span className={styles.price}>
              <img src="/images/tag.svg" role="presentation" />
              {this.getPrice()}
            </span>
          </div>
        </div>
        <div className={styles.info}>
          <h3>Session Leader</h3>
          <div className={styles.floatingInfo}>
            {session.leader ? session.leader : 'No leader'}
          </div>
        </div>
        <div className={styles.info}>
          <h3>Organiser</h3>
          <div className={`${styles.floatingInfo} ${styles.organizerInfo}`}>
            <p>{session.Organizer ? (<Link to={session.Organizer.href}>{session.Organizer.name}</Link>) : 'No organizer'}</p>
            <p>{session.contactPhone ? (<a className={styles.organizerLink} href={`tel:${session.contactPhone}`}><img src="/images/phone.svg" role="presentation" /> {session.contactPhone}</a>) : ''}</p>
            <p>{session.contactEmail ? (<a className={styles.organizerLink} href={`mailto:${session.contactEmail}`}><img src="/images/email.png" role="presentation" /> {session.contactEmail}</a>) : ''}</p>
          </div>
        </div>
        <div className={styles.info}>
          <h3>Disability Support</h3>
          <div className={`${styles.floatingInfo} ${styles.disabilityInfo}`}>
            {session.abilityRestriction.map(ability => <p>{ability} <img src="/images/tick.svg" role="presentation" /></p>)}
          </div>
        </div>

      </div>
    </div>);
  }
  renderAbout() {
    const session = this.state.session;
    const features = [];
    const maps = {
      gender: {
        male: {
          text: 'Male Only',
          iconImg: '/images/male-selected.svg'
        },
        female: {
          text: 'Female Only',
          iconImg: '/images/female-selected.svg'
        },
        mixed: {
          text: 'Mixed Gender',
          iconImg: '/images/mixed-selected.svg'
        }
      }
    };
    if (session.genderRestriction) {
      features.push(maps.gender[session.genderRestriction]);
    }
    if (session.minAgeRestriction) {
      features.push({
        iconText: session.minAgeRestriction,
        text: 'Minimum Age'
      });
    }
    if (session.maxAgeRestriction) {
      features.push({
        iconText: session.maxAgeRestriction,
        text: 'Maximum Age'
      });
    }
    if (session.hasCoaching) {
      features.push({
        iconImg: '/images/coached.png',
        text: 'Coached'
      });
    }
    return (<div className={styles.aboutSection}>
      <div className={styles.inner}>
        <h2>About this session</h2>
        <ol>
          {features.map((feature) => {
            let icon = <span className={styles.iconText}>{feature.iconText}</span>;
            if (feature.iconImg) {
              icon = <span><img className={styles.iconImg} src={feature.iconImg} role="presentation" /><br /></span>;
            }
            return (<li key={feature.text}>
              {icon}
              {feature.text}
            </li>);
          })}
        </ol>
      </div>
    </div>);
  }
  renderMap() {
    const session = this.state.session;
    let map = null;
    if (!session.locationData) {
      map = (<div className={styles.noLocation}>
        <img src="/images/map-pin.svg" role="presentation" />
        No location data
      </div>);
    } else {
      const locData = JSON.parse(session.locationData);
      const defaultCenter = { lat: locData.lat, lng: locData.lng };
      const onMapClick = () => true;
      const marker = {
        position: defaultCenter,
        icon: { url: '/images/map-pin-active.svg' },
        defaultAnimation: 2
      };
      const googleMap = {
        ref: 'map',
        defaultZoom: 16,
        defaultCenter,
        onClick: onMapClick,
        options: { streetViewControl: false, scrollwheel: false }
      };
      map = (<div className={styles.mapFrame}>
        <GoogleMapLoader
          containerElement={<div style={{ height: '100%' }} />}
          googleMapElement={<GoogleMap {...googleMap}>
            <Marker {...marker} />
          </GoogleMap>}
        />
      </div>);
    }
    return (<section className={styles.mapSection}>
      {map}
    </section>);
  }
  renderShare() {
    const { title, href } = this.state.session;
    const link = `${window.location.origin}${href}`;
    return (<div className={styles.shareSection}>
      <div className={styles.inner}>
        Share this session
        <SocialShareIcons link={link} title={title} />
      </div>
    </div>);
  }
  render() {
    const topAttrs = { className: styles.sessionView };
    const { session, error } = this.state;
    if (error) return (<div {...topAttrs}><LoadingMessage message={error} /></div>);
    if (!session) return (<div {...topAttrs}><LoadingMessage message="Loading session" ellipsis /></div>);
    return (<div {...topAttrs}>
      {this.renderActions()}
      {this.renderDetails()}
      {this.renderShare()}
      {this.renderDescription()}
      {this.renderAbout()}
      {this.renderMap()}
    </div>);
  }
}
