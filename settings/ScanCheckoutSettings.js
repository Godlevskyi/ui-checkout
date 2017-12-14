import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Pane from '@folio/stripes-components/lib/Pane';
import Select from '@folio/stripes-components/lib/Select';
import Button from '@folio/stripes-components/lib/Button';

import { patronIdentifierTypes } from '../constants';

class ScanCheckoutSettings extends React.Component {
  static propTypes = {
    resources: PropTypes.object.isRequired,
    mutator: PropTypes.shape({
      userIdentifierPrefRecordId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      userIdentifierPref: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    userIdentifierPrefRecordId: {},
    userIdentifierPref: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=CHECKOUT and configName=pref_patron_identifier)',
      POST: {
        path: 'configurations/entries',
      },
      PUT: {
        path: 'configurations/entries/%{userIdentifierPrefRecordId}',
      },
    },
  });

  constructor(props) {
    super(props);
    this.onChangeIdentifier = this.onChangeIdentifier.bind(this);
    this.save = this.save.bind(this);
    this.state = { value: '' };
  }

  onChangeIdentifier(e) {
    const value = e.target.value;

    this.setState({ value });
  }

  save() {
    const prefRecord = this.props.resources.userIdentifierPref.records[0];
    const value = this.state.value;

    if (prefRecord) {
      if (prefRecord.metadata) delete prefRecord.metadata;
      // preference has been set previously, can proceed with update here
      this.props.mutator.userIdentifierPrefRecordId.replace(prefRecord.id);
      prefRecord.value = value;
      this.props.mutator.userIdentifierPref.PUT(prefRecord);
    } else {
      // no preference exists, so create a new one
      this.props.mutator.userIdentifierPref.POST(
        {
          module: 'CHECKOUT',
          configName: 'pref_patron_identifier',
          value,
        },
      );
    }
  }

  render() {
    const userIdentifierPref = this.props.resources.userIdentifierPref || {};
    const selectedIdentifier = userIdentifierPref.records || [];
    const prevValue = (selectedIdentifier.length === 0 ? '' : selectedIdentifier[0].value);
    const value = this.state.value || prevValue;

    const identifierTypeOptions = patronIdentifierTypes.map(i => (
      {
        id: i.key,
        label: i.label,
        value: i.key,
      }
    ));

    return (
      <Pane defaultWidth="fill" fluidContentWidth paneTitle="Scan ID">
        <Row>
          <Col xs={12}>
            <Select
              id="patronScanId"
              label="Scan ID for patron check out"
              placeholder="---"
              value={value}
              dataOptions={identifierTypeOptions}
              onChange={this.onChangeIdentifier}
            />
          </Col>
        </Row>

        <Row end="xs">
          <Col>
            <Button onClick={this.save} disabled={!value || userIdentifierPref.isPending || value === prevValue}>Save</Button>
          </Col>
        </Row>
      </Pane>
    );
  }

}

export default ScanCheckoutSettings;
