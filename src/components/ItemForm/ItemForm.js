import { isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, reset, getFormSubmitErrors } from 'redux-form';
import { Col, Button, Row, TextField } from '@folio/stripes/components';
import { withStripes } from '@folio/stripes/core';

import ScanTotal from '../ScanTotal';
import ErrorModal from '../ErrorModal';

class ItemForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    patron: PropTypes.object,
    stripes: PropTypes.object,
    translate: PropTypes.func,
  };

  constructor() {
    super();

    this.clearForm = this.clearForm.bind(this);
    this.renderErrorModal = this.renderErrorModal.bind(this);
    this.barcodeEl = React.createRef();
  }

  componentDidMount() {
    if (this.props.patron) this.focusInput();
  }

  componentDidUpdate(prevProps) {
    if (this.props.submitSucceeded) this.focusInput();
    if (!this.props.patron || !this.props.patron.id) return;
    // Focus on the item barcode input after the patron is entered
    if (!prevProps.patron || prevProps.patron.id !== this.props.patron.id) {
      this.focusInput();
    }
  }

  getFormErrors() {
    const { stripes: { store } } = this.props;
    return getFormSubmitErrors('itemForm')(store.getState());
  }

  clearForm() {
    const { stripes: { store } } = this.props;
    store.dispatch(reset('itemForm'));
  }

  focusInput() {
    this.barcodeEl.current.getRenderedComponent().focusInput();
  }

  renderErrorModal() {
    const errors = this.getFormErrors();
    const error = errors.item || {};
    return (
      <ErrorModal open={!isEmpty(error)} onClose={this.clearForm} message={error.barcode} translate={this.props.translate} />
    );
  }

  render() {
    const { submitting, handleSubmit, translate } = this.props;
    const validationEnabled = false;
    return (
      <form id="item-form" onSubmit={handleSubmit}>
        <Row id="section-item">
          <Col xs={4}>
            <Field
              name="item.barcode"
              placeholder={translate('scanOrEnterItemBarcode')}
              aria-label={translate('itemId')}
              fullWidth
              id="input-item-barcode"
              component={TextField}
              ref={this.barcodeEl}
              withRef
              validationEnabled={validationEnabled}
            />
          </Col>
          <Col xs={2}>
            <Button
              id="clickable-add-item"
              type="submit"
              buttonStyle="primary"
              disabled={submitting}
            >
              {translate('enter')}
            </Button>
          </Col>
          {
            !isEmpty(this.props.patron) &&
            <Col xs={6}>
              <Row end="xs">
                <ScanTotal buttonId="clickable-done" {...this.props} translate={this.props.translate} />
              </Row>
            </Col>
          }
        </Row>
        {this.renderErrorModal()}
      </form>
    );
  }
}

export default reduxForm({
  form: 'itemForm',
})(withStripes(ItemForm));
