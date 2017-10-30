import React, { Component } from 'react';
import PropTypes from 'prop-types';
import JiraService from '../services/jiraService';
import { saveUserData } from '../services/userDataService';

class JiraSearchForm extends Component {
  static propTypes = {
    jiraService: PropTypes.instanceOf(JiraService).isRequired,
    onNewIssues: PropTypes.func.isRequired,
    settings: PropTypes.shape({
      defaultQuery: PropTypes.string
    })
  };

  static defaultProps = {
    settings: {}
  }

  constructor(props) {
    super(props);

    this.state = {
      query: this.props.settings.defaultQuery || '',
    };
  }

  runSearch(event) {
    event.preventDefault();

    const { query } = this.state;

    this.setState({ loading: true });
    this.props.jiraService.getQueryResults({ query }).then(results => {
      this.props.onNewIssues(results.issues);
      saveUserData({
        defaultQuery: query,
      });
      this.setState({ loading: false });
    }).catch(err => {
      this.setState({ loading: false });
    });
  }

  saveField(fieldName) {
    return (event) => {
      this.setState({ [fieldName]: event.target.value });
    };
  }

  render() {
    const { query, loading } = this.state;
    return (
      <form onSubmit={(...args) => this.runSearch(...args)}>
        <input type="text" onChange={this.saveField('query')} value={query} placeholder="JQL Query" />
        <button value="submit" disabled={loading}>List Issues</button>
      </form>
    );
  }
}

export default JiraSearchForm;
